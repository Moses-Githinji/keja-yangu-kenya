import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };

// Helper function to get a new Prisma Client instance
// Use this when you need to ensure a fresh connection
export const getPrismaClient = () => {
  return new PrismaClient();
};

// Export the Prisma types
export * from '@prisma/client';
