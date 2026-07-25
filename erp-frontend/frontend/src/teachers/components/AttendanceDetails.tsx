// import React, { useState } from "react";
// import TeacherAttendanceCalendar from "../TeacherAttendanceCalendar";
// import AttendanceSummary from "../../../attendance/components/AttendanceSummary";
// import AttendanceTable from "../../../attendance/components/AttendanceTable";
// import AttendanceTrend from "../../../attendance/components/AttendanceTrend";

// interface AttendanceDetailsProps {
//   studentName: string;
//   data: any; 
// }

// const AttendanceDetails: React.FC<AttendanceDetailsProps> = ({ studentName, data }) => {
//   // Initialize state with data from props to make summary cards dynamic
//   const [summary, setSummary] = useState({
//     present: data.present || 0,
//     absent: data.absent || 0,
//   });

//   const handleUpdate = (newStatus: string, oldStatus: string) => {
//     setSummary((prev) => ({
//       present: newStatus === "Present" ? prev.present + 1 : (oldStatus === "Present" ? prev.present - 1 : prev.present),
//       absent: newStatus === "Absent" ? prev.absent + 1 : (oldStatus === "Absent" ? prev.absent - 1 : prev.absent),
//     }));
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-bold text-gray-800">Attendance Report: {studentName}</h2>
//         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
//           Edit Attendance
//         </button>
//       </div>
      
//       {/* AttendanceSummary needs to be updated to accept these props in its own file */}
//       <AttendanceSummary /> 
      
//       {/* Pass required props to prevent crash */}
//       <TeacherAttendanceCalendar 
//         initialHistory={data.history || []} 
//         onUpdate={handleUpdate} 
//       />
      
//       <AttendanceTrend />
//       <AttendanceTable recent={data.history || []} />
//     </div>
//   );
// };

// export default AttendanceDetails;


import type { FC } from "react";
import TeacherAttendanceCalendar from "./TeacherAttendanceCalendar";
import AttendanceSummary from "../../attendance/components/AttendanceSummary";
import AttendanceTable from "../../attendance/components/AttendanceTable";
import AttendanceTrend from "../../attendance/components/AttendanceTrend";

interface AttendanceHistoryItem {
  date: string;
  day?: number;
  status: string;
}

interface AttendanceData {
  id?: number;
  overall?: number;
  present?: number;
  absent?: number;
  late?: number;
  history?: AttendanceHistoryItem[];
}

interface AttendanceDetailsProps {
  studentName: string;
  data?: AttendanceData | null;
}

const AttendanceDetails: FC<AttendanceDetailsProps> = ({ studentName, data }) => {
  // Handler to update local state when calendar is toggled
  const handleUpdate = (newStatus: string, oldStatus: string) => {
    console.log(`Attendance status updated from ${oldStatus} to ${newStatus}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Attendance Report: {studentName}</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Edit Attendance
        </button>
      </div>
      
      {/* Summary display component */}
      <AttendanceSummary /> 
      
      {/* Interactive Calendar with required props passed */}
      <TeacherAttendanceCalendar 
        initialHistory={data?.history || []} 
        onUpdate={handleUpdate} 
      />
      
      <AttendanceTrend />
      
      {/* Data table for recent history */}
      <AttendanceTable recent={(data?.history || []) as { date: string; status: "Present" | "Absent" }[]} />
    </div>
  );
};

export default AttendanceDetails;
