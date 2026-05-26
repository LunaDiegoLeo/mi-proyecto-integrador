const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({
      where: {
        userId: req.user.id,
      },
    });

    const item = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
    });

    res.status(201).json(item);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {

    const cart = await Cart.findOne({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: Product,
        },
      ],
    });

    res.json(cart);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  addToCart,
  getCart,
};