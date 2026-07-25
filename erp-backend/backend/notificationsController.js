const getNotifications = (_req, res) => {
  const notifications = [
    {
      id: 'mock-notification-1',
      title: 'Daily update',
      message: 'Attendance summary is ready for review.',
      type: 'info',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-notification-2',
      title: 'Fee reminder',
      message: 'The next fee installment is due this week.',
      type: 'warning',
      createdAt: new Date().toISOString(),
    },
  ];

  return res.status(200).json({
    success: true,
    data: notifications,
  });
};

module.exports = {
  getNotifications,
};
