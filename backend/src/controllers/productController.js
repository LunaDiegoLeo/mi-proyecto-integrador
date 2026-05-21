// src/controllers/productController.js
const Product = require('../models/Product');
const { Op } = require('sequelize');

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

const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    const productsWithAvailability = products.map(product => ({
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      disponibilidad: product.disponibilidad,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: productsWithAvailability,
      count: productsWithAvailability.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

const getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;

    const product = await Product.findByPk(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        disponibilidad: product.disponibilidad,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const { name, description, price } = req.body;

    const product = await Product.findByPk(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;

    await product.update(updateData);
    await product.reload();

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
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
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { sku } = req.params;

    const product = await Product.findByPk(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: {
        sku: product.sku
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const { sku } = req.params;
    const { stock } = req.body;

    const product = await Product.findByPk(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.update({ stock });
    await product.reload();

    return res.status(200).json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: {
        sku: product.sku,
        name: product.name,
        stock: product.stock,
        disponibilidad: product.disponibilidad
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el stock',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductBySku,
  updateProduct,
  deleteProduct,
  updateStock
};