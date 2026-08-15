// ============================================================================
// YETKILENDIRME (AUTHORIZATION) UTILITELERI
// ============================================================================

import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '@/types/errors';

/**
 * Kullanıcı rolünü doğrula
 * @param userId Kullanıcı ID'si
 * @param allowedRoles İzin verilen roller
 * @throws UnauthorizedError veya ForbiddenError
 */
export async function validateUserRole(
  userId: string,
  allowedRoles: UserRole[]
): Promise<void> {
  if (!userId) {
    throw new UnauthorizedError('Kullanıcı kimliği gereklidir');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new UnauthorizedError('Kullanıcı bulunamadı');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Kullanıcı hesabı devre dışıdır');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Bu işlemi gerçekleştirmek için ${allowedRoles.join(', ')} rolü gereklidir`
    );
  }
}

/**
 * RBAC izin kontrolü
 */
export const rolePermissions: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'], // Tüm izinler
  FIELD_REP: [
    'visit:create',
    'visit:read',
    'order:create',
    'order:read',
    'customer:read',
    'product:read',
  ],
  PRODUCTION_MANAGER: [
    'production:read',
    'production:update',
    'stock:read',
    'stock:adjust',
    'bom:read',
  ],
  WAREHOUSE_MANAGER: [
    'stock:read',
    'stock:create',
    'stock:update',
    'warehouse:read',
    'warehouse:update',
  ],
  ACCOUNTING: [
    'order:read',
    'invoice:read',
    'invoice:create',
    'payment:read',
    'payment:create',
    'report:read',
  ],
  CUSTOMER_SERVICE: [
    'customer:read',
    'customer:update',
    'order:read',
    'shipment:read',
    'visit:read',
  ],
};

/**
 * İzin kontrolü
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

/**
 * Müşteri erişim kontrolü (Saha temsilcisi, kendisine atanan müşterileri görebilir)
 */
export async function canAccessCustomer(
  userId: string,
  customerId: string,
  role: UserRole
): Promise<boolean> {
  if (role === 'SUPER_ADMIN') return true;

  if (role === 'FIELD_REP') {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { assignedToId: true },
    });

    return customer?.assignedToId === userId;
  }

  return true; // Diğer roller tüm müşterileri görebilir
}
