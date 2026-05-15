// src/server.js
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a PostgreSQL exitosa');
    
    // Sincronizar modelos (crear tablas automáticamente)
    await sequelize.sync({ alter: true });
    console.log('✓ Modelos sincronizados con la base de datos');
    
    app.listen(PORT, () => {
      console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();