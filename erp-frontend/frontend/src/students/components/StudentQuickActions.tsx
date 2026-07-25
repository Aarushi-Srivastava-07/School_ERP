const StudentQuickActions = () => {
  const actions = [
    { name: "View Timetable", icon: "📅" },
    { name: "Assignments", icon: "📝" },
    { name: "Attendance", icon: "✅" },
    { name: "Exams", icon: "🎓" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {actions.map((action, index) => (
        <button
          key={index}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <span className="text-3xl mb-3">{action.icon}</span>
          <span className="text-sm font-medium text-gray-700">{action.name}</span>
        </button>
      ))}
    </div>
  );
};

export default StudentQuickActions;
