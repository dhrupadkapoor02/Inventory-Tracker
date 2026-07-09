const asyncHandler = require('../utils/asyncHandler');
const productService = require('../services/product.service');

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, message: 'Product created.', data: product });
});

const getAll = asyncHandler(async (req, res) => {
  const { page, limit, search, categoryId, supplierId } = req.query;
  const result = await productService.getAllProducts({ page, limit, search, categoryId, supplierId });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const getLowStock = asyncHandler(async (req, res) => {
  const products = await productService.getLowStockProducts();
  res.status(200).json({ success: true, data: products });
});

const getExpiring = asyncHandler(async (req, res) => {
  const days = req.query.days || 7;
  const products = await productService.getExpiringProducts(days);
  res.status(200).json({ success: true, data: products });
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Product updated.', data: product });
});

const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted.' });
});

module.exports = { create, getAll, getLowStock, getExpiring, getById, update, remove };
