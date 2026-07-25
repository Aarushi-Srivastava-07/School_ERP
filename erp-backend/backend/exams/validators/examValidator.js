const AppError = require('../errors/AppError');

const normalizeExamPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  return {
    name: payload.name,
    term: payload.term,
    academic_year: payload.academic_year ?? payload.academicYear,
    class_id: payload.class_id ?? payload.classId,
  };
};

const validateCreateExam = (req, res, next) => {
  const payload = req.body || {};
  const normalized = normalizeExamPayload(payload);

  if (!normalized.name || String(normalized.name).trim() === '') {
    return next(new AppError('name is required', 400));
  }

  if (!normalized.term || String(normalized.term).trim() === '') {
    return next(new AppError('term is required', 400));
  }

  if (!normalized.academic_year || String(normalized.academic_year).trim() === '') {
    return next(new AppError('academic_year is required', 400));
  }

  if (!normalized.class_id || String(normalized.class_id).trim() === '') {
    return next(new AppError('class_id is required', 400));
  }

  req.body = normalized;
  next();
};

const validateUpdateExam = (req, res, next) => {
  const payload = req.body || {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return next(new AppError('Invalid payload', 400));
  }

  const normalized = normalizeExamPayload(payload);

  if ('name' in payload && (!normalized.name || String(normalized.name).trim() === '')) {
    return next(new AppError('name is required', 400));
  }

  if ('term' in payload && (!normalized.term || String(normalized.term).trim() === '')) {
    return next(new AppError('term is required', 400));
  }

  if ('academic_year' in payload || 'academicYear' in payload) {
    if (!normalized.academic_year || String(normalized.academic_year).trim() === '') {
      return next(new AppError('academic_year is required', 400));
    }
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
  validateCreateExam,
  validateUpdateExam,
};
