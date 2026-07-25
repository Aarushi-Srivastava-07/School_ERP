const toExamResponse = (exam) => ({
  id: exam.id,
  name: exam.name,
  term: exam.term,
  academicYear: exam.academic_year ?? exam.academicYear,
  classId: exam.class_id ?? exam.classId,
  createdAt: exam.created_at ?? exam.createdAt,
});

module.exports = {
  toExamResponse,
};
