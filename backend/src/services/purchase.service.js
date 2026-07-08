const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

const purchaseInclude = {
  supplier: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
};

async function createPurchase({ supplierId, purchaseDate, items }, userId) {
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    throw new AppError('Supplier not found.', 400);
  }

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== new Set(productIds).size) {
    throw new AppError('One or more products were not found.', 400);
  }

  const itemsWithSubtotal = items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.unitCost,
  }));
  const totalAmount = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.purchase.create({
      data: {
        supplierId,
        userId,
        purchaseDate: purchaseDate || new Date(),
        totalAmount,
        items: { create: itemsWithSubtotal },
      },
    });

    for (const item of itemsWithSubtotal) {
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          type: 'PURCHASE',
          quantityChange: item.quantity,
          resultingQuantity: updatedProduct.quantity,
          referenceId: created.id,
          userId,
        },
      });
    }

    return created;
  });

  return prisma.purchase.findUnique({ where: { id: purchase.id }, include: purchaseInclude });
}

async function getAllPurchases() {
  return prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' },
    include: purchaseInclude,
  });
}

async function getPurchaseById(id) {
  const purchase = await prisma.purchase.findUnique({ where: { id }, include: purchaseInclude });
  if (!purchase) {
    throw new AppError('Purchase not found.', 404);
  }
  return purchase;
}

module.exports = { createPurchase, getAllPurchases, getPurchaseById };
