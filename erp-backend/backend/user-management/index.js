const { authenticateToken } = require('../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../auth/middleware/role.middleware');
const userRoutes = require('./userRoutes');
const userService = require('./userService');
const { studentRoutes } = require('./students');
const { teacherRoutes } = require('./teachers');
const { parentRoutes } = require('./parents');

module.exports = {
  authenticateToken,
  authorizeRoles,
  userRoutes,
  userService,
  studentRoutes,
  teacherRoutes,
  parentRoutes,
};
