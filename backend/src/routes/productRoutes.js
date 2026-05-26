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
 * tags:
 *   name: Products
 *   description: Gestión de productos e inventario
 */

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
 *         description: Búsqueda por nombre o SKU (insensible a mayúsculas y minúsculas)
 *         example: laptop
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         example: PROD-001
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *                 example: PROD-001
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *                 example: Laptop Dell Inspiron
 *               description:
 *                 type: string
 *                 description: Descripción opcional del producto
 *                 example: Laptop 15 pulgadas, 8GB RAM, 256GB SSD
 *               price:
 *                 type: number
 *                 description: Precio del producto (debe ser mayor que 0)
 *                 example: 899.99
 *               stock:
 *                 type: integer
 *                 description: Cantidad en inventario (debe ser mayor o igual a 0)
 *                 example: 10
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El SKU ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateInput(productSchema), createProduct);

/**
 * @swagger
 * /api/products/{sku}:
 *   put:
 *     summary: Actualizar datos generales de un producto (nombre, descripción, precio)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto (no modificable)
 *         example: PROD-001
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
 *                 example: Laptop Dell Inspiron 15
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *                 example: Laptop 15.6 pulgadas, 16GB RAM, 512GB SSD
 *               price:
 *                 type: number
 *                 description: Precio del producto (debe ser mayor que 0)
 *                 example: 999.99
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         example: PROD-001
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
 *                 example: 25
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Stock actualizado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     sku:
 *                       type: string
 *                       example: PROD-001
 *                     name:
 *                       type: string
 *                       example: Laptop Dell Inspiron
 *                     stock:
 *                       type: integer
 *                       example: 25
 *                     disponibilidad:
 *                       type: string
 *                       example: disponible
 *       400:
 *         description: Stock inválido (valor negativo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:sku/stock', validateInput(updateStockSchema), updateStock);

/**
 * @swagger
 * /api/products/{sku}:
 *   delete:
 *     summary: Eliminar un producto del catálogo
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del producto a eliminar
 *         example: PROD-001
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto eliminado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     sku:
 *                       type: string
 *                       example: PROD-001
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:sku', deleteProduct);

module.exports = router;