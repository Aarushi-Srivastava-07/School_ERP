const UpcomingExams = () => {
  const exams = [
    { subject: "Mathematics", date: "15 Jul 2026", time: "09:00 AM", type: "Midterm", color: "text-blue-700 bg-blue-100" },
    { subject: "Science", date: "18 Jul 2026", time: "10:30 AM", type: "Internal", color: "text-green-700 bg-green-100" },
    { subject: "History", date: "22 Jul 2026", time: "09:00 AM", type: "Midterm", color: "text-orange-700 bg-orange-100" },
    { subject: "English", date: "25 Jul 2026", time: "11:00 AM", type: "Final", color: "text-purple-700 bg-purple-100" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Exams</h2>
      <div className="space-y-4">
        {exams.map((exam, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4 mb-3 sm:mb-0">
              <div className="text-2xl bg-gray-50 p-3 rounded-lg">📅</div>
              <div>
                <h3 className="font-semibold text-gray-800">{exam.subject}</h3>
                <p className="text-sm text-gray-500">{exam.date} • {exam.time}</p>
              </div>
            </div>
            <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-medium ${exam.color}`}>
              {exam.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingExams;
