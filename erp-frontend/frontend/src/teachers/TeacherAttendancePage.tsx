// import React, { useState } from 'react';
// import { mockClassResults } from './mockData';
// import { useNavigate } from 'react-router-dom';
// import { mockTeacherAttendance } from './mockAttendanceData';

// const TeacherAttendancePage: React.FC = () => {
//   // Combine data by ID so we have both name and attendance stats
//   const classData = mockClassResults.map(student => ({
//     ...student,
//     attendance: mockTeacherAttendance.find(a => a.id === student.id)
//   }));

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Class Attendance Overview</h1>
      
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="p-4">Roll No</th>
//               <th className="p-4">Student Name</th>
//               <th className="p-4">Overall Attendance</th>
//               <th className="p-4">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {classData.map((student) => (
//               <tr key={student.id} className="border-b hover:bg-gray-50">
//                 <td className="p-4">{student.id}</td>
//                 <td className="p-4 font-semibold">{student.name}</td>
//                 <td className="p-4">{student.attendance?.overall}%</td>
//                 <td className="p-4">
//                   <button className="text-indigo-600 font-semibold hover:underline">
//                     View Detailed Report
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TeacherAttendancePage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockClassResults } from './mockData';
import { mockTeacherAttendance } from './mockAttendanceData';

const TeacherAttendancePage: React.FC = () => {
  // 1. INITIALIZE THE HOOK HERE
  const navigate = useNavigate();

  // Combine data by ID so we have both name and attendance stats
  const classData = mockClassResults.map((student) => ({
    ...student,
    attendance: mockTeacherAttendance.find((a) => a.id === student.id),
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Class Attendance Overview</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Overall Attendance</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {classData.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{student.id}</td>
                <td className="p-4 font-semibold">{student.name}</td>
                <td className="p-4">{student.attendance?.overall}%</td>
                <td className="p-4">
                  <button
                    onClick={() => {
                      console.log("Navigating to:", `/teacher/attendance/${student.id}`);
                      navigate(`/teacher/attendance/${student.id}`);
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    View Detailed Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;