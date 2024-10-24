// utils/db.ts
import { PrismaClient } from '@prisma/client';

// Use the singleton pattern for Prisma Client
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma; // No casting needed now
}

export default prisma;
