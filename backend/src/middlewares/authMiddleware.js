const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: 'Token requerido',
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'secretKey');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Token inválido',
        });
    }
};
module.exports = authMiddleware;