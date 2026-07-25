function getDashboardStats(req, res) {
  const stats = {
    totalStudents: 1280,
    totalTeachers: 84,
    totalRevenue: 2450000,
    pendingFees: 320000,
  };

  return res.status(200).json({
    success: true,
    data: stats,
  });
}

module.exports = {
  getDashboardStats,
};
