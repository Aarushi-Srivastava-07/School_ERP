const AppError = require('../errors/AppError');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('./relationshipService');
const ROLES = require('../constants/roles');
const { deriveStatus, normalizeIds } = require('../utils/resultUtils');

const getFieldValue = (data, keys, fallbackValue) => {
  for (const key of keys) {
    const value = data?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallbackValue;
};

const getExistingValue = (existingResult, keys) => getFieldValue(existingResult, keys);
const getUserRole = (user = {}) => String(user?.role || '').toLowerCase();
const isAdminOrPrincipal = (user = {}) => {
  const role = getUserRole(user);
  return role === ROLES.ADMIN || role === ROLES.PRINCIPAL;
};

const getResultStudentId = (result = {}) => result.student_id || result.studentId;
const getResultTeacherId = (result = {}) => result.teacher_id || result.teacherId;
const getResultClassId = (result = {}) => result.class_id || result.classId;

const assertResultAccess = async (user, result, { requireOwnership = false } = {}) => {
  if (!result) {
    throw new AppError('Result not found', 404);
  }

  if (isAdminOrPrincipal(user)) {
    return result;
  }

  const role = getUserRole(user);
  if (role === ROLES.STUDENT) {
    if (String(getResultStudentId(result)) !== String(user.id)) {
      throw new AppError('Forbidden', 403);
    }
    return result;
  }

  if (role === ROLES.PARENT) {
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id, user);
    if (!parentStudentIds.includes(String(getResultStudentId(result)))) {
      throw new AppError('Forbidden', 403);
    }
    return result;
  }

  if (role === ROLES.TEACHER) {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id, user);
    const teacherOwnsResult = String(getResultTeacherId(result)) === String(user.id);
    const classAssigned = teacherClassIds.includes(String(getResultClassId(result)));

    if (requireOwnership) {
      if (!teacherOwnsResult) {
        throw new AppError('Forbidden', 403);
      }
      return result;
    }

    if (!teacherOwnsResult && !classAssigned) {
      throw new AppError('Forbidden', 403);
    }

    return result;
  }

  throw new AppError('Forbidden', 403);
};

const validateNumber = (value, name, { min, max, required = true } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new AppError(`${name} is required`, 400);
    }
    return undefined;
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue) || typeof value === 'boolean') {
    throw new AppError(`${name} must be a number`, 400);
  }

  if (min !== undefined && numberValue < min) {
    throw new AppError(`${name} must be greater than or equal to ${min}`, 400);
  }

  if (max !== undefined && numberValue > max) {
    throw new AppError(`${name} must be less than or equal to ${max}`, 400);
  }

  return numberValue;
};

const attachMetadata = (results, exams = [], subjects = []) => {
  const examMap = new Map((exams || []).map((exam) => [String(exam.id), exam]));
  const subjectMap = new Map((subjects || []).map((subject) => [String(subject.id), subject]));

  return results.map((result) => {
    const examId = String(result.exam_id ?? '');
    const subjectId = String(result.subject_id ?? result.subject ?? '');
    const exam = examMap.get(examId) || null;
    const subject = subjectMap.get(subjectId) || null;

    return {
      ...result,
      exam_meta: exam
        ? {
            id: exam.id,
            name: exam.name,
            term: exam.term,
            academic_year: exam.academic_year,
            class_id: exam.class_id,
          }
        : null,
      subject_meta: subject
        ? {
            id: subject.id,
            name: subject.name,
            class_id: subject.class_id,
            sub_code: subject.sub_code,
          }
        : null,
    };
  });
};

const enrichResultsWithMetadata = async (results, user) => {
  if (!Array.isArray(results) || results.length === 0) {
    return results;
  }

  const examIds = normalizeIds(results.map((result) => result.exam_id));
  const subjectIds = normalizeIds(results.map((result) => result.subject_id ?? result.subject));

  const [exams, subjects] = await Promise.all([
    examIds.length > 0 ? relationshipService.fetchExamsByIds(examIds, user) : [],
    subjectIds.length > 0 ? relationshipService.fetchSubjectsByIds(subjectIds, user) : [],
  ]);

  return attachMetadata(results, exams || [], subjects || []);
};

const normalizeResultPayload = (data, user, { isUpdate = false, existingResult = {} } = {}) => {
  const studentId = getFieldValue(data, ['student_id', 'studentId'], getExistingValue(existingResult, ['student_id', 'studentId']));
  const teacherId = getFieldValue(data, ['teacher_id', 'teacherId'], getExistingValue(existingResult, ['teacher_id', 'teacherId']));
  const subjectId = getFieldValue(data, ['subject_id', 'subject'], getExistingValue(existingResult, ['subject_id', 'subject']));
  const examId = getFieldValue(data, ['exam_id', 'examId'], getExistingValue(existingResult, ['exam_id', 'examId']));
  const classId = getFieldValue(data, ['class_id', 'classId'], getExistingValue(existingResult, ['class_id', 'classId']));
  const marksObtained = getFieldValue(data, ['marks_obtained', 'marks'], getExistingValue(existingResult, ['marks_obtained', 'marks']));
  const maxMarks = getFieldValue(data, ['max_marks', 'maxMarks'], getExistingValue(existingResult, ['max_marks', 'maxMarks']));
  const passingMarks = getFieldValue(data, ['passing_marks', 'passingMarks'], getExistingValue(existingResult, ['passing_marks', 'passingMarks']));

  if (!isUpdate && !studentId) {
    throw new AppError('Student ID is required', 400);
  }

  if (!isUpdate && !subjectId) {
    throw new AppError('Subject is required', 400);
  }

  if (!isUpdate && !examId) {
    throw new AppError('Exam type is required', 400);
  }

  if (!isUpdate && !classId) {
    throw new AppError('Class ID is required', 400);
  }

  const resolvedMaxMarks = validateNumber(maxMarks ?? 100, 'max_marks', { min: 1, required: false }) ?? (maxMarks ?? 100);
  const resolvedPassingMarks = validateNumber(passingMarks ?? Math.min(33, resolvedMaxMarks), 'passing_marks', { min: 0, max: resolvedMaxMarks, required: false }) ?? (passingMarks ?? Math.min(33, resolvedMaxMarks));
  const resolvedMarksObtained = validateNumber(marksObtained, 'marks_obtained', { min: 0, required: !isUpdate }) ?? (isUpdate ? marksObtained : 0);

  if (resolvedMarksObtained !== undefined && resolvedMarksObtained > resolvedMaxMarks) {
    throw new AppError('marks_obtained cannot exceed max_marks', 400);
  }

  const userRole = String(user?.role || '').toLowerCase();
  const resolvedTeacherId = teacherId || user?.id || existingResult?.teacher_id || existingResult?.teacherId;

  return {
    student_id: studentId,
    teacher_id: userRole === ROLES.ADMIN || userRole === ROLES.PRINCIPAL ? resolvedTeacherId : user?.id || resolvedTeacherId,
    class_id: classId,
    exam_id: examId,
    subject_id: subjectId,
    marks_obtained: resolvedMarksObtained,
    max_marks: resolvedMaxMarks,
    passing_marks: resolvedPassingMarks,
    status: deriveStatus(resolvedMarksObtained, resolvedPassingMarks),
  };
};

const ensureExamExists = async (examId, user) => {
  if (!examId) {
    return false;
  }

  const exams = await relationshipService.fetchExamsByIds([examId], user);
  if (exams === null) {
    return true;
  }

  return Array.isArray(exams) && exams.length > 0;
};

const ensureSubjectExists = async (subjectId, user) => {
  if (!subjectId) {
    return false;
  }

  const subjects = await relationshipService.fetchSubjectsByIds([subjectId], user);
  if (subjects === null) {
    return true;
  }

  return Array.isArray(subjects) && subjects.length > 0;
};

const createResult = async (data, user) => {
  const resultPayload = normalizeResultPayload(data, user, { isUpdate: false });

  if (!(await ensureExamExists(resultPayload.exam_id, user))) {
    throw new AppError('exam_id does not reference an existing exam', 400);
  }

  if (!(await ensureSubjectExists(resultPayload.subject_id, user))) {
    throw new AppError('subject_id does not reference an existing subject', 400);
  }

  // Teachers may only create results for their assigned classes or for their own assigned result records.
  if (!isAdminOrPrincipal(user) && getUserRole(user) === ROLES.TEACHER) {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id, user);
    const classAllowed = teacherClassIds.includes(String(resultPayload.class_id));
    const teacherOwnsResult = String(resultPayload.teacher_id) === String(user.id);
    if (!classAllowed && !teacherOwnsResult) {
      throw new AppError('Forbidden', 403);
    }
  }

  const result = await resultRepository.create(resultPayload, user);
  return enrichResultsWithMetadata([result], user).then((items) => items[0]);
};

const updateResult = async (id, data, options = {}) => {
  const user = options.user || {};
  const existingResult = options.resourceOwner || await resultRepository.findById(id, user);
  if (!existingResult) {
    throw new AppError('Result not found', 404);
  }

  await assertResultAccess(options.user || {}, existingResult, { requireOwnership: true });

  const normalizedPayload = normalizeResultPayload(data, {}, { isUpdate: true, existingResult });
  const updates = {};
  const marksChanged = data?.marks_obtained !== undefined || data?.marks !== undefined;
  const passingChanged = data?.passing_marks !== undefined || data?.passingMarks !== undefined;
  const maxChanged = data?.max_marks !== undefined || data?.maxMarks !== undefined;

  if (marksChanged) {
    updates.marks_obtained = normalizedPayload.marks_obtained;
  }
  if (data?.subject_id !== undefined || data?.subject !== undefined) {
    updates.subject_id = normalizedPayload.subject_id;
  }
  if (data?.exam_id !== undefined || data?.examId !== undefined) {
    updates.exam_id = normalizedPayload.exam_id;
  }
  if (data?.class_id !== undefined || data?.classId !== undefined) {
    updates.class_id = normalizedPayload.class_id;
  }
  if (maxChanged) {
    updates.max_marks = normalizedPayload.max_marks;
  }
  if (passingChanged) {
    updates.passing_marks = normalizedPayload.passing_marks;
  }

  if (Object.keys(updates).length > 0) {
    updates.status = normalizedPayload.status;
  }

  if (updates.exam_id && !(await ensureExamExists(updates.exam_id, user))) {
    throw new AppError('exam_id does not reference an existing exam', 400);
  }

  if (updates.subject_id && !(await ensureSubjectExists(updates.subject_id, user))) {
    throw new AppError('subject_id does not reference an existing subject', 400);
  }

  if (Object.keys(updates).length === 0) {
    const [enriched] = await enrichResultsWithMetadata([existingResult], user);
    return enriched;
  }

  const updatedResult = await resultRepository.update(id, updates, user);
  return enrichResultsWithMetadata([updatedResult], user).then((items) => items[0]);
};

const getResultById = async (id, options = {}) => {
  const user = options.user || {};
  const result = options.resourceOwner || await resultRepository.findById(id, user);
  await assertResultAccess(user, result);

  const [enriched] = await enrichResultsWithMetadata([result], user);
  return enriched;
};

const createEmptyResponse = (options = {}) => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));

  return {
    success: true,
    page,
    limit,
    total: 0,
    totalPages: 0,
    data: [],
  };
};

const fetchRoleScopedResults = async (user, filters = {}, options = {}) => {
  const role = String(user.role).toLowerCase();

  if (role === ROLES.ADMIN || role === ROLES.PRINCIPAL) {
    return resultRepository.findAll(filters, options, user);
  }

  if (role === ROLES.STUDENT) {
    return resultRepository.findAll({ ...filters, student_id: user.id }, options, user);
  }

  if (role === ROLES.PARENT) {
    const parentStudentIds = await relationshipService.getParentStudentIds(user.id, user);
    if (!Array.isArray(parentStudentIds) || parentStudentIds.length === 0) {
      return createEmptyResponse(options);
    }

    return resultRepository.findAll({ ...filters, student_id: parentStudentIds }, options, user);
  }

  if (role === ROLES.TEACHER) {
    const teacherClassIds = await relationshipService.getTeacherClassIds(user.id, user);
    const teacherQuery = resultRepository.findAll({ ...filters, teacher_id: user.id }, { ...options, page: 1, limit: 1000 }, user);
    const classQuery = teacherClassIds.length > 0
      ? resultRepository.findAll({ ...filters, class_id: teacherClassIds }, { ...options, page: 1, limit: 1000 }, user)
      : Promise.resolve(createEmptyResponse({ ...options, page: 1, limit: 1000 }));

    const [teacherResponse, classResponse] = await Promise.all([teacherQuery, classQuery]);
    const mergedResults = [...(teacherResponse?.data || []), ...(classResponse?.data || [])];
    const uniqueResults = mergedResults.filter((result, index, rows) => rows.findIndex((entry) => String(entry.id) === String(result.id)) === index);

    return {
      success: true,
      page: Math.max(1, Number(options.page || 1)),
      limit: Math.max(1, Number(options.limit || 10)),
      total: uniqueResults.length,
      totalPages: uniqueResults.length === 0 ? 0 : Math.ceil(uniqueResults.length / Math.max(1, Number(options.limit || 10))),
      data: uniqueResults,
    };
  }

  return createEmptyResponse(options);
};

const getAllResults = async (user, options = {}) => {
  const role = String(user.role).toLowerCase();
  const normalizedOptions = {
    page: Number(options.page || 1),
    limit: Number(options.limit || 10),
    sortBy: options.sortBy,
    order: options.order,
    filters: options.filters || {},
  };

  const response = await fetchRoleScopedResults(user, normalizedOptions.filters, normalizedOptions);
  const results = Array.isArray(response?.data) ? response.data : [];
  const sortedResults = sortResults(results, normalizedOptions.sortBy, normalizedOptions.order);
  const paginated = paginateResults(sortedResults, normalizedOptions);
  const enriched = await enrichResultsWithMetadata(paginated.data, user);
  return { ...paginated, data: enriched };
};

const applyQueryFilters = (results, filters = {}) => results.filter((result) => Object.entries(filters).every(([key, value]) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  const rowValue = result?.[key] ?? result?.[key.toLowerCase()] ?? result?.[camelizeKey(key)];
  if (Array.isArray(value)) {
    return value.some((entry) => String(entry) === String(rowValue));
  }

  return String(rowValue) === String(value);
}));

const camelizeKey = (key) => {
  const map = {
    studentId: 'student_id',
    teacherId: 'teacher_id',
    classId: 'class_id',
    examId: 'exam_id',
    subjectId: 'subject_id',
  };

  return map[key] || key;
};

const sortResults = (results, sortBy, order) => {
  const allowedFields = ['id', 'student_id', 'teacher_id', 'class_id', 'exam_id', 'subject_id', 'marks_obtained', 'max_marks', 'passing_marks', 'status', 'created_at', 'updated_at'];
  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : 'created_at';
  const direction = String(order || '').toLowerCase() === 'desc' ? -1 : 1;

  return [...results].sort((left, right) => {
    const leftValue = left?.[safeSortBy];
    const rightValue = right?.[safeSortBy];

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue === undefined || leftValue === null) {
      return 1;
    }

    if (rightValue === undefined || rightValue === null) {
      return -1;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
};

const paginateResults = (results, options = {}) => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));
  const total = results.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = results.slice(start, start + limit);

  return {
    success: true,
    page,
    limit,
    total,
    totalPages,
    data,
  };
};

const getMyResults = async (user) => {
  const response = await resultRepository.findAll({ student_id: user.id }, { page: 1, limit: 1000 }, user);
  return enrichResultsWithMetadata(response?.data || [], user);
};

const getOwnershipContext = async (id, user) => {
  const result = await resultRepository.findById(id, user);
  if (!result) {
    return null;
  }

  // Return the full result record so the middleware and service layers can reuse it without re-querying.
  return {
    ...result,
    studentId: result.student_id || result.studentId,
    student_id: result.student_id || result.studentId,
    teacherId: result.teacher_id || result.teacherId,
    teacher_id: result.teacher_id || result.teacherId,
    classId: result.class_id || result.classId,
    class_id: result.class_id || result.classId,
    assignedTeacherIds: result.assignedTeacherIds || [],
  };
};

module.exports = {
  createResult,
  updateResult,
  getResultById,
  getAllResults,
  getMyResults,
  getOwnershipContext,
};
