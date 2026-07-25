const express = require('express');
const examController = require('../controller/examController');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const asyncHandler = require('../middleware/asyncHandler');
const ROLES = require('../constants/roles');
const {
  validateCreateExam,
  validateUpdateExam,
} = require('../validators/examValidator');

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/master',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL,ROLES.TEACHER),
  validateCreateExam,
  asyncHandler(examController.createExam)
);

router.get(
  '/master',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER),
  asyncHandler(examController.getAllExams)
);

router.get(
  '/master/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER),
  asyncHandler(examController.getExamById)
);

router.put(
  '/master/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL,ROLES.TEACHER),
  validateUpdateExam,
  asyncHandler(examController.updateExam)
);

router.delete(
  '/master/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL,ROLES.TEACHER),
  asyncHandler(examController.deleteExam)
);

module.exports = router;
