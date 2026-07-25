// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { mockClassResults } from './mockData';
// import { mockTeacherAttendance } from './mockAttendanceData';
// import AttendanceDetails from './components/AttendanceDetails';
// // import AttendanceDetails from '/src/components/common/AttendanceDetails';
// //import AttendanceDetails from '../components/common/AttendanceDetails';
// // import AttendanceDetails from '../components/common/AttendanceDetails';

// const StudentDetailAttendance: React.FC = () => {
//   const { studentId } = useParams();
//   const navigate = useNavigate();

//   // Find the student's name and attendance data
//   const student = mockClassResults.find((s) => s.id === Number(studentId));
//   const attendance = mockTeacherAttendance.find((a) => a.id === Number(studentId));

//   if (!student || !attendance) {
//     return (
//       <div className="p-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-indigo-600 hover:underline mb-4"
//         >
//           ← Go Back
//         </button>
//         <p className="mt-4">Student or attendance record not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 text-indigo-600 hover:underline flex items-center"
//       >
//         ← Back to Class Overview
//       </button>

//       {/* This component assumes you have defined the props in AttendanceDetails.tsx 
//         as: { studentName: string; data: any; }
//       */}
//       <AttendanceDetails studentName={student.name} data={attendance} />
//     </div>
//   );
// };

// export default StudentDetailAttendance;


import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockClassResults } from './mockData';
import { mockTeacherAttendance } from './mockAttendanceData';
import AttendanceDetails from './components/common/AttendanceDetails';

const StudentDetailAttendance: FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const student = mockClassResults.find(s => s.id === Number(studentId));
  const attendance = mockTeacherAttendance.find(a => a.id === Number(studentId));

  if (!student || !attendance) {
    return <div className="p-6">Student record not found.</div>;
  }

  const dynamicData = {
    ...attendance,
    overall: attendance.overall + (student.id % 5), 
    present: attendance.present + (student.id % 10),
    absent: Math.max(0, attendance.absent - (student.id % 3)),
  };

  if (!student) {
    return <div className="p-10 text-red-500 font-bold">Error: Student not found! Check your ID matching.</div>;
  }
  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-indigo-600 hover:underline">
        ← Back to Class Overview
      </button>
      <AttendanceDetails studentName={student.name} data={dynamicData} />
    </div>
  );
};

export default StudentDetailAttendance;
