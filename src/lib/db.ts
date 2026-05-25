import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // For Vercel serverless:
  // - DATABASE_URL should be the pooled URL (e.g. with ?pgbouncer=true)
  // - DATABASE_URL_UNPOOLED is for direct connections (used by prisma migrate)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db