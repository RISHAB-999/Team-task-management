const r = require('express').Router();
const c = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

r.get('/', authenticate, requireAdmin, c.getAll);
r.put('/:id/role', authenticate, requireAdmin, c.updateRole);
r.put('/:id/promote', authenticate, requireAdmin, c.promoteToAdmin);
r.delete('/:id', authenticate, requireAdmin, c.deleteUser);
r.put('/me/profile', authenticate, c.updateProfile);
r.put('/me/password', authenticate, c.changePassword);

module.exports = r;
