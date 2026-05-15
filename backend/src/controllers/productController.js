// src/controllers/productController.js
const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const { sku, name, description, price, stock } = req.body;

    const product = await Product.create({
      sku,
      name,
      description,
      price,
      stock
    });

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        disponibilidad: product.disponibilidad
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'El SKU ya existe en el sistema'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  createProduct
};