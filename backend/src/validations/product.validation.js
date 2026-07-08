const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  sku: z.string().trim().min(1, 'SKU is required').max(50),
  description: z.string().trim().max(500).optional(),
  unit: z.string().trim().max(20).optional(),
  costPrice: z.coerce.number().nonnegative('Cost price must be 0 or greater'),
  sellingPrice: z.coerce.number().nonnegative('Selling price must be 0 or greater'),
  quantity: z.coerce.number().int().nonnegative().optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  expiryDate: z.coerce.date().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  supplierId: z.string().uuid('Invalid supplier ID').optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
