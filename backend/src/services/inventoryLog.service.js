const prisma = require('../config/db');

const logInclude = {
  product: { select: { id: true, name: true, sku: true } },
  user: { select: { id: true, name: true } },
};

async function getAllLogs({ productId, type } = {}) {
  return prisma.inventoryLog.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: logInclude,
  });
}

module.exports = { getAllLogs };
