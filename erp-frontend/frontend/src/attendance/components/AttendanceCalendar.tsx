import React from "react";

type CalendarDay = {
  day: number;
  status: "present" | "absent" | "late" | "holiday";
};

type AttendanceCalendarProps = {
  year?: number;
  month?: number;
  days?: CalendarDay[];
  rollNo?: string;
};

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ 
  year = new Date().getFullYear(), 
  month = new Date().getMonth(), 
  days = [], 
  rollNo = "21" 
}) => {
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const today = new Date();

  // Generate dummy data if no days provided (for backward compatibility)
  const calendarDays = Array.isArray(days) && days.length > 0 ? days : Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => ({
    day: i + 1,
    status: (i + 1) % 7 === 0 ? "holiday" : (i + 1) % 5 === 0 ? "absent" : "present" as const,
  }));

  // Weekday of the first of the month (Monday = 0, Sunday = 6)
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Roll No. {rollNo} – {monthName} {year}</h2>
      {/* Header row with weekdays */}
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
        {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before the first day */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* Actual day cells */}
        {calendarDays.map(({ day, status }) => {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const dotColor =
            status === "present"
              ? "bg-green-500"
              : status === "absent"
              ? "bg-red-500"
              : status === "late"
              ? "bg-yellow-500"
              : "bg-gray-400";
          return (
            <div
              key={day}
              className={`flex flex-col items-center p-1 border rounded ${isToday ? "border-blue-500" : "border-transparent"}`}
            >
              <span className="text-sm mb-1">{day}</span>
              <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
