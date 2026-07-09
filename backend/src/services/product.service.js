const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

async function assertCategoryExists(categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError('Category not found.', 400);
  }
}

async function assertSupplierExists(supplierId) {
  if (!supplierId) return;
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    throw new AppError('Supplier not found.', 400);
  }
}

async function assertSkuAvailable(sku, excludeId = null) {
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing && existing.id !== excludeId) {
    throw new AppError('A product with this SKU already exists.', 409);
  }
}

const productInclude = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
};

async function createProduct(data) {
  await assertSkuAvailable(data.sku);
  await assertCategoryExists(data.categoryId);
  await assertSupplierExists(data.supplierId);

  return prisma.product.create({ data, include: productInclude });
}

const MAX_LIMIT = 1000;

async function getAllProducts({ page = 1, limit = 10, search, categoryId, supplierId } = {}) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(supplierId ? { supplierId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

// Prisma can't compare two columns (quantity vs reorderLevel) in a where clause,
// so we fetch and filter in JS - acceptable at this project's scale.
async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { quantity: 'asc' },
  });
  return products.filter((p) => p.quantity <= p.reorderLevel);
}

async function getExpiringProducts(days = 7) {
  const now = new Date();
  const future = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);

  return prisma.product.findMany({
    where: { expiryDate: { not: null, gte: now, lte: future } },
    include: productInclude,
    orderBy: { expiryDate: 'asc' },
  });
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }
  return product;
}

async function updateProduct(id, data) {
  await getProductById(id);

  if (data.sku) await assertSkuAvailable(data.sku, id);
  if (data.categoryId) await assertCategoryExists(data.categoryId);
  if (data.supplierId) await assertSupplierExists(data.supplierId);

  return prisma.product.update({ where: { id }, data, include: productInclude });
}

async function deleteProduct(id) {
  await getProductById(id);
  await prisma.product.delete({ where: { id } });
}

module.exports = {
  createProduct,
  getAllProducts,
  getLowStockProducts,
  getExpiringProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
