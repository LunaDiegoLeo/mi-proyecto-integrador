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

  test('Debe filtrar productos por nombre usando search query param', async () => {
    await Product.bulkCreate([
      { sku: 'LAPTOP-001', name: 'Laptop Dell', price: 899.99, stock: 5 },
      { sku: 'MOUSE-001', name: 'Mouse Logitech', price: 29.99, stock: 10 },
      { sku: 'LAPTOP-002', name: 'Laptop HP', price: 799.99, stock: 3 }
    ]);

    const response = await request(app)
      .get('/api/products?search=laptop')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].name).toContain('Laptop');
    expect(response.body.data[1].name).toContain('Laptop');
  });

  test('Debe filtrar productos por SKU usando search query param', async () => {
    await Product.bulkCreate([
      { sku: 'LAPTOP-001', name: 'Laptop Dell', price: 899.99, stock: 5 },
      { sku: 'MOUSE-001', name: 'Mouse Logitech', price: 29.99, stock: 10 },
      { sku: 'LAPTOP-002', name: 'Laptop HP', price: 799.99, stock: 3 }
    ]);

    const response = await request(app)
      .get('/api/products?search=MOUSE')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].sku).toBe('MOUSE-001');
  });

  test('Debe ser insensible a mayúsculas en la búsqueda', async () => {
    await Product.bulkCreate([
      { sku: 'TEST-001', name: 'Producto TEST', price: 100.00, stock: 5 }
    ]);

    const response = await request(app)
      .get('/api/products?search=test')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
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

describe('PUT /api/products/:sku', () => {
  test('Debe actualizar un producto existente correctamente', async () => {
    await Product.create({
      sku: 'UPDATE-001',
      name: 'Producto Original',
      description: 'Descripción original',
      price: 100.00,
      stock: 10
    });

    const updateData = {
      name: 'Producto Actualizado',
      description: 'Nueva descripción',
      price: 150.00
    };

    const response = await request(app)
      .put('/api/products/UPDATE-001')
      .send(updateData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(updateData.name);
    expect(response.body.data.description).toBe(updateData.description);
    expect(response.body.data.price).toBe(updateData.price);
    expect(response.body.data.sku).toBe('UPDATE-001');
    expect(response.body.data.stock).toBe(10);
  });

  test('Debe actualizar solo los campos enviados', async () => {
    await Product.create({
      sku: 'UPDATE-002',
      name: 'Producto Original',
      description: 'Descripción original',
      price: 100.00,
      stock: 5
    });

    const response = await request(app)
      .put('/api/products/UPDATE-002')
      .send({ price: 200.00 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.price).toBe(200.00);
    expect(response.body.data.name).toBe('Producto Original');
    expect(response.body.data.description).toBe('Descripción original');
  });

  test('Debe retornar 404 al intentar actualizar producto inexistente', async () => {
    const response = await request(app)
      .put('/api/products/NOEXISTE-999')
      .send({ name: 'Nuevo Nombre' })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Producto no encontrado');
  });

  test('Debe rechazar actualización con precio inválido', async () => {
    await Product.create({
      sku: 'UPDATE-003',
      name: 'Producto',
      price: 100.00,
      stock: 5
    });

    const response = await request(app)
      .put('/api/products/UPDATE-003')
      .send({ price: 0 })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

describe('PATCH /api/products/:sku/stock', () => {
  test('Debe actualizar el stock correctamente', async () => {
    await Product.create({
      sku: 'STOCK-001',
      name: 'Producto con Stock',
      price: 50.00,
      stock: 10
    });

    const response = await request(app)
      .patch('/api/products/STOCK-001/stock')
      .send({ stock: 25 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.stock).toBe(25);
    expect(response.body.data.disponibilidad).toBe('disponible');
  });

  test('Debe permitir actualizar stock a 0', async () => {
    await Product.create({
      sku: 'STOCK-002',
      name: 'Producto',
      price: 50.00,
      stock: 10
    });

    const response = await request(app)
      .patch('/api/products/STOCK-002/stock')
      .send({ stock: 0 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.stock).toBe(0);
    expect(response.body.data.disponibilidad).toBe('no disponible');
  });

  test('Debe rechazar stock negativo', async () => {
    await Product.create({
      sku: 'STOCK-003',
      name: 'Producto',
      price: 50.00,
      stock: 10
    });

    const response = await request(app)
      .patch('/api/products/STOCK-003/stock')
      .send({ stock: -5 })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('Debe retornar 404 para producto inexistente', async () => {
    const response = await request(app)
      .patch('/api/products/NOEXISTE-999/stock')
      .send({ stock: 10 })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Producto no encontrado');
  });
});

describe('DELETE /api/products/:sku', () => {
  test('Debe eliminar un producto existente correctamente', async () => {
    await Product.create({
      sku: 'DELETE-001',
      name: 'Producto a Eliminar',
      price: 50.00,
      stock: 10
    });

    const response = await request(app)
      .delete('/api/products/DELETE-001')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Producto eliminado exitosamente');
    expect(response.body.data.sku).toBe('DELETE-001');

    const deletedProduct = await Product.findByPk('DELETE-001');
    expect(deletedProduct).toBeNull();
  });

  test('Debe retornar 404 al intentar eliminar producto inexistente', async () => {
    const response = await request(app)
      .delete('/api/products/NOEXISTE-999')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Producto no encontrado');
  });
});