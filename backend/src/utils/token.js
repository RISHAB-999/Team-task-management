const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev_secret';
const generateToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '7d' });
const verifyToken  = (token)   => jwt.verify(token, SECRET);
module.exports = { generateToken, verifyToken };
