const jsonToken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        req.token = jsonToken.verify(token, process.env.TOKEN_KEY);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid request ! Authentication is needed.' });
    }
};