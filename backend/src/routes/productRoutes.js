// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getAllProducts, 
  getProductBySku,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');
const validateInput = require('../middlewares/validateInput');
const { productSchema, updateProductSchema, updateStockSchema } = require('../schemas/productSchema');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos con búsqueda opcional
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o SKU (insensible a mayúsculas)
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/{sku}:
 *   get:
 *     summary: Obtener un producto por SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:sku', getProductBySku);

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

/**
 * @swagger
 * /api/products/{sku}:
 *   put:
 *     summary: Actualizar datos generales de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto (no modificable)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 description: Precio del producto (debe ser mayor que 0)
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:sku', validateInput(updateProductSchema), updateProduct);

/**
 * @swagger
 * /api/products/{sku}/stock:
 *   patch:
 *     summary: Actualizar el stock de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *                 description: Nueva cantidad en inventario (debe ser mayor o igual a 0)
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *       400:
 *         description: Stock inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:sku/stock', validateInput(updateStockSchema), updateStock);

/**
 * @swagger
 * /api/products/{sku}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:sku', deleteProduct);

module.exports = router;