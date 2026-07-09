const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  res.status(200).json({ success: true, data: summary });
});

module.exports = { getSummary };
