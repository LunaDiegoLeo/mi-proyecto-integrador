// src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  sku: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  disponibilidad: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.stock > 0 ? 'disponible' : 'no disponible';
    }
  }
}, {
  timestamps: true,
  tableName: 'products'
});

module.exports = Product;