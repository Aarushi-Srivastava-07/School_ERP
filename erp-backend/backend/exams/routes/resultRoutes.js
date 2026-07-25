const express = require('express');
const resultController = require('../controller/resultController');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');
const { validateMarks } = require('../validators/resultValidator');
const resultService = require('../service/resultService');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(authenticateToken);

const resultOwnershipContext = async (req) => resultService.getOwnershipContext(req.params.id, req.user);

router.post(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL),
  validateMarks,
  asyncHandler(resultController.createResult)
);

router.get(
  '/me',
  authorizeRoles(ROLES.STUDENT),
  asyncHandler(resultController.getMyResults)
);

router.get(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL, ROLES.PARENT),
  asyncHandler(resultController.getAllResults)
);

router.get(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL, ROLES.PARENT, ROLES.STUDENT),
  authorize({
    ownership: {
      enabled: true,
      resource: 'result',
      param: 'id',
      resolver: resultOwnershipContext,
    },
  }),
  asyncHandler(resultController.getResultById)
);

router.put(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.PRINCIPAL),
  authorize({
    ownership: {
      enabled: true,
      resource: 'result',
      param: 'id',
      resolver: resultOwnershipContext,
    },
  }),
  validateMarks,
  asyncHandler(resultController.updateResult)
);

module.exports = router;
