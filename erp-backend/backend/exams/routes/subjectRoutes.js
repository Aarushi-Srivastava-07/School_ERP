const express = require('express');
const subjectController = require('../controller/subjectController');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const asyncHandler = require('../middleware/asyncHandler');
const ROLES = require('../constants/roles');
const {
  validateCreateSubject,
  validateUpdateSubject,
} = require('../validators/subjectValidator');

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL,ROLES.TEACHER),
  validateCreateSubject,
  asyncHandler(subjectController.createSubject)
);

router.get(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER),
  asyncHandler(subjectController.getAllSubjects)
);

router.get(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER),
  asyncHandler(subjectController.getSubjectById)
);

router.put(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL,ROLES.TEACHER),
  validateUpdateSubject,
  asyncHandler(subjectController.updateSubject)
);

router.delete(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PRINCIPAL,ROLES.TEACHER),
  asyncHandler(subjectController.deleteSubject)
);

module.exports = router;
