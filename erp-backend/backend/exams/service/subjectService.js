const AppError = require('../errors/AppError');
const subjectRepository = require('../repository/subjectRepository');
const relationshipService = require('./relationshipService');

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

const hasDuplicateSubCode = async ({ class_id, sub_code }, excludeId = null, user) => {
  if (!sub_code || !class_id) {
    return false;
  }

  const response = await subjectRepository.getAllSubjects(
    { classId: class_id, subCode: sub_code },
    { page: 1, limit: 10 },
    user
  );

  if (!response || !Array.isArray(response.data)) {
    return false;
  }

  return response.data.some((subject) => {
    if (!subject) return false;
    return String(subject.sub_code) === String(sub_code)
      && String(subject.class_id) === String(class_id)
      && String(subject.id) !== String(excludeId);
  });
};

const createSubject = async (payload, user) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('Invalid payload', 400);
  }

  const normalized = normalizeSubjectPayload(payload);

  if (normalized.sub_code && await hasDuplicateSubCode(normalized, null, user)) {
    throw new AppError('sub_code must be unique within the same class', 409);
  }

  const subject = await subjectRepository.createSubject(normalized, user);
  relationshipService.invalidateSubjectCache(subject.id);
  return subject;
};

const updateSubject = async (id, payload, user) => {
  const existing = await subjectRepository.getSubjectById(id, user);
  if (!existing) {
    throw new AppError('Subject not found', 404);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('Invalid payload', 400);
  }

  const normalized = normalizeSubjectPayload(payload);
  const updates = {
    ...normalized,
  };

  const merged = {
    ...existing,
    ...updates,
  };

  if (merged.sub_code && await hasDuplicateSubCode(merged, id, user)) {
    throw new AppError('sub_code must be unique within the same class', 409);
  }

  const subject = await subjectRepository.updateSubject(id, updates, user);
  relationshipService.invalidateSubjectCache(subject.id);
  return subject;
};

const getSubjectById = async (id, user) => {
  const subject = await subjectRepository.getSubjectById(id, user);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  return subject;
};

const getAllSubjects = async (user, query = {}) => {
  const filters = {
    name: query.name,
    classId: query.classId,
    subCode: query.subCode,
  };

  return subjectRepository.getAllSubjects(filters, {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    order: query.order,
  }, user);
};

const deleteSubject = async (id, user) => {
  const subject = await subjectRepository.getSubjectById(id, user);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  const deleted = await subjectRepository.deleteSubject(id, user);
  relationshipService.invalidateSubjectCache(id);
  return deleted;
};

module.exports = {
  createSubject,
  updateSubject,
  getSubjectById,
  getAllSubjects,
  deleteSubject,
};
