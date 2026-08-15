import { PrismaClient } from '@prisma/client';

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================
// Vercel, Netlify gibi serverless ortamlarda connection pool'u optimal
// kullanmak için singleton pattern kullanıyoruz.
// Local development'ta sıcak reload'lar sırasında birden fazla instance
// oluşturulmasını önlüyor.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
