const prisma = require('../config/db');

async function getSummary() {
  const [totalProducts, totalCategories, totalSuppliers, products] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.supplier.count(),
    prisma.product.findMany({
      select: { quantity: true, costPrice: true, reorderLevel: true, expiryDate: true },
    }),
  ]);

  const now = new Date();
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const lowStockCount = products.filter((p) => p.quantity <= p.reorderLevel).length;
  const expiringCount = products.filter(
    (p) => p.expiryDate && p.expiryDate >= now && p.expiryDate <= in7Days
  ).length;
  const expiredCount = products.filter((p) => p.expiryDate && p.expiryDate < now).length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.costPrice),
    0
  );

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [salesAgg, purchasesAgg] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { saleDate: { gte: thirtyDaysAgo } },
    }),
    prisma.purchase.aggregate({
      _sum: { totalAmount: true },
      where: { purchaseDate: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalSuppliers,
    lowStockCount,
    expiringCount,
    expiredCount,
    inventoryValue,
    salesLast30Days: Number(salesAgg._sum.totalAmount) || 0,
    purchasesLast30Days: Number(purchasesAgg._sum.totalAmount) || 0,
  };
}

module.exports = { getSummary };
