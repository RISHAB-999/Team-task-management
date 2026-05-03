const r = require('express').Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
r.post('/signup', c.signup);
r.post('/login',  c.login);
r.get('/me',      authenticate, c.me);
module.exports = r;
