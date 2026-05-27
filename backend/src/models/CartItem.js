const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cart = require('./Cart');
const Product = require('./Product');
const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
}, {
    tableName: 'cart_items',
    timestamps: true,
});
Cart.belongsToMany(Product, {
    through: CartItem,
    foreignKey: 'cartId',
});
Product.belongsToMany(Cart, {
    through: CartItem,
    foreignKey: 'productId',
});
module.exports = CartItem;