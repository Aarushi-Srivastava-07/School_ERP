const StudentHeader = () => {
  const studentName = "Ishaan Saxena";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome, {studentName}!
        </h1>
        <p className="text-gray-500 mt-2">Have a great day! Here's your academic overview.</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{today}</p>
        <div className="mt-3 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
          {studentName.charAt(0)}
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;