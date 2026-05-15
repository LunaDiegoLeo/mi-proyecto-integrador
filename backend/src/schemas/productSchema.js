// src/schemas/productSchema.js
const { z } = require('zod');

const productSchema = z.object({
  sku: z.string().min(1, 'SKU es obligatorio'),
  name: z.string().min(1, 'Nombre es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor que 0'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0')
});

module.exports = { productSchema };