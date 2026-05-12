// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Rutas
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;