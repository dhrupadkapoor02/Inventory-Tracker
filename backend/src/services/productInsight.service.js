const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const aiService = require('./ai.service');

const LOOKBACK_DAYS = 90;

async function computeStats(product) {
  const lookbackDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const saleItems = await prisma.saleItem.findMany({
    where: { productId: product.id, sale: { saleDate: { gte: lookbackDate } } },
    select: { quantity: true },
  });

  const totalSoldLast90Days = saleItems.reduce((sum, item) => sum + item.quantity, 0);
  const avgDailySales = totalSoldLast90Days / LOOKBACK_DAYS;
  const daysOfStockLeft = avgDailySales > 0 ? product.quantity / avgDailySales : null;

  const costPrice = Number(product.costPrice);
  const sellingPrice = Number(product.sellingPrice);
  const margin = sellingPrice - costPrice;
  const marginPercent = costPrice > 0 ? (margin / costPrice) * 100 : 0;

  return { totalSoldLast90Days, avgDailySales, daysOfStockLeft, margin, marginPercent };
}

function buildPrompt(product, stats) {
  return `You are an inventory management assistant for a small business. Based ONLY on the data below, return a JSON object with EXACTLY these five keys: "reorderSuggestion", "storageRecommendation", "expiryObservation", "inventoryAdvice", "marginObservation". Each value must be a concise, practical 1-2 sentence recommendation in plain English. Do not invent any numbers or facts that are not given below. Respond with raw JSON only - no markdown, no code fences, no extra commentary.

Product name: ${product.name}
SKU: ${product.sku}
Category: ${product.category.name}
Unit of measure: ${product.unit}
Current stock: ${product.quantity} ${product.unit}
Reorder level (threshold): ${product.reorderLevel} ${product.unit}
Cost price: Rs. ${product.costPrice}
Selling price: Rs. ${product.sellingPrice}
Margin: Rs. ${stats.margin.toFixed(2)} (${stats.marginPercent.toFixed(1)}%)
Expiry date: ${product.expiryDate ? new Date(product.expiryDate).toDateString() : 'No expiry date set'}
Units sold in the last ${LOOKBACK_DAYS} days: ${stats.totalSoldLast90Days}
Average daily sales: ${stats.avgDailySales.toFixed(2)} ${product.unit}/day
Estimated days of stock remaining at current sales pace: ${
    stats.daysOfStockLeft !== null ? stats.daysOfStockLeft.toFixed(0) : 'Unknown - no recent sales recorded'
  }`;
}

async function generateProductInsights(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { name: true } },
      supplier: { select: { name: true } },
    },
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const stats = await computeStats(product);
  const prompt = buildPrompt(product, stats);
  const insights = await aiService.generateJson(prompt);

  return { insights, stats };
}

module.exports = { generateProductInsights };
