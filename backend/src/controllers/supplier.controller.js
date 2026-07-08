const asyncHandler = require('../utils/asyncHandler');
const supplierService = require('../services/supplier.service');

const create = asyncHandler(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json({ success: true, message: 'Supplier created.', data: supplier });
});

const getAll = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getAllSuppliers();
  res.status(200).json({ success: true, data: suppliers });
});

const getById = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.id);
  res.status(200).json({ success: true, data: supplier });
});

const update = asyncHandler(async (req, res) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Supplier updated.', data: supplier });
});

const remove = asyncHandler(async (req, res) => {
  await supplierService.deleteSupplier(req.params.id);
  res.status(200).json({ success: true, message: 'Supplier deleted.' });
});

module.exports = { create, getAll, getById, update, remove };
