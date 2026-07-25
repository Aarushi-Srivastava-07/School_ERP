const subjectService = require('../service/subjectService');
const subjectDto = require('../dto/subjectDto');

const createSubject = async (req, res) => {
  const subject = await subjectService.createSubject(req.body, req.user);
  return res.status(201).json({ success: true, data: subjectDto.toSubjectResponse(subject) });
};

const getAllSubjects = async (req, res) => {
  const subjects = await subjectService.getAllSubjects(req.user, {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    order: req.query.order,
    name: req.query.name,
    classId: req.query.classId,
    subCode: req.query.subCode,
  });

  return res.status(200).json({
    success: true,
    page: subjects.page,
    limit: subjects.limit,
    total: subjects.total,
    totalPages: subjects.totalPages,
    data: subjects.data.map((subject) => subjectDto.toSubjectResponse(subject)),
  });
};

const getSubjectById = async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id, req.user);
  return res.status(200).json({ success: true, data: subjectDto.toSubjectResponse(subject) });
};

const updateSubject = async (req, res) => {
  const subject = await subjectService.updateSubject(req.params.id, req.body, req.user);
  return res.status(200).json({ success: true, data: subjectDto.toSubjectResponse(subject) });
};

const deleteSubject = async (req, res) => {
  await subjectService.deleteSubject(req.params.id, req.user);
  return res.status(200).json({ success: true, message: 'Subject deleted successfully' });
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
