const AppError = require('../errors/AppError');

const normalizeSubjectPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  return {
    name: payload.name,
    class_id: payload.class_id ?? payload.classId,
    sub_code: payload.sub_code ?? payload.subCode,
  };
};

const validateCreateSubject = (req, res, next) => {
  const payload = req.body || {};
  const normalized = normalizeSubjectPayload(payload);

  if (!normalized.name || String(normalized.name).trim() === '') {
    return next(new AppError('name is required', 400));
  }

  if (!normalized.class_id || String(normalized.class_id).trim() === '') {
    return next(new AppError('class_id is required', 400));
  }

  req.body = normalized;
  next();
};

const validateUpdateSubject = (req, res, next) => {
  const payload = req.body || {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return next(new AppError('Invalid payload', 400));
  }

  const normalized = normalizeSubjectPayload(payload);

  if ('name' in payload && (!normalized.name || String(normalized.name).trim() === '')) {
    return next(new AppError('name is required', 400));
  }

  if ('class_id' in payload || 'classId' in payload) {
    if (!normalized.class_id || String(normalized.class_id).trim() === '') {
      return next(new AppError('class_id is required', 400));
    }
  }

  req.body = Object.entries(normalized).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  next();
};

module.exports = {
  validateCreateSubject,
  validateUpdateSubject,
};
