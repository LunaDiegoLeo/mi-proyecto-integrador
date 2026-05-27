const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Cart = sequelize.define('Cart', {
id: {
type: DataTypes.INTEGER,
primaryKey: true,
autoIncrement: true,
},
}, {
tableName: 'carts',
timestamps: true,
});
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
module.exports = Cart;