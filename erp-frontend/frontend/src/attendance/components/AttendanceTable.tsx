import React from "react";

type AttendanceRecord = {
  date: string;
  status: "Present" | "Absent" | "Late" | "Holiday";
};

type Props = {
  recent?: AttendanceRecord[];
};

const AttendanceTable: React.FC<Props> = ({ recent = [] }) => {
  const safeRecent = Array.isArray(recent) ? recent : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {safeRecent.map((rec, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="px-4 py-2 text-sm text-gray-800">{rec.date}</td>
              <td className="px-4 py-2 text-sm text-gray-800">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  rec.status === "Present" ? "bg-green-100 text-green-800" :
                  rec.status === "Absent" ? "bg-red-100 text-red-800" :
                  rec.status === "Late" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {rec.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
