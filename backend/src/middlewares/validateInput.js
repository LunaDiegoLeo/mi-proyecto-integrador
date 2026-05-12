// src/middlewares/validateInput.js
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      // Zod usa .issues, no .errors
      if (error.issues && Array.isArray(error.issues)) {
        const errors = error.issues.map(issue => ({
          field: issue.path.join('.') || 'body',
          message: issue.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors
        });
      }

      // Si no es un error de Zod
      return res.status(500).json({
        success: false,
        message: 'Error al validar datos',
        error: error.message
      });
    }
  };
};

module.exports = validateInput;