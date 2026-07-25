const AppError = require('../errors/AppError');
const examRepository = require('../repository/examRepository');
const relationshipService = require('./relationshipService');

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

const hasDuplicateExam = async ({ name, term, academic_year, class_id }, excludeId = null, user) => {
  const response = await examRepository.getAllExams(
    { name, term, academicYear: academic_year, classId: class_id },
    { page: 1, limit: 10 },
    user
  );

  if (!response || !Array.isArray(response.data)) {
    return false;
  }

  return response.data.some((exam) => {
    if (!exam) return false;
    const isSame = String(exam.name) === String(name)
      && String(exam.term) === String(term)
      && String(exam.academic_year) === String(academic_year)
      && String(exam.class_id) === String(class_id);

    return isSame && String(exam.id) !== String(excludeId);
  });
};

const createExam = async (payload, user) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('Invalid payload', 400);
  }

  const normalized = normalizeExamPayload(payload);

  if (await hasDuplicateExam(normalized, null, user)) {
    throw new AppError('Exam already exists for the same class, term, and academic year', 409);
  }

  const exam = await examRepository.createExam(normalized, user);
  relationshipService.invalidateExamCache(exam.id);
  return exam;
};

const updateExam = async (id, payload, user) => {
  const existing = await examRepository.getExamById(id, user);
  if (!existing) {
    throw new AppError('Exam not found', 404);
  }

  const normalized = normalizeExamPayload(payload);
  const updates = {
    ...normalized,
  };

  const merged = {
    ...existing,
    ...updates,
  };

  if (await hasDuplicateExam(merged, id, user)) {
    throw new AppError('Exam already exists for the same class, term, and academic year', 409);
  }

  const exam = await examRepository.updateExam(id, updates, user);
  relationshipService.invalidateExamCache(id);
  return exam;
};

const getExamById = async (id, user) => {
  const exam = await examRepository.getExamById(id, user);
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
};

const getAllExams = async (query = {}, user) => {
  const filters = {
    name: query.name,
    term: query.term,
    academicYear: query.academicYear,
    classId: query.classId,
  };

  return examRepository.getAllExams(filters, {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    order: query.order,
  }, user);
};

const deleteExam = async (id, user) => {
  const exam = await examRepository.getExamById(id, user);
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  const deleted = await examRepository.deleteExam(id, user);
  relationshipService.invalidateExamCache(id);
  return deleted;
};

module.exports = {
  createExam,
  updateExam,
  getExamById,
  getAllExams,
  deleteExam,
};
