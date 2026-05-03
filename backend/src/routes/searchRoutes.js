const r = require('express').Router();
const { search } = require('../controllers/searchController');
const { authenticate } = require('../middleware/authMiddleware');
r.get('/', authenticate, search);
module.exports = r;
