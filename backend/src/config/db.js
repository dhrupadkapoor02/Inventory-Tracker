const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// Prevent multiple PrismaClient instances in development (hot-reload safe)
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
