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

async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: productInclude,
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
  getProductById,
  updateProduct,
  deleteProduct,
};
