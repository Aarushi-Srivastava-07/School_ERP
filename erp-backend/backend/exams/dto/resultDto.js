const toResultResponse = (result, role) => {
  const response = {
    id: result.id,
    studentId: result.student_id ?? result.studentId,
    teacherId: result.teacher_id ?? result.teacherId,
    classId: result.class_id ?? result.classId,
    examId: result.exam_id, 
    subjectId: result.subject_id ?? result.subject,
    marksObtained: result.marks_obtained ?? result.marks,
    maxMarks: result.max_marks ?? 100,
    passingMarks: result.passing_marks ?? 33,
    status: result.status ?? 'pending',
    createdAt: result.created_at ?? result.createdAt,
    updatedAt: result.updated_at ?? result.updatedAt,
  };

  if (result.exam_meta !== undefined) {
    response.examMeta = result.exam_meta;
  }

  if (result.subject_meta !== undefined) {
    response.subjectMeta = result.subject_meta;
  }

  return response;
};

const toResultsResponse = (results, role) => (results || []).map((result) => toResultResponse(result, role));

const toPaginatedResultsResponse = (payload, role) => ({
  success: true,
  page: payload.page,
  limit: payload.limit,
  total: payload.total,
  totalPages: payload.totalPages,
  data: toResultsResponse(payload.data, role),
});

module.exports = {
  toResultResponse,
  toResultsResponse,
  toPaginatedResultsResponse,
};
