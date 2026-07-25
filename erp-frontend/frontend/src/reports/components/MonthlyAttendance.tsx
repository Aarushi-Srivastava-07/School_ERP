
import React from "react";

type MonthlyData = {
  month: string;
  present: number;
  absent: number;
  percentage: number;
};

type MonthlyAttendanceProps = {
  monthlyData?: MonthlyData[];
};

export const MonthlyAttendance: React.FC<MonthlyAttendanceProps> = ({
  monthlyData = [],
}) => {
  const safeData = Array.isArray(monthlyData) ? monthlyData : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Monthly Attendance Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {safeData.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {item.month}
            </h3>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-green-600">Present: {item.present}</span>
              <span className="text-xs text-red-600">Absent: {item.absent}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.percentage < 75
                      ? "bg-red-500"
                      : item.percentage < 85
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="text-right text-xs font-semibold text-gray-700 mt-1">
                {item.percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
