const asyncHandler = require('../utils/asyncHandler');
const purchaseService = require('../services/purchase.service');

const create = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchase(req.body, req.user.id);
  res.status(201).json({ success: true, message: 'Purchase recorded.', data: purchase });
});

const getAll = asyncHandler(async (req, res) => {
  const purchases = await purchaseService.getAllPurchases();
  res.status(200).json({ success: true, data: purchases });
});

const getById = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(req.params.id);
  res.status(200).json({ success: true, data: purchase });
});

module.exports = { create, getAll, getById };
