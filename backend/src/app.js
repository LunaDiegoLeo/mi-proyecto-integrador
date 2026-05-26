// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Inventario - Documentación'
}));

// Ruta raíz de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Inventario',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      documentation: '/api-docs'
    }
  });
});

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