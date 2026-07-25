const express = require('express');
const { authenticateToken } = require('../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../auth/middleware/role.middleware');
const ROLES = require('../auth/constants/roles');
const controller = require('./userController');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles(ROLES.ADMIN), controller.createUser);

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);

router.patch('/:id', authorizeRoles(ROLES.ADMIN), controller.updateUser);
router.patch('/:id/status', authorizeRoles(ROLES.ADMIN), controller.toggleStatus);

router.delete('/:id', authorizeRoles(ROLES.ADMIN), controller.deleteUser);

module.exports = router;
