'use server';

// ============================================================================
// STOK HAREKETİ YÖNETİMİ - SERVER ACTION
// ============================================================================
// Stok giriş/çıkış, transfer, atık, hasarlı ürünleri yönetme

import { prisma } from '@/lib/db';
import { StockMovementSchema } from '@/types/requests';
import { StockMovementInput } from '@/types';
import { ValidationError, NotFoundError } from '@/types/errors';
import { validateUserRole } from '@/lib/utils/auth';
import { auditLog } from '@/lib/utils/audit';

export async function createStockMovement(
  data: StockMovementInput,
  userId: string
) {
  try {
    // ============================================================================
    // ADIM 1: YETKİ KONTROL
    // ============================================================================
    await validateUserRole(userId, [
      'WAREHOUSE_MANAGER',
      'PRODUCTION_MANAGER',
      'SUPER_ADMIN',
    ]);

    // ============================================================================
    // ADIM 2: VERİ VALİDASYONU
    // ============================================================================
    const validatedData = StockMovementSchema.parse(data);

    // ============================================================================
    // ADIM 3: ÜRÜN KONTROL
    // ============================================================================
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      throw new NotFoundError(`Ürün bulunamadı: ${validatedData.productId}`, 'Product');
    }

    // ============================================================================
    // ADIM 4: STOK MİKTARINI GÜNCELLE
    // ============================================================================
    let newStock = product.currentStock;

    switch (validatedData.movementType) {
      case 'PURCHASE':
      case 'PRODUCTION_OUTPUT':
        newStock += validatedData.quantity;
        break;

      case 'SALES':
      case 'PRODUCTION_INPUT':
      case 'DAMAGE':
      case 'EXPIRED':
        if (product.currentStock < validatedData.quantity) {
          throw new ValidationError(
            `Yeterli stok yok. Mevcut: ${product.currentStock}, İstenen: ${validatedData.quantity}`
          );
        }
        newStock -= validatedData.quantity;
        break;

      case 'RETURN':
        newStock += validatedData.quantity;
        break;

      case 'TRANSFER':
        // Transfer başka bir fonksiyonla işlenecek
        newStock -= validatedData.quantity;
        break;

      case 'ADJUSTMENT':
        // Uyarlamada miktar pozitif veya negatif olabilir
        newStock += validatedData.quantity;
        break;
    }

    // ============================================================================
    // ADIM 5: STOK HAREKETİNİ KAYDET
    // ============================================================================
    const stockMovement = await prisma.stockMovement.create({
      data: {
        productId: validatedData.productId,
        movementType: validatedData.movementType,
        quantity: validatedData.quantity,
        warehouseId: validatedData.warehouseId,
        referenceType: validatedData.referenceType,
        referenceId: validatedData.referenceId,
        notes: validatedData.notes,
      },
    });

    // ============================================================================
    // ADIM 6: ÜRÜN STOĞUNU GÜNCELLE
    // ============================================================================
    await prisma.product.update({
      where: { id: validatedData.productId },
      data: {
        currentStock: newStock,
      },
    });

    // ============================================================================
    // ADIM 7: UYARI KONTROL
    // ============================================================================
    if (newStock <= product.minStockLevel) {
      console.warn(
        `[STOK UYARISI] ${product.name} kritik stok seviyesinde!`,
        `Mevcut: ${newStock}, Minimum: ${product.minStockLevel}`
      );
      // İleride webhook/notification gönderimi eklenecek
    }

    // ============================================================================
    // ADIM 8: AUDİT LOGU
    // ============================================================================
    await auditLog({
      userId,
      action: 'CREATE',
      entity: 'StockMovement',
      entityId: stockMovement.id,
      changes: JSON.stringify({
        before: { currentStock: product.currentStock },
        after: { currentStock: newStock },
      }),
    });

    return {
      success: true,
      data: {
        movementId: stockMovement.id,
        previousStock: product.currentStock,
        newStock,
      },
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('[createStockMovement] Hata:', error);
    return {
      success: false,
      error: 'Stok hareketi kaydedilemedi',
    };
  }
}

// ============================================================================
// STOK UYARILARINI GETIR (Kritik, Uyarı, Normal, Fazla)
// ============================================================================

export async function getStockAlerts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        name: true,
        currentStock: true,
        minStockLevel: true,
        maxStockLevel: true,
      },
    });

    const alerts = products.map((product) => {
      let status: 'critical' | 'warning' | 'normal' | 'overstock';

      if (product.currentStock <= product.minStockLevel) {
        status = 'critical';
      } else if (product.currentStock <= product.minStockLevel * 1.5) {
        status = 'warning';
      } else if (product.currentStock >= product.maxStockLevel) {
        status = 'overstock';
      } else {
        status = 'normal';
      }

      return {
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
        status,
      };
    });

    return {
      success: true,
      data: alerts.filter((a) => a.status !== 'normal'),
      summary: {
        critical: alerts.filter((a) => a.status === 'critical').length,
        warning: alerts.filter((a) => a.status === 'warning').length,
        overstock: alerts.filter((a) => a.status === 'overstock').length,
      },
    };
  } catch (error) {
    console.error('[getStockAlerts] Hata:', error);
    return {
      success: false,
      error: 'Stok uyarıları alınamadı',
    };
  }
}

// ============================================================================
// DEPO ENVANTERİ RAPORU
// ============================================================================

export async function getWarehouseInventory(warehouseId: string) {
  try {
    const stockLocations = await prisma.stockLocation.findMany({
      where: { warehouseId },
      include: {
        warehouse: true,
      },
      orderBy: { currentQuantity: 'desc' },
    });

    const totalItems = stockLocations.reduce((sum, loc) => sum + loc.currentQuantity, 0);
    const maxCapacity = stockLocations.reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0);
    const utilization = maxCapacity > 0 ? (totalItems / maxCapacity) * 100 : 0;

    return {
      success: true,
      data: {
        warehouseId,
        warehouseName: stockLocations[0]?.warehouse?.name || 'Unknown',
        totalItems,
        maxCapacity,
        utilization: Math.round(utilization),
        locations: stockLocations,
      },
    };
  } catch (error) {
    console.error('[getWarehouseInventory] Hata:', error);
    return {
      success: false,
      error: 'Depo envanteri alınamadı',
    };
  }
}
