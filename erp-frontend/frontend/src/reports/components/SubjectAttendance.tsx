
import React from "react";

type Subject = {
  name: string;
  present: number;
  absent: number;
  percentage: number;
};

type SubjectAttendanceProps = {
  subjects?: Subject[];
};

export const SubjectAttendance: React.FC<SubjectAttendanceProps> = ({
  subjects = [],
}) => {
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Subject-wise Attendance
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Subject
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                Present
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                Absent
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                Attendance %
              </th>
            </tr>
          </thead>
          <tbody>
            {safeSubjects.map((subject, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-medium text-gray-800">
                  {subject.name}
                </td>
                <td className="py-4 px-4 text-right text-sm text-gray-600">
                  {subject.present}
                </td>
                <td className="py-4 px-4 text-right text-sm text-gray-600">
                  {subject.absent}
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`text-sm font-semibold ${
                      subject.percentage < 75
                        ? "text-red-600"
                        : subject.percentage < 85
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {subject.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
