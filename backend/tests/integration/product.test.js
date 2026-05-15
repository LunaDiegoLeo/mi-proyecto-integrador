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

  test('Debe rechazar un producto con SKU duplicado', async () => {
    const product = {
      sku: 'TEST-002',
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

  test('Debe crear producto con stock 0 y mostrar no disponible', async () => {
    const product = {
      sku: 'TEST-003',
      name: 'Producto sin stock',
      price: 50.00,
      stock: 0
    };

    const response = await request(app)
      .post('/api/products')
      .send(product)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.disponibilidad).toBe('no disponible');
  });
});

describe('GET /api/products', () => {
  test('Debe retornar lista vacía cuando no hay productos', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
    expect(response.body.count).toBe(0);
  });

  test('Debe retornar todos los productos registrados', async () => {
    await Product.bulkCreate([
      { sku: 'PROD-001', name: 'Producto 1', price: 10.00, stock: 5 },
      { sku: 'PROD-002', name: 'Producto 2', price: 20.00, stock: 0 },
      { sku: 'PROD-003', name: 'Producto 3', price: 30.00, stock: 10 }
    ]);

    const response = await request(app)
      .get('/api/products')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.count).toBe(3);
    expect(response.body.data[0]).toHaveProperty('disponibilidad');
  });
});

describe('GET /api/products/:sku', () => {
  test('Debe retornar un producto existente', async () => {
    await Product.create({
      sku: 'FIND-001',
      name: 'Producto Encontrado',
      price: 99.99,
      stock: 15
    });

    const response = await request(app)
      .get('/api/products/FIND-001')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.sku).toBe('FIND-001');
    expect(response.body.data.disponibilidad).toBe('disponible');
  });

  test('Debe retornar 404 para producto inexistente', async () => {
    const response = await request(app)
      .get('/api/products/NOEXISTE-999')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Producto no encontrado');
  });
});