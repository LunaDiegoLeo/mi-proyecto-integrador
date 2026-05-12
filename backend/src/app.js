const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: "API de Inventario funcionando correctamente" });
});

module.exports = app; // <--- ¡Esto es vital para que server.js lo reconozca!