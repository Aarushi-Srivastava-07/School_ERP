// import React, { useState } from 'react';
// import { mockSchoolResults } from '../mockSchoolData';

// const AdminResultsDashboard: React.FC = () => {
//   const [selectedGrade, setSelectedGrade] = useState(mockSchoolResults[0].grade);
//   const [isPublished, setIsPublished] = useState(false);
  
//   const currentGradeData = mockSchoolResults.find(g => g.grade === selectedGrade);
//   const [selectedSection, setSelectedSection] = useState(currentGradeData?.sections[0].name || "");

//   // Get current section and its students
//   const currentSection = currentGradeData?.sections.find(s => s.name === selectedSection);
  
//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">School Examination Analytics</h1>
//         <button 
//           onClick={() => setIsPublished(!isPublished)}
//           className={`px-4 py-2 rounded-lg font-semibold transition-colors shadow ${
//             isPublished ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           {isPublished ? "Results Published" : "Publish Results"}
//         </button>
//       </div>
      
//       {/* Filters */}
//       <div className="flex gap-4 mb-8">
//         <select 
//           className="border p-2 rounded-lg"
//           value={selectedGrade}
//           onChange={(e) => {
//             setSelectedGrade(e.target.value);
//             setSelectedSection(mockSchoolResults.find(g => g.grade === e.target.value)?.sections[0].name || "");
//           }}
//         >
//           {mockSchoolResults.map(g => <option key={g.grade} value={g.grade}>{g.grade}</option>)}
//         </select>

//         <select 
//           className="border p-2 rounded-lg"
//           value={selectedSection}
//           onChange={(e) => setSelectedSection(e.target.value)}
//         >
//           {currentGradeData?.sections.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
//         </select>
//       </div>

//       {/* Grade-Wide Leaderboard */}
//         <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-6 rounded-lg shadow-lg mb-8 text-white">
//         <h2 className="text-xl font-bold mb-4">🏆 {selectedGrade} - School Toppers (Overall)</h2>
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             {/* Accessing the gradeTopStudents from the grade data */}
//             {mockSchoolResults
//             .find(g => g.grade === selectedGrade)
//             ?.gradeTopStudents.slice(0, 5)
//             .map((student, idx) => (
//                 <div key={idx} className="bg-white/10 p-3 rounded-lg text-center backdrop-blur-sm">
//                 <p className="text-xs text-indigo-200 uppercase font-bold">Rank {idx + 1}</p>
//                 <p className="text-lg font-bold">{student.name}</p>
//                 <p className="text-sm font-semibold text-yellow-300">{student.score}%</p>
//                 </div>
//             ))}
//         </div>
//         </div>

//       {/* Analytics Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-blue-50 p-6 rounded-lg shadow border-l-4 border-blue-500">
//           <p className="text-blue-800 text-sm font-medium">Class Average</p>
//           <p className="text-3xl font-bold">{currentSection?.classAvg}%</p>
//         </div>
//         <div className="bg-indigo-50 p-6 rounded-lg shadow border-l-4 border-indigo-500">
//           <p className="text-indigo-800 text-sm font-medium">Top Student</p>
//           <p className="text-xl font-bold mt-2">{currentSection?.students[0].name}</p>
//         </div>
//         <div className="bg-green-50 p-6 rounded-lg shadow border-l-4 border-green-500">
//           <p className="text-green-800 text-sm font-medium">Exam Status</p>
//           <p className="text-xl font-bold mt-2">{isPublished ? "Publicly Visible" : "Draft Mode"}</p>
//         </div>
//       </div>

//       {/* Comparison Chart */}
//       <div className="bg-white p-6 rounded-lg shadow mt-8">
//         <h2 className="text-lg font-bold mb-6 text-gray-800">Section Performance ({selectedGrade})</h2>
//         <div className="flex items-end justify-around h-48 border-b border-l px-4 pb-2">
//           {currentGradeData?.sections.map((sec) => (
//             <div key={sec.name} className="flex flex-col items-center w-full mx-2">
//               <div 
//                 className="w-16 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all"
//                 style={{ height: `${sec.classAvg}%` }}
//               ></div>
//               <p className="text-xs mt-2 font-bold text-gray-600">{sec.name}</p>
//               <p className="text-xs font-semibold text-gray-800">{sec.classAvg}%</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Ranked Student Table */}
//       <div className="bg-white shadow rounded-lg mt-8 overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="p-4 font-semibold text-gray-700">Rank</th>
//               <th className="p-4 font-semibold text-gray-700">Student Name</th>
//               <th className="p-4 font-semibold text-gray-700">Score</th>
//               <th className="p-4 font-semibold text-gray-700">Performance</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentSection?.students.map((student, index) => (
//               <tr key={index} className="border-b hover:bg-gray-50">
//                 <td className="p-4 font-bold text-indigo-600">#{index + 1}</td>
//                 <td className="p-4">{student.name}</td>
//                 <td className="p-4 font-semibold">{student.score}</td>
//                 <td className="p-4">
//                    <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
//                      <div className="bg-indigo-500 h-full" style={{ width: `${student.score}%` }}></div>
//                    </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminResultsDashboard;


import React, { useState } from 'react';
import { mockSchoolResults } from '../mockSchoolData';

const AdminResultsDashboard: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState(mockSchoolResults[0].grade);
  const [isPublished, setIsPublished] = useState(false);
  
  const currentGradeData = mockSchoolResults.find(g => g.grade === selectedGrade);
  const [selectedSection, setSelectedSection] = useState(currentGradeData?.sections[0].name || "");

  const currentSection = currentGradeData?.sections.find(s => s.name === selectedSection);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">School Examination Analytics</h1>
        <button 
          onClick={() => setIsPublished(!isPublished)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shadow ${
            isPublished ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isPublished ? "Results Published" : "Publish Results"}
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <select 
          className="border p-2 rounded-lg"
          value={selectedGrade}
          onChange={(e) => {
            setSelectedGrade(e.target.value);
            setSelectedSection(mockSchoolResults.find(g => g.grade === e.target.value)?.sections[0].name || "");
          }}
        >
          {mockSchoolResults.map(g => <option key={g.grade} value={g.grade}>{g.grade}</option>)}
        </select>

        <select 
          className="border p-2 rounded-lg"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {currentGradeData?.sections.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Grade-Wide Leaderboard */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-6 rounded-lg shadow-lg mb-8 text-white">
        <h2 className="text-xl font-bold mb-4">🏆 {selectedGrade} - School Toppers (Overall)</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {mockSchoolResults
            .find(g => g.grade === selectedGrade)
            ?.gradeTopStudents.slice(0, 5)
            .map((student, idx) => (
              <div key={idx} className="bg-white/10 p-3 rounded-lg text-center backdrop-blur-sm">
                <p className="text-xs text-indigo-200 uppercase font-bold">Rank {idx + 1}</p>
                <p className="text-lg font-bold">{student.name}</p>
                <p className="text-sm font-semibold text-yellow-300">{student.score}%</p>
              </div>
            ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-blue-800 text-sm font-medium">Class Average</p>
          <p className="text-3xl font-bold">{currentSection?.classAvg}%</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <p className="text-indigo-800 text-sm font-medium">Top Student</p>
          <p className="text-xl font-bold mt-2">{currentSection?.students[0]?.name || "N/A"}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-green-800 text-sm font-medium">Exam Status</p>
          <p className="text-xl font-bold mt-2">{isPublished ? "Publicly Visible" : "Draft Mode"}</p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-lg font-bold mb-6 text-gray-800">Section Performance Comparison ({selectedGrade})</h2>
        <div className="flex items-end justify-around h-64 border-b border-l px-4 pb-2">
          {currentGradeData?.sections.map((sec) => (
            <div key={sec.name} className="flex flex-col items-center w-full mx-2 h-full justify-end">
              <div 
                className="w-16 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all duration-500"
                style={{ height: `${sec.classAvg}%`, minHeight: '5px' }}
              ></div>
              <p className="text-xs mt-2 font-bold text-gray-600">{sec.name}</p>
              <p className="text-xs font-semibold text-gray-800">{sec.classAvg}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Student Table */}
      <div className="bg-white shadow rounded-lg mt-8 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Rank</th>
              <th className="p-4 font-semibold text-gray-700">Student Name</th>
              <th className="p-4 font-semibold text-gray-700">Score</th>
              <th className="p-4 font-semibold text-gray-700">Performance</th>
            </tr>
          </thead>
          <tbody>
            {currentSection?.students.map((student, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold text-indigo-600">#{index + 1}</td>
                <td className="p-4">{student.name}</td>
                <td className="p-4 font-semibold">{student.score}</td>
                <td className="p-4">
                   <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                     <div className="bg-indigo-500 h-full" style={{ width: `${student.score}%` }}></div>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminResultsDashboard;