'use server';

// ============================================================================
// HIZLI SİPARİŞ OLUŞTURMA - SERVER ACTION
// ============================================================================
// Saha temsilcisinin mobil/tablet üzerinden hızlı sipariş girişi
// Barkod okuma, dinamik fiyatlandırma, iskonto

import { prisma } from '@/lib/db';
import { CreateOrderSchema } from '@/types/requests';
import { QuickOrderResponse } from '@/types';
import { ValidationError, NotFoundError } from '@/types/errors';
import { calculateOrderTotals } from '@/lib/utils/pricing';
import { validateUserRole } from '@/lib/utils/auth';
import { auditLog } from '@/lib/utils/audit';
import { generateOrderNumber } from '@/lib/utils/generators';
import { createStockMovement } from './stockMovement';

export async function quickOrderCreate(
  data: unknown,
  userId: string
): Promise<QuickOrderResponse> {
  try {
    // ============================================================================
    // ADIM 1: YETKİ KONTROL
    // ============================================================================
    await validateUserRole(userId, ['FIELD_REP', 'SUPER_ADMIN']);

    // ============================================================================
    // ADIM 2: VERİ VALİDASYONU
    // ============================================================================
    const validatedData = CreateOrderSchema.parse(data);

    // ============================================================================
    // ADIM 3: REFERANS KONTROL
    // ============================================================================
    const [customer, fieldRep] = await Promise.all([
      prisma.customer.findUnique({
        where: { id: validatedData.customerId },
      }),
      prisma.user.findUnique({
        where: { id: validatedData.fieldRepId },
      }),
    ]);

    if (!customer) {
      throw new NotFoundError(`Müşteri bulunamadı: ${validatedData.customerId}`, 'Customer');
    }

    if (!fieldRep) {
      throw new NotFoundError(`Saha temsilcisi bulunamadı: ${validatedData.fieldRepId}`, 'User');
    }

    // ============================================================================
    // ADIM 4: ÜRÜN BİLGİLERİNİ KONTROL ET
    // ============================================================================
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: validatedData.items.map((item) => item.productId),
        },
      },
    });

    if (products.length !== validatedData.items.length) {
      throw new NotFoundError('Bazı ürünler bulunamadı', 'Product');
    }

    // ============================================================================
    // ADIM 5: DİNAMİK FİYATLANDIRMA VE STOK KONTROL
    // ============================================================================
    const orderItems = await Promise.all(
      validatedData.items.map(async (item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new NotFoundError('Ürün bulunamadı');

        // Müşteriye özel fiyat listesini kontrol et
        const priceListItem = await prisma.priceListItem.findFirst({
          where: {
            product: {
              id: item.productId,
            },
            priceList: {
              assignments: {
                some: {
                  customerId: validatedData.customerId,
                },
              },
            },
          },
          orderBy: {
            priceList: {
              assignments: {
                _count: 'desc',
              },
            },
          },
        });

        const unitPrice = priceListItem?.price ?? item.unitPrice;

        // Stok kontrolü
        if (product.currentStock < item.quantity) {
          throw new ValidationError(
            `${product.name} için yeterli stok yok. Mevcut: ${product.currentStock}, İstenen: ${item.quantity}`
          );
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discountPercentage: item.discountPercentage || 0,
        };
      })
    );

    // ============================================================================
    // ADIM 6: SİPARİŞ TUTARINI HESAPLA
    // ============================================================================
    const orderTotals = calculateOrderTotals(
      orderItems,
      validatedData.discountPercentage || 0
    );

    // Kredi limitini kontrol et
    const projectedDebt = customer.currentDebt + orderTotals.totalAmount;
    if (projectedDebt > customer.creditLimit) {
      throw new ValidationError(
        `Kredi limitini aşacaktır. Mevcut borç: ${customer.currentDebt}, Limit: ${customer.creditLimit}`
      );
    }

    // ============================================================================
    // ADIM 7: SİPARİŞ OLUŞTUR
    // ============================================================================
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: validatedData.customerId,
        fieldRepId: validatedData.fieldRepId,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        subtotal: orderTotals.subtotal,
        discountAmount: orderTotals.discountAmount,
        discountPercentage: validatedData.discountPercentage || 0,
        taxAmount: orderTotals.taxAmount,
        totalAmount: orderTotals.totalAmount,
        shippingAddress: validatedData.shippingAddress || customer.addressStreet,
        shippingCity: validatedData.shippingCity || customer.addressCity,
        shippingProvince: validatedData.shippingProvince || customer.addressProvince,
        shippingPostalCode: validatedData.shippingPostalCode || customer.addressPostalCode,
        deliveryDate: validatedData.deliveryDate,
        notes: validatedData.notes,
        items: {
          createMany: {
            data: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercentage: item.discountPercentage,
              discountAmount: (item.unitPrice * item.quantity * item.discountPercentage) / 100,
              totalPrice:
                item.unitPrice * item.quantity * (1 - item.discountPercentage / 100),
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });

    // ============================================================================
    // ADIM 8: STOK REZERV ET
    // ============================================================================
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          reservedStock: {
            increment: item.quantity,
          },
        },
      });
    }

    // ============================================================================
    // ADIM 9: MÜŞTERİ İSTATİSTİKLERİNİ GÜNCELLE
    // ============================================================================
    await prisma.customer.update({
      where: { id: validatedData.customerId },
      data: {
        totalOrders: {
          increment: 1,
        },
        totalPurchaseAmount: {
          increment: orderTotals.totalAmount,
        },
        averageOrderValue:
          (customer.totalPurchaseAmount + orderTotals.totalAmount) /
          (customer.totalOrders + 1),
        lastOrderDate: new Date(),
      },
    });

    // ============================================================================
    // ADIM 10: AUDİT LOGU
    // ============================================================================
    await auditLog({
      userId,
      action: 'CREATE',
      entity: 'Order',
      entityId: order.id,
      changes: JSON.stringify({
        before: null,
        after: order,
      }),
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: orderTotals.totalAmount,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('[quickOrderCreate] Beklenmeyen hata:', error);
    return {
      success: false,
      error: 'Sipariş oluşturulurken bir hata oluştu',
    };
  }
}

// ============================================================================
// BARKOD İLE ÜRÜN ARAMA
// ============================================================================

export async function searchProductByBarcode(barcode: string) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { barcode },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!variant) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }

    return {
      success: true,
      data: {
        productId: variant.product.id,
        productName: variant.product.name,
        sku: variant.sku,
        barcode: variant.barcode,
        basePrice: variant.product.basePrice,
        stock: variant.stock,
        image: variant.product.images[0]?.url,
        attributes: variant.attributes,
      },
    };
  } catch (error) {
    console.error('[searchProductByBarcode] Hata:', error);
    return {
      success: false,
      error: 'Ürün araması başarısız oldu',
    };
  }
}
