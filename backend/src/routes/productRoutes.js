// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { createProduct } = require('../controllers/productController');
const validateInput = require('../middlewares/validateInput');
const { productSchema } = require('../schemas/productSchema');

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Registrar un nuevo producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               sku:
 *                 type: string
 *                 description: Código único del producto
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción opcional del producto
 *               price:
 *                 type: number
 *                 description: Precio del producto (debe ser mayor que 0)
 *               stock:
 *                 type: integer
 *                 description: Cantidad en inventario (debe ser mayor o igual a 0)
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El SKU ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateInput(productSchema), createProduct);

module.exports = router;