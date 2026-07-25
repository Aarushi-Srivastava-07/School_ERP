import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherAttendanceCalendar from "../../teachers/components/TeacherAttendanceCalendar";

export default function AdminStudentAttendanceDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // In a real app, you would fetch the student's real data using this ID.
  const [summary, setSummary] = useState({ present: 18, absent: 2, late: 1 });

  // Update summary cards dynamically when the calendar is clicked
  const handleUpdate = (newStatus: string, oldStatus: string) => {
    setSummary((prev) => {
      const updated = { ...prev };
      // Remove old status count
      if (oldStatus === "Present") updated.present--;
      if (oldStatus === "Absent") updated.absent--;
      if (oldStatus === "Holiday") updated.late--; // Assuming Holiday maps to the 3rd state

      // Add new status count
      if (newStatus === "Present") updated.present++;
      if (newStatus === "Absent") updated.absent++;
      if (newStatus === "Holiday") updated.late++;

      return updated;
    });
  };

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
        >
          &larr; Back to List
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Student Report</h1>
          <p className="text-gray-500 text-sm">Detailed attendance history for ID: {studentId}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 font-semibold mb-2">Total Present</h3>
          <p className="text-4xl font-bold text-green-500">{summary.present}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 font-semibold mb-2">Total Absent</h3>
          <p className="text-4xl font-bold text-red-500">{summary.absent}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <h3 className="text-gray-500 font-semibold mb-2">Total Holidays/Late</h3>
          <p className="text-4xl font-bold text-gray-500">{summary.late}</p>
        </div>
      </div>

      {/* The Reused Calendar Component */}
      <div className="max-w-4xl mx-auto">
        <TeacherAttendanceCalendar 
          initialHistory={[]} 
          onUpdate={handleUpdate} 
        />
      </div>
    </div>
  );
}
