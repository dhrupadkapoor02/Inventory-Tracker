const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

async function createCategory(data) {
  const existing = await prisma.category.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new AppError('A category with this name already exists.', 409);
  }
  return prisma.category.create({ data });
}

async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

async function getCategoryById(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found.', 404);
  }
  return category;
}

async function updateCategory(id, data) {
  await getCategoryById(id);

  if (data.name) {
    const existing = await prisma.category.findUnique({ where: { name: data.name } });
    if (existing && existing.id !== id) {
      throw new AppError('A category with this name already exists.', 409);
    }
  }

  return prisma.category.update({ where: { id }, data });
}

async function deleteCategory(id) {
  await getCategoryById(id);

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new AppError(
      'Cannot delete a category that still has products assigned to it.',
      400
    );
  }

  await prisma.category.delete({ where: { id } });
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
