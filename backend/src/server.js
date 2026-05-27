const app = require('./app');

const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {

    console.log('Base de datos sincronizada');

    app.listen(PORT, () => {

      console.log(
        `Servidor corriendo en puerto ${PORT}`
      );

    });

  })
  .catch((error) => {

    console.log(error);

  });