// import React, { useState } from "react";

// const mockAttendance = [
//   { id: 1, name: "Aarav Kumar", studentId: "STU2023015", status: "Present" },
//   { id: 2, name: "Diya Sharma", studentId: "STU2023022", status: "Absent" },
//   { id: 3, name: "Vihaan Singh", studentId: "STU2023034", status: "Late" },
//   { id: 4, name: "Ananya Krishnan", studentId: "STU2023041", status: "Present" },
// ];

// export default function AdminAttendance() {
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [grade, setGrade] = useState("10");
//   const [section, setSection] = useState("A");
//   const [records, setRecords] = useState(mockAttendance);
//   const [toast, setToast] = useState(null);

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleStatusChange = (id, newStatus) => {
//     setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
//   };

//   const saveAttendance = () => {
//     showToast("Attendance saved successfully for " + date);
//   };

//   return (
//     <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
//       {toast && (
//         <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
//           {toast}
//         </div>
//       )}

//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-[#1a1f36]">Daily Attendance</h1>
//           <p className="text-gray-500 text-sm">Mark and manage student attendance</p>
//         </div>
//         <button onClick={saveAttendance} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
//           Save Attendance
//         </button>
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex gap-4 flex-wrap">
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
//           <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none" />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
//           <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
//             {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Class {i+1}</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
//           <select value={section} onChange={(e) => setSection(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[100px]">
//             {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
//           </select>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
//                 <th className="p-4 font-bold border-b border-gray-200">Roll / ID</th>
//                 <th className="p-4 font-bold border-b border-gray-200">Student Name</th>
//                 <th className="p-4 font-bold border-b border-gray-200">Status</th>
//                 <th className="p-4 font-bold border-b border-gray-200">Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm">
//               {records.map((r) => (
//                 <tr key={r.id} className="hover:bg-gray-50 border-b border-gray-100">
//                   <td className="p-4"><span className="font-mono text-[#3949ab] font-bold">{r.studentId}</span></td>
//                   <td className="p-4 font-semibold text-gray-800">{r.name}</td>
//                   <td className="p-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                       r.status === 'Present' ? 'bg-green-100 text-green-700' :
//                       r.status === 'Absent' ? 'bg-red-100 text-red-700' :
//                       'bg-yellow-100 text-yellow-700'
//                     }`}>
//                       {r.status}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex gap-2">
//                       <button onClick={() => handleStatusChange(r.id, 'Present')} className={`px-3 py-1.5 rounded font-semibold text-xs border ${r.status === 'Present' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>Present</button>
//                       <button onClick={() => handleStatusChange(r.id, 'Absent')} className={`px-3 py-1.5 rounded font-semibold text-xs border ${r.status === 'Absent' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>Absent</button>
//                       <button onClick={() => handleStatusChange(r.id, 'Late')} className={`px-3 py-1.5 rounded font-semibold text-xs border ${r.status === 'Late' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>Late</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";

const studentData = [
  { id: 1, name: "Aarav Kumar", idCode: "STU015", status: "Present" },
  { id: 2, name: "Diya Sharma", idCode: "STU022", status: "Absent" },
];

const teacherData = [
  { id: 1, name: "Mr. Rajesh Verma", idCode: "TCH001", status: "Present" },
  { id: 2, name: "Ms. Sunita Rao", idCode: "TCH002", status: "Late" },
];

const staffData = [
  { id: 1, name: "Amit Kumar (Admin)", idCode: "STF001", status: "Present" },
];

export default function AdminAttendance() {
  const [activeTab, setActiveTab] = useState("students");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState(studentData);
  const [toast, setToast] = useState(null);

  // Switch data when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "students") setRecords(studentData);
    else if (tab === "teachers") setRecords(teacherData);
    else setRecords(staffData);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (id, newStatus) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Attendance Management</h1>
          <p className="text-gray-500 text-sm">Manage attendance for Students, Teachers, and Staff</p>
        </div>
        <button onClick={() => showToast("Attendance Saved")} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['students', 'teachers', 'staff'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
              activeTab === tab ? "bg-[#3949ab] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">ID / Code</th>
              <th className="p-4 font-bold">Name</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
                <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
                <td className="p-4 font-semibold text-gray-800">{r.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    r.status === 'Present' ? 'bg-green-100 text-green-700' :
                    r.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusChange(r.id, 'Present')} className="px-2 py-1 bg-green-500 text-white rounded text-xs">P</button>
                    <button onClick={() => handleStatusChange(r.id, 'Absent')} className="px-2 py-1 bg-red-500 text-white rounded text-xs">A</button>
                    <button onClick={() => handleStatusChange(r.id, 'Late')} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs">L</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}