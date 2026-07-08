const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

const saleInclude = {
  user: { select: { id: true, name: true } },
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
};

async function createSale({ customerName, customerPhone, saleDate, items }, userId) {
  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== new Set(productIds).size) {
    throw new AppError('One or more products were not found.', 400);
  }

  const itemsWithSubtotal = items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.unitPrice,
  }));
  const totalAmount = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        userId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        saleDate: saleDate || new Date(),
        totalAmount,
        items: { create: itemsWithSubtotal },
      },
    });

    for (const item of itemsWithSubtotal) {
      // Atomic guard: only decrements if enough stock is available
      const result = await tx.product.updateMany({
        where: { id: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });

      if (result.count === 0) {
        const product = products.find((p) => p.id === item.productId);
        throw new AppError(
          `Insufficient stock for "${product?.name || item.productId}". Available: ${
            product?.quantity ?? 0
          }, requested: ${item.quantity}.`,
          400
        );
      }

      const updatedProduct = await tx.product.findUnique({ where: { id: item.productId } });

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          type: 'SALE',
          quantityChange: -item.quantity,
          resultingQuantity: updatedProduct.quantity,
          referenceId: created.id,
          userId,
        },
      });
    }

    return created;
  });

  return prisma.sale.findUnique({ where: { id: sale.id }, include: saleInclude });
}

async function getAllSales() {
  return prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: saleInclude,
  });
}

async function getSaleById(id) {
  const sale = await prisma.sale.findUnique({ where: { id }, include: saleInclude });
  if (!sale) {
    throw new AppError('Sale not found.', 404);
  }
  return sale;
}

module.exports = { createSale, getAllSales, getSaleById };
