const asyncHandler = require('../utils/asyncHandler');
const productInsightService = require('../services/productInsight.service');

const generate = asyncHandler(async (req, res) => {
  const result = await productInsightService.generateProductInsights(req.params.id);
  res.status(200).json({ success: true, data: result });
});

module.exports = { generate };
