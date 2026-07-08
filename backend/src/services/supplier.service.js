const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

// Normalize empty-string optional fields to null before persisting
function normalize(data) {
  const cleaned = { ...data };
  ['email', 'phone', 'address'].forEach((key) => {
    if (cleaned[key] === '') cleaned[key] = null;
  });
  return cleaned;
}

async function createSupplier(data) {
  return prisma.supplier.create({ data: normalize(data) });
}

async function getAllSuppliers() {
  return prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

async function getSupplierById(id) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    throw new AppError('Supplier not found.', 404);
  }
  return supplier;
}

async function updateSupplier(id, data) {
  await getSupplierById(id);
  return prisma.supplier.update({ where: { id }, data: normalize(data) });
}

async function deleteSupplier(id) {
  await getSupplierById(id);
  // Products keep existing via onDelete: SetNull on Product.supplierId
  await prisma.supplier.delete({ where: { id } });
}

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
