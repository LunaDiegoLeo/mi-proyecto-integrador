// tests/integration/product.test.js
const request = require('supertest');
const app = require('../../src/app');
const sequelize = require('../../src/config/database');
const Product = require('../../src/models/Product');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await Product.destroy({ where: {}, truncate: true });
});

describe('POST /api/products', () => {
  test('Debe crear un producto correctamente con datos válidos', async () => {
    const newProduct = {
      sku: 'TEST-001',
      name: 'Producto de Prueba',
      description: 'Descripción del producto',
      price: 99.99,
      stock: 10
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.sku).toBe(newProduct.sku);
    expect(response.body.data.disponibilidad).toBe('disponible');
  });

  test('Debe rechazar un producto con stock negativo', async () => {
    const invalidProduct = {
      sku: 'TEST-002',
      name: 'Producto Inválido',
      price: 50.00,
      stock: -5
    };

    const response = await request(app)
      .post('/api/products')
      .send(invalidProduct)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  test('Debe rechazar un producto con precio igual a 0', async () => {
    const invalidProduct = {
      sku: 'TEST-003',
      name: 'Producto Sin Precio',
      price: 0,
      stock: 10
    };

    const response = await request(app)
      .post('/api/products')
      .send(invalidProduct)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  test('Debe rechazar un producto con SKU duplicado', async () => {
    const product = {
      sku: 'TEST-004',
      name: 'Producto Original',
      price: 100.00,
      stock: 5
    };

    await request(app)
      .post('/api/products')
      .send(product)
      .expect(201);

    const response = await request(app)
      .post('/api/products')
      .send(product)
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('SKU ya existe');
  });
});