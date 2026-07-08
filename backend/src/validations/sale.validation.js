const { z } = require('zod');

const saleItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().nonnegative('Unit price must be 0 or greater'),
});

const createSaleSchema = z.object({
  customerName: z.string().trim().max(150).optional().or(z.literal('')),
  customerPhone: z.string().trim().max(20).optional().or(z.literal('')),
  saleDate: z.coerce.date().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
});

module.exports = { createSaleSchema };
