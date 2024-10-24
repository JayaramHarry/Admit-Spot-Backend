// global.d.ts
import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

// This line ensures the file is treated as a module.
export {};
