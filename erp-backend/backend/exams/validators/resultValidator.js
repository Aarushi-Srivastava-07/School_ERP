"use strict";

const LEGACY_RESULT_FIELD_MAP = {
  studentId: 'student_id',
  teacherId: 'teacher_id',
  classId: 'class_id',
  examId: 'exam_id',
  subject: 'subject_id',
  marks: 'marks_obtained',
  maxMarks: 'max_marks',
  passingMarks: 'passing_marks',
};

const normalizeResultPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  const normalized = { ...payload };

  for (const [legacyKey, snakeKey] of Object.entries(LEGACY_RESULT_FIELD_MAP)) {
    if (!(legacyKey in payload)) continue;

    const legacyValue = payload[legacyKey];
    const snakeExists = snakeKey in payload;

    // precedence: snake_case wins if both exist
    if (!snakeExists) {
      normalized[snakeKey] = legacyValue;
    }

    delete normalized[legacyKey];
  }

  return normalized;
};

const validateMarks = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = normalizeResultPayload(req.body);
  }

  next();
};

module.exports = { validateMarks };