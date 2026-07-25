// import React, { useState } from "react";

// const TeacherAttendanceCalendar: React.FC = () => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const monthName = today.toLocaleString("default", { month: "long" });
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

//   // Initialize status for every day of the month
//   const [dayStatuses, setDayStatuses] = useState(
//     Array.from({ length: daysInMonth }, (_, i) => ({
//       day: i + 1,
//       status: "Present", // Default status
//     }))
//   );

//   const toggleStatus = (index: number) => {
//     setDayStatuses((prev) =>
//       prev.map((item, i) => {
//         if (i !== index) return item;
//         const newStatus = 
//           item.status === "Present" ? "Absent" : 
//           item.status === "Absent" ? "Holiday" : "Present";
//         return { ...item, status: newStatus };
//       })
//     );
//   };

//   return (
//     <div className="p-4 bg-white rounded-lg shadow">
//       <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
//       <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
//         {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => <div key={d}>{d}</div>)}
//       </div>
      
//       <div className="grid grid-cols-7 gap-2">
//         {Array.from({ length: firstWeekday }).map((_, i) => <div key={`empty-${i}`} />)}
        
//         {dayStatuses.map(({ day, status }, index) => {
//           const dotColor = status === "Present" ? "bg-green-500" : status === "Absent" ? "bg-red-500" : "bg-gray-400";
//           return (
//             <button
//               key={day}
//               onClick={() => toggleStatus(index)}
//               className="flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors"
//             >
//               <span className="text-sm mb-1">{day}</span>
//               <span className={`w-3 h-3 rounded-full ${dotColor}`} />
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default TeacherAttendanceCalendar;

import { useState, type FC } from "react";

interface AttendanceHistoryItem {
  date?: string;
  day?: number;
  status: string;
}

// 1. MUST HAVE THIS INTERFACE
interface CalendarProps {
  initialHistory: AttendanceHistoryItem[];
  onUpdate: (newStatus: string, oldStatus: string) => void;
}

// 2. MUST APPLY THE INTERFACE TO THE COMPONENT
const TeacherAttendanceCalendar: FC<CalendarProps> = ({ initialHistory, onUpdate }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  // Use the history prop if it exists, otherwise generate default
  const [dayStatuses, setDayStatuses] = useState(
    initialHistory.length > 0 
      ? initialHistory 
      : Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, status: "Present" }))
  );

  const toggleStatus = (index: number) => {
    const oldStatus = dayStatuses[index].status;
    const newStatus = 
      oldStatus === "Present" ? "Absent" : 
      oldStatus === "Absent" ? "Holiday" : "Present";

    const newStatuses = [...dayStatuses];
    newStatuses[index] = { ...newStatuses[index], status: newStatus };
    setDayStatuses(newStatuses);

    onUpdate(newStatus, oldStatus);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
        {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => <div key={d}>{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstWeekday }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {dayStatuses.map(({ day, status }, index) => {
          const dotColor = status === "Present" ? "bg-green-500" : status === "Absent" ? "bg-red-500" : "bg-gray-400";
          return (
            <button
              key={day}
              onClick={() => toggleStatus(index)}
              className="flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors"
            >
              <span className="text-sm mb-1">{day}</span>
              <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherAttendanceCalendar;
