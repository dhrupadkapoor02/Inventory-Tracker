const { z } = require('zod');

const purchaseItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  unitCost: z.coerce.number().nonnegative('Unit cost must be 0 or greater'),
});

const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  purchaseDate: z.coerce.date().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

module.exports = { createPurchaseSchema };
