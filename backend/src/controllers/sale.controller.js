const asyncHandler = require('../utils/asyncHandler');
const saleService = require('../services/sale.service');

const create = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale(req.body, req.user.id);
  res.status(201).json({ success: true, message: 'Sale recorded.', data: sale });
});

const getAll = asyncHandler(async (req, res) => {
  const sales = await saleService.getAllSales();
  res.status(200).json({ success: true, data: sales });
});

const getById = asyncHandler(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.id);
  res.status(200).json({ success: true, data: sale });
});

module.exports = { create, getAll, getById };
