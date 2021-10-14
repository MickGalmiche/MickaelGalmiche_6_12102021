const jsonToken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodeToken = jsonToken.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodeToken.userId;

        try {
            if (req.body.userId && req.body.userId !== userId) {
                throw 'Invalid user ID';
            } else if (req.body.sauce) {
                const reqSauce = JSON.parse(req.body.sauce);
                if (reqSauce.userId !== userId) {
                    throw 'Invalid user ID';
                } else {
                    next();
                }
            } else {
                next();
            }
        } catch (error) {
            res.status(403).json({ error });
        } 
    } catch (error) {
        res.status(401).json({ error: 'Invalid request ! Authentication is needed.' });
    }
};