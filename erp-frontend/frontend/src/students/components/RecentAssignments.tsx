

const RecentAssignments = () => {
  interface Assignment {
    subject: string;
    title: string;
    due: string;
    status: "Pending" | "Submitted";
  }

  const assignments: Assignment[] = [
    { subject: "Mathematics", title: "Algebra Homework", due: "Oct 5", status: "Pending" },
    { subject: "History", title: "World War II Essay", due: "Oct 7", status: "Submitted" },
    { subject: "Science", title: "Lab Report", due: "Oct 6", status: "Pending" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Assignments</h3>
      <ul className="space-y-3">
        {assignments.map((a, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div>
              <p className="text-sm font-medium text-gray-700">{a.subject}</p>
              <p className="text-sm text-gray-600">{a.title}</p>
              <p className="text-xs text-gray-500">Due {a.due}</p>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                a.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {a.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentAssignments;
