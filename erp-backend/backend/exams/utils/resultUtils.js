"use strict";

const deriveStatus = (marksObtained, passingMarks) => {
  if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
    return 'pending';
  }

  return Number(marksObtained) >= Number(passingMarks || 0) ? 'pass' : 'fail';
};

const normalizeIds = (ids = []) => [...new Set(
  (Array.isArray(ids) ? ids : [ids])
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => String(value))
)];

const normalizeLegacyField = (source, sourceKey, targetKey) => {
  if (source[sourceKey] !== undefined && source[targetKey] === undefined) {
    source[targetKey] = source[sourceKey];
  }
};

const normalizeResultShape = (result) => {
  if (!result) {
    return null;
  }

  const createdAt = result.created_at || result.createdAt || new Date().toISOString();
  const updatedAt = result.updated_at || result.updatedAt || createdAt;

  return {
    ...result,
    id: String(result.id),
    student_id: result.student_id ?? result.studentId ?? null,
    teacher_id: result.teacher_id ?? result.teacherId ?? null,
    class_id: result.class_id ?? result.classId ?? null,
    exam_id: result.exam_id ?? null,
    subject_id: result.subject_id ?? result.subject ?? null,
    marks_obtained: result.marks_obtained ?? result.marks ?? null,
    max_marks: result.max_marks ?? result.maxMarks ?? 100,
    passing_marks: result.passing_marks ?? result.passingMarks ?? 33,
    status: result.status ?? deriveStatus(result.marks_obtained ?? result.marks, result.passing_marks ?? result.passingMarks ?? 33),
    created_at: createdAt,
    updated_at: updatedAt,
    studentId: result.student_id ?? result.studentId ?? null,
    teacherId: result.teacher_id ?? result.teacherId ?? null,
    classId: result.class_id ?? result.classId ?? null,
    exam_id: result.exam_id ?? null,
    subject: result.subject_id ?? result.subject ?? null,
    marks: result.marks_obtained ?? result.marks ?? null,
    createdAt,
    updatedAt,
  };
};

module.exports = {
  deriveStatus,
  normalizeIds,
  normalizeLegacyField,
  normalizeResultShape,
};
