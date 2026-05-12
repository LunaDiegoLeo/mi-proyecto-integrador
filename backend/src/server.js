require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Por ahora comentamos la DB para que no de error hasta que configures Sequelize
// const { sequelize } = require('./models');

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📜 Documentación en http://localhost:${PORT}/api-docs (próximamente)`);
});