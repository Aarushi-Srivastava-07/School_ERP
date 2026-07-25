const examService = require('../service/examService');
const examDto = require('../dto/examDto');

const createExam = async (req, res) => {
  const exam = await examService.createExam(req.body, req.user);
  return res.status(201).json({ success: true, data: examDto.toExamResponse(exam) });
};

const getAllExams = async (req, res) => {
  const exams = await examService.getAllExams({
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    order: req.query.order,
    name: req.query.name,
    term: req.query.term,
    academicYear: req.query.academicYear,
    classId: req.query.classId,
  }, req.user);

  return res.status(200).json({
    success: true,
    page: exams.page,
    limit: exams.limit,
    total: exams.total,
    totalPages: exams.totalPages,
    data: exams.data.map((exam) => examDto.toExamResponse(exam)),
  });
};

const getExamById = async (req, res) => {
  const exam = await examService.getExamById(req.params.id, req.user);
  return res.status(200).json({ success: true, data: examDto.toExamResponse(exam) });
};

const updateExam = async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body, req.user);
  return res.status(200).json({ success: true, data: examDto.toExamResponse(exam) });
};

const deleteExam = async (req, res) => {
  await examService.deleteExam(req.params.id, req.user);
  return res.status(200).json({ success: true, message: 'Exam deleted successfully' });
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
};
