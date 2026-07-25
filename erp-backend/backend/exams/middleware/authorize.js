const AppError = require('../errors/AppError');
const relationshipService = require('../service/relationshipService');
const AUTH_MESSAGES = require('../../auth/constants/authMessages');
const ROLES = require('../constants/roles');

const normalizeRole = (role) => (role == null ? '' : String(role).trim().toLowerCase());

const checkOwnership = async (user, resourceContext) => {
  if (!resourceContext) {
    return false;
  }

  const role = normalizeRole(user.role);
  const studentId = resourceContext.student_id || resourceContext.studentId;
  const teacherId = resourceContext.teacher_id || resourceContext.teacherId;
  const classId = resourceContext.class_id || resourceContext.classId;

  // Admin and principal bypass ownership checks entirely and retain full access.
  if (role === ROLES.ADMIN || role === ROLES.PRINCIPAL) {
    return true;
  }

  if (role === ROLES.STUDENT) {
    return String(studentId) === String(user.id);
  }

  if (role === ROLES.TEACHER) {
    if (String(teacherId) === String(user.id)) {
      return true;
    }

    if (Array.isArray(resourceContext.assignedTeacherIds)) {
      return resourceContext.assignedTeacherIds.map((id) => String(id)).includes(String(user.id));
    }

    if (classId) {
      return relationshipService.isTeacherAssignedToClass(user.id, classId, user);
    }

    return false;
  }

  if (role === ROLES.PARENT) {
    if (!studentId) {
      return false;
    }

    return relationshipService.isParentOfStudent(user.id, studentId, user);
  }

  return false;
};

const authorize = ({ ownership, requireOwnership = false } = {}) => {
  const ownershipConfig = ownership === true
    ? { enabled: true }
    : (ownership || (requireOwnership ? { enabled: true } : {}));

  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED,
      });
    }

    if (ownershipConfig.enabled) {
      try {
        const resourceContext = ownershipConfig.resolver
          ? await ownershipConfig.resolver(req)
          : (ownershipConfig.param ? req.params?.[ownershipConfig.param] : null);

        if (!resourceContext) {
          return next(new AppError('Resource not found.', 404));
        }

        // Reuse the fetched result context in the service layer to avoid duplicate lookups.
        req.resourceOwner = resourceContext;

        const isOwner = await checkOwnership(req.user, resourceContext);
        if (!isOwner) {
          return next(new AppError(AUTH_MESSAGES.FORBIDDEN, 403));
        }
      } catch (error) {
        return next(error);
      }
    }

    return next();
  };
};

module.exports = authorize;
