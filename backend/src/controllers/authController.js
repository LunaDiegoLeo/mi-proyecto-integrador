const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
    } = req.body;

    const exists = await User.findOne({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({
        message: 'Usuario ya existe',
      });
    }

    let role = 'user';

    if (
      email === 'admin@admin.com'
    ) {
      role = 'admin';
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: 'Usuario creado',
      user,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Contraseña incorrecta',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
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
