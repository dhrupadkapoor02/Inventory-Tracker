const asyncHandler = require('../utils/asyncHandler');
const inventoryLogService = require('../services/inventoryLog.service');

const getAll = asyncHandler(async (req, res) => {
  const { productId, type } = req.query;
  const logs = await inventoryLogService.getAllLogs({ productId, type });
  res.status(200).json({ success: true, data: logs });
});

module.exports = { getAll };
