const User = require('../models/User');
const Cart = require('../models/Cart');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'El usuario ya existe'
            });
        }
        const user = await User.create({
            name,
            email,
            password,
        });
        await Cart.create({
            userId: user.id,
        });
        res.status(201).json({
            message: 'Usuario registrado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: { email }
        });
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            'secretKey',
            {
                expiresIn: '7d',
            }
        );
        res.json({
            token,
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
module.exports = {
    register,
    login,
};