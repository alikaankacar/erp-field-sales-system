// ============================================================================
// AUDİT LOGGING UTILITELERI
// ============================================================================

import { prisma } from '@/lib/db';

export interface AuditLogInput {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  entity: string; // Order, Customer, Product, etc.
  entityId: string;
  changes: string; // JSON string
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit log kaydı oluştur
 * Sistem operasyonlarının izini tutar
 */
export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        changes: input.changes,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error('[auditLog] Audit kaydı oluşturulamadı:', error);
    // Audit log başarısız olsa bile uygulamayı durdurmayız
  }
}

/**
 * Belirli bir varlığın değişiklik geçmişini getir
 */
export async function getEntityAuditHistory(
  entity: string,
  entityId: string,
  limit: number = 50
) {
  try {
    const history = await prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        changes: true,
        createdAt: true,
        userId: true,
      },
    });

    return history.map((log) => ({
      ...log,
      changes: JSON.parse(log.changes),
    }));
  } catch (error) {
    console.error('[getEntityAuditHistory] Hata:', error);
    return [];
  }
}

/**
 * Kullanıcı aktivitelerini getir
 */
export async function getUserActivityLog(
  userId: string,
  limit: number = 100,
  startDate?: Date
) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: startDate ? { gte: startDate } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('[getUserActivityLog] Hata:', error);
    return [];
  }
}
