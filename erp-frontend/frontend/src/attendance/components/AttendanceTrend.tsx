import React from "react";

type TrendData = {
  day: string;
  present: number;
  absent: number;
};

type AttendanceTrendProps = {
  trendData?: TrendData[];
};

const AttendanceTrend: React.FC<AttendanceTrendProps> = ({ trendData }) => {
  // Default dummy data for backward compatibility
  const defaultTrend = [
    { day: "Mon", present: 5, absent: 1 },
    { day: "Tue", present: 4, absent: 2 },
    { day: "Wed", present: 6, absent: 0 },
    { day: "Thu", present: 5, absent: 1 },
    { day: "Fri", present: 4, absent: 2 },
    { day: "Sat", present: 2, absent: 4 },
    { day: "Sun", present: 3, absent: 3 },
  ];

  const data = Array.isArray(trendData) && trendData.length > 0 ? trendData : defaultTrend;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Attendance Trend</h2>
      <div className="grid grid-cols-7 gap-2 text-center">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-sm text-gray-600 mb-1">{d.day}</span>
            <div className="flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500" title={`Present: ${d.present}`} />
              <span className="w-2 h-2 rounded-full bg-red-500" title={`Absent: ${d.absent}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceTrend;
