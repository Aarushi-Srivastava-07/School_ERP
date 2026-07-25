const getAttendanceSummary = (_req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      totalStudents: 120,
      presentToday: 102,
      absentToday: 14,
      lateToday: 4,
      attendanceRate: 85,
    },
  });
};

const getRecentAttendance = (_req, res) => {
  const recentAttendance = [
    {
      id: 'mock-attendance-1',
      studentName: 'Asha Rao',
      date: '2026-07-20',
      status: 'present',
    },
    {
      id: 'mock-attendance-2',
      studentName: 'Ravi Kumar',
      date: '2026-07-20',
      status: 'late',
    },
    {
      id: 'mock-attendance-3',
      studentName: 'Meera Singh',
      date: '2026-07-19',
      status: 'absent',
    },
  ];

  return res.status(200).json({
    success: true,
    data: recentAttendance,
  });
};

module.exports = {
  getAttendanceSummary,
  getRecentAttendance,
};
