// import React, { useMemo, useState } from 'react';
// import { mockClassResults } from './mockData';

// const ClassResultsPage: React.FC = () => {
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<any>(null);

//   // Process data: Calculate total, avg, and status for each student
//   const processedData = useMemo(() => {
//     return mockClassResults.map(student => {
//       const total = student.subjects.reduce((sum, s) => sum + s.m, 0);
//       const avg = parseFloat((total / student.subjects.length).toFixed(2));
//       return {
//         ...student,
//         total,
//         avg,
//         status: avg >= 33 ? 'pass' : 'fail'
//       };
//     }).sort((a, b) => b.total - a.total);
//   }, []);

//   const distribution = useMemo(() => {
//       const buckets = [
//         { range: "91-100", count: 0 }, { range: "81-90", count: 0 },
//         { range: "71-80", count: 0 }, { range: "61-70", count: 0 },
//         { range: "51-60", count: 0 }, { range: "41-50", count: 0 },
//         { range: "31-40", count: 0 }, { range: "0-30", count: 0 },
//       ];

//       processedData.forEach(s => {
//         if (s.avg >= 91) buckets[0].count++;
//         else if (s.avg >= 81) buckets[1].count++;
//         else if (s.avg >= 71) buckets[2].count++;
//         else if (s.avg >= 61) buckets[3].count++;
//         else if (s.avg >= 51) buckets[4].count++;
//         else if (s.avg >= 41) buckets[5].count++;
//         else if (s.avg >= 31) buckets[6].count++;
//         else buckets[7].count++;
//       });
//   return buckets;
// }, [processedData]);

//   // Calculate Class Summary
//   const classAvg = (processedData.reduce((sum, s) => sum + s.avg, 0) / processedData.length).toFixed(2);
//   const failCount = processedData.filter(s => s.status === 'fail').length;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Class Examination Records</h1>
//         <button 
//           onClick={() => { setSelectedStudent(null); setIsEditModalOpen(true); }}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           + Upload New Marks
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
//           <p className="text-gray-500 text-sm">Class Average</p>
//           <p className="text-2xl font-bold">{classAvg}%</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
//           <p className="text-gray-500 text-sm">Underperforming</p>
//           <p className="text-2xl font-bold">{failCount} Students</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
//           <p className="text-gray-500 text-sm">Total Students</p>
//           <p className="text-2xl font-bold">{processedData.length}</p>
//         </div>
//       </div>

//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="min-w-full text-left">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 font-semibold text-gray-700">Rank & Name</th>
//               <th className="px-6 py-3 font-semibold text-gray-700">Subjects</th>
//               <th className="px-6 py-3 font-semibold text-gray-700">Total Marks</th>
//               <th className="px-6 py-3 font-semibold text-gray-700">Percentage</th>
//               <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
//               <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {processedData.map((res, index) => (
//               <tr key={res.id}>
//                 <td 
//                     className="px-6 py-4 font-bold cursor-pointer hover:text-blue-600"
//                     onClick={() => { setSelectedStudent(res); setIsEditModalOpen(true); }}
//                 >
//                     #{index + 1} {res.name}
//                 </td>
//                 <td className="px-6 py-4 text-sm">{res.subjects.length}</td>
//                 <td className="px-6 py-4">{res.total}</td>
//                 <td className="px-6 py-4">{res.avg}%</td>
//                 <td className="px-6 py-4">
//                   <span className={`px-2 py-1 rounded text-sm ${res.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                     {(res.status || 'pending').toUpperCase()}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <button 
//                     onClick={() => { setSelectedStudent(res); setIsEditModalOpen(true); }}
//                     className="text-blue-600 hover:underline"
//                   >Edit</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       {isEditModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
//                 <h2 className="text-xl font-bold mb-4">
//                     {selectedStudent ? `Edit Marks: ${selectedStudent.name}` : "Upload New Marks"}
//                 </h2>
//                 {selectedStudent ? (
//                     selectedStudent.subjects.map((s: any) => (
//                         <div key={s.name} className="flex justify-between py-2 border-b">
//                             <span className="text-gray-700">{s.name}</span>
//                             <input type="number" defaultValue={s.m} className="w-20 border rounded text-center p-1" />
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-gray-500 italic">Select a student from the table to view their performance details.</p>
//                 )}
//                 <div className="mt-6 flex justify-end gap-3">
//                     <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
//                     <button className="px-4 py-2 bg-blue-600 text-white rounded">Save Changes</button>
//                 </div>
//             </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClassResultsPage;

import { useMemo, useState, type FC } from 'react';
import { mockClassResults } from './mockData';

interface SubjectDetail {
  name: string;
  m: number;
}

interface StudentResult {
  id: number;
  name: string;
  subjects: SubjectDetail[];
  total: number;
  avg: number;
  status: string;
}

const ClassResultsPage: FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  // Process data: Calculate total, avg, and status for each student
  const processedData = useMemo(() => {
    return mockClassResults.map(student => {
      const total = student.subjects.reduce((sum, s) => sum + s.m, 0);
      const avg = parseFloat((total / student.subjects.length).toFixed(2));
      return {
        ...student,
        total,
        avg,
        status: avg >= 33 ? 'pass' : 'fail'
      };
    }).sort((a, b) => b.total - a.total);
  }, []);

  // Calculate Distribution for the Chart
  const distribution = useMemo(() => {
    const buckets = [
      { range: "91-100", count: 0 }, { range: "81-90", count: 0 },
      { range: "71-80", count: 0 }, { range: "61-70", count: 0 },
      { range: "51-60", count: 0 }, { range: "41-50", count: 0 },
      { range: "31-40", count: 0 }, { range: "0-30", count: 0 },
    ];
    processedData.forEach(s => {
      if (s.avg >= 91) buckets[0].count++;
      else if (s.avg >= 81) buckets[1].count++;
      else if (s.avg >= 71) buckets[2].count++;
      else if (s.avg >= 61) buckets[3].count++;
      else if (s.avg >= 51) buckets[4].count++;
      else if (s.avg >= 41) buckets[5].count++;
      else if (s.avg >= 31) buckets[6].count++;
      else buckets[7].count++;
    });
    return buckets;
  }, [processedData]);

  // Calculate Class Summary
  const classAvg = (processedData.reduce((sum, s) => sum + s.avg, 0) / processedData.length).toFixed(2);
  const failCount = processedData.filter(s => s.status === 'fail').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Examination Records</h1>
        <button 
          onClick={() => { setSelectedStudent(null); setIsEditModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Upload New Marks
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Class Average</p>
          <p className="text-2xl font-bold">{classAvg}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Underperforming</p>
          <p className="text-2xl font-bold">{failCount} Students</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Students</p>
          <p className="text-2xl font-bold">{processedData.length}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Rank & Name</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Subjects</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Total Marks</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Percentage</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedData.map((res, index) => (
              <tr key={res.id}>
                <td 
                    className="px-6 py-4 font-bold cursor-pointer hover:text-blue-600"
                    onClick={() => { setSelectedStudent(res); setIsEditModalOpen(true); }}
                >
                    #{index + 1} {res.name}
                </td>
                <td className="px-6 py-4 text-sm">{res.subjects.length}</td>
                <td className="px-6 py-4">{res.total}</td>
                <td className="px-6 py-4">{res.avg}%</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${res.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {(res.status || 'pending').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => { setSelectedStudent(res); setIsEditModalOpen(true); }}
                    className="text-blue-600 hover:underline"
                  >Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Distribution Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Performance Distribution (Buckets)</h2>
        <div className="flex items-end justify-between h-48 border-b border-l px-4 pb-2">
            {distribution.map((b) => (
            <div key={b.range} className="flex flex-col items-center w-full">
                <div 
                className="w-12 bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                style={{ height: `${b.count * 40}px` }}
                ></div>
                <p className="text-xs mt-2 font-semibold text-gray-600">{b.range}</p>
                <p className="text-sm font-bold text-gray-800">{b.count}</p>
            </div>
            ))}
        </div>
      </div>

      {/* Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {selectedStudent ? `Edit Marks: ${selectedStudent.name}` : "Upload New Marks"}
                </h2>
                {selectedStudent ? (
                    selectedStudent.subjects.map((s: SubjectDetail) => (
                        <div key={s.name} className="flex justify-between py-2 border-b">
                            <span className="text-gray-700">{s.name}</span>
                            <input type="number" defaultValue={s.m} className="w-20 border rounded text-center p-1" />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">Select a student from the table to view their performance details.</p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded">Save Changes</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClassResultsPage;
