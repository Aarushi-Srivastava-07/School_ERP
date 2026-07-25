const toSubjectResponse = (subject) => ({
  id: subject.id,
  name: subject.name,
  classId: subject.class_id ?? subject.classId,
  subCode: subject.sub_code ?? subject.subCode,
  createdAt: subject.created_at ?? subject.createdAt,
});

module.exports = {
  toSubjectResponse,
};
