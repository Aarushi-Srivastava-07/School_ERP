
import React from "react";

type AttendanceOverviewProps = {
  overall: number;
  present: number;
  absent: number;
  late: number;
};

export const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({
  overall,
  present,
  absent,
  late,
}) => {
  const isLowAttendance = overall < 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {isLowAttendance && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="text-2xl text-red-500">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-700">Low Attendance Warning</h3>
            <p className="text-sm text-red-600">
              Your attendance is below 75%. Please improve to avoid eligibility issues.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Overall Attendance</p>
            <p className="text-3xl font-bold text-gray-800">{overall}%</p>
          </div>
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              isLowAttendance ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            📊
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Present Days</p>
            <p className="text-3xl font-bold text-gray-800">{present}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
            ✅
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Absent Days</p>
            <p className="text-3xl font-bold text-gray-800">{absent}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl">
            ❌
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Late Arrivals</p>
            <p className="text-3xl font-bold text-gray-800">{late}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-2xl">
            ⏰
          </div>
        </div>
      </div>
    </div>
  );
};
