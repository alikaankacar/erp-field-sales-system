'use server';

// ============================================================================
// ÜRETİM TAKIBI - SERVER ACTION
// ============================================================================
// Üretim siparişleri, üretim aşamaları, kalite kontrol, fotoğraf kanıtı

import { prisma } from '@/lib/db';
import { UpdateProductionStageSchema } from '@/types/requests';
import { ProductionMetrics } from '@/types';
import { ValidationError, NotFoundError } from '@/types/errors';
import { validateUserRole } from '@/lib/utils/auth';
import { auditLog } from '@/lib/utils/audit';
import { createStockMovement } from './stockMovement';

export async function updateProductionStage(
  data: unknown,
  userId: string
) {
  try {
    // ============================================================================
    // ADIM 1: YETKİ KONTROL
    // ============================================================================
    await validateUserRole(userId, ['PRODUCTION_MANAGER', 'SUPER_ADMIN']);

    // ============================================================================
    // ADIM 2: VERİ VALİDASYONU
    // ============================================================================
    const validatedData = UpdateProductionStageSchema.parse(data);

    // ============================================================================
    // ADIM 3: ÜRETİM AŞAMASINI KONTROL ET
    // ============================================================================
    const stage = await prisma.productionStage.findUnique({
      where: { id: validatedData.stageId },
      include: {
        productionOrder: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!stage) {
      throw new NotFoundError(`Üretim aşaması bulunamadı: ${validatedData.stageId}`);
    }

    // ============================================================================
    // ADIM 4: DURUM GEÇIŞINI KONTROL ET
    // ============================================================================
    const validTransitions: Record<string, string[]> = {
      PENDING: ['IN_PROGRESS', 'PAUSED'],
      IN_PROGRESS: ['COMPLETED', 'QUALITY_FAILED', 'PAUSED'],
      PAUSED: ['IN_PROGRESS', 'COMPLETED'],
      QUALITY_FAILED: ['IN_PROGRESS'], // Tekrar işlenebilir
      COMPLETED: [],
      REJECTED: [],
    };

    if (
      stage.status !== validatedData.status &&
      !validTransitions[stage.status]?.includes(validatedData.status)
    ) {
      throw new ValidationError(
        `${stage.status} durumundan ${validatedData.status} durumuna geçiş yapılamaz`
      );
    }

    // ============================================================================
    // ADIM 5: AŞAMAYI GÜNCELLE
    // ============================================================================
    const updatedStage = await prisma.productionStage.update({
      where: { id: validatedData.stageId },
      data: {
        status: validatedData.status,
        outputQuantity:
          validatedData.status === 'COMPLETED'
            ? validatedData.outputQuantity
            : stage.outputQuantity,
        wasteQuantity: validatedData.wasteQuantity ?? stage.wasteQuantity,
        notes: validatedData.notes,
        startedAt: stage.status === 'PENDING' ? new Date() : stage.startedAt,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : stage.completedAt,
      },
    });

    // ============================================================================
    // ADIM 6: SON AŞAMA İSE STOKU GÜNCELLE
    // ============================================================================
    if (validatedData.status === 'COMPLETED') {
      const lastStageNumber = Math.max(
        ...stage.productionOrder.stages.map((s) => s.stageNumber)
      );

      if (stage.stageNumber === lastStageNumber) {
        // Son aşama tamamlandı = stoka ekle
        const outputQty = validatedData.outputQuantity || stage.inputQuantity || 0;

        await createStockMovement(
          {
            productId: stage.productionOrder.product.id,
            movementType: 'PRODUCTION_OUTPUT',
            quantity: outputQty,
            referenceType: 'ProductionOrder',
            referenceId: stage.productionOrder.id,
            notes: `Üretim tamamlandı: ${stage.productionOrder.productionNumber}`,
          },
          userId
        );

        // Üretim siparişini tamamla
        await prisma.productionOrder.update({
          where: { id: stage.productionOrder.id },
          data: {
            completedQuantity: outputQty,
            actualEndDate: new Date(),
          },
        });
      }
    }

    // ============================================================================
    // ADIM 7: AUDİT LOGU
    // ============================================================================
    await auditLog({
      userId,
      action: 'UPDATE',
      entity: 'ProductionStage',
      entityId: validatedData.stageId,
      changes: JSON.stringify({
        before: { status: stage.status },
        after: { status: updatedStage.status },
      }),
    });

    return {
      success: true,
      data: updatedStage,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('[updateProductionStage] Hata:', error);
    return {
      success: false,
      error: 'Üretim aşaması güncellenemedi',
    };
  }
}

// ============================================================================
// ÜRETİM AŞAMALARINI KANBANLı GÖR
// ============================================================================

export async function getProductionKanban() {
  try {
    const stages = await prisma.productionStage.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'QUALITY_FAILED'],
        },
      },
      include: {
        productionOrder: {
          include: {
            product: true,
            order: {
              include: {
                customer: true,
              },
            },
          },
        },
        photos: true,
      },
      orderBy: {
        productionOrder: {
          plannedStartDate: 'asc',
        },
      },
    });

    // Kanban kartlarını duruma göre grupla
    const kanban = {
      PENDING: stages.filter((s) => s.status === 'PENDING'),
      IN_PROGRESS: stages.filter((s) => s.status === 'IN_PROGRESS'),
      COMPLETED: stages.filter((s) => s.status === 'COMPLETED'),
      QUALITY_FAILED: stages.filter((s) => s.status === 'QUALITY_FAILED'),
    };

    return {
      success: true,
      data: kanban,
    };
  } catch (error) {
    console.error('[getProductionKanban] Hata:', error);
    return {
      success: false,
      error: 'Üretim Kanban alınamadı',
    };
  }
}

// ============================================================================
// ÜRETİM METRİKLERİ (KPI)
// ============================================================================

export async function getProductionMetrics(): Promise<{
  success: boolean;
  data?: ProductionMetrics;
  error?: string;
}> {
  try {
    const [totalOrders, completedOrders, inProgressOrders] = await Promise.all([
      prisma.productionOrder.count(),
      prisma.productionOrder.count({
        where: {
          actualEndDate: {
            not: null,
          },
        },
      }),
      prisma.productionOrder.count({
        where: {
          actualStartDate: {
            not: null,
          },
          actualEndDate: null,
        },
      }),
    ]);

    // Ortalama üretim süresi (gün)
    const completedWithDates = await prisma.productionOrder.findMany({
      where: {
        actualStartDate: { not: null },
        actualEndDate: { not: null },
      },
      select: {
        actualStartDate: true,
        actualEndDate: true,
      },
    });

    const avgLeadTime =
      completedWithDates.length > 0
        ? completedWithDates.reduce((sum, order) => {
            const days =
              (order.actualEndDate!.getTime() - order.actualStartDate!.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedWithDates.length
        : 0;

    // Genel verim (çıktı / girdi)
    const stageData = await prisma.productionStage.groupBy({
      by: ['productionOrderId'],
      _sum: {
        inputQuantity: true,
        outputQuantity: true,
        wasteQuantity: true,
      },
    });

    const totalInput = stageData.reduce((sum, s) => sum + (s._sum.inputQuantity || 0), 0);
    const totalOutput = stageData.reduce((sum, s) => sum + (s._sum.outputQuantity || 0), 0);
    const totalWaste = stageData.reduce((sum, s) => sum + (s._sum.wasteQuantity || 0), 0);

    const overallYield = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;
    const rejectionRate = totalOutput > 0 ? (totalWaste / totalOutput) * 100 : 0;

    return {
      success: true,
      data: {
        totalOrders,
        completedOrders,
        inProgressOrders,
        averageLeadTime: Math.round(avgLeadTime * 100) / 100,
        overallYield: Math.round(overallYield * 100) / 100,
        rejectionRate: Math.round(rejectionRate * 100) / 100,
      },
    };
  } catch (error) {
    console.error('[getProductionMetrics] Hata:', error);
    return {
      success: false,
      error: 'Üretim metriklerine erişilemedi',
    };
  }
}
