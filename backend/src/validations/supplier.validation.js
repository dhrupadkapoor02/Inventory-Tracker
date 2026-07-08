const { z } = require('zod');

const createSupplierSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
});

const updateSupplierSchema = createSupplierSchema.partial();

module.exports = { createSupplierSchema, updateSupplierSchema };
