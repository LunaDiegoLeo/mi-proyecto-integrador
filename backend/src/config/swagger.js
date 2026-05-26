// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Inventario',
      version: '1.0.0',
      description: 'API REST para la gestión de productos e inventario usando el stack PERN (PostgreSQL, Express, React, Node.js)',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@inventario.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['sku', 'name', 'price', 'stock'],
          properties: {
            sku: {
              type: 'string',
              description: 'Código único del producto (Primary Key)',
              example: 'PROD-001'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Laptop Dell Inspiron'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descripción opcional del producto',
              example: 'Laptop 15 pulgadas, 8GB RAM, 256GB SSD'
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0.01,
              description: 'Precio del producto (debe ser mayor que 0)',
              example: 899.99
            },
            stock: {
              type: 'integer',
              minimum: 0,
              description: 'Cantidad disponible en inventario',
              example: 10
            },
            disponibilidad: {
              type: 'string',
              enum: ['disponible', 'no disponible'],
              description: 'Estado de disponibilidad (campo virtual calculado desde stock)',
              example: 'disponible'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del registro'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del registro'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Descripción del error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'price'
                  },
                  message: {
                    type: 'string',
                    example: 'El precio debe ser mayor que 0'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;