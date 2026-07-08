const asyncHandler = require('../utils/asyncHandler');
const categoryService = require('../services/category.service');

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, message: 'Category created.', data: category });
});

const getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({ success: true, data: categories });
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Category updated.', data: category });
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted.' });
});

module.exports = { create, getAll, getById, update, remove };
