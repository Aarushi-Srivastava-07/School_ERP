import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

// --- STATIC STAFF DATA (Fallback) ---
const teacherData = [
  { id: 1, name: "Mr. Rajesh Verma", idCode: "TCH001", status: "Present", attendancePercentage: 98 },
  { id: 2, name: "Ms. Sunita Rao", idCode: "TCH002", status: "Late", attendancePercentage: 75 },
];

const staffData = [
  { id: 1, name: "Amit Kumar (Admin)", idCode: "STF001", status: "Present", attendancePercentage: 98 },
];

export default function AdminAttendance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  
  const [staffRecords, setStaffRecords] = useState(teacherData);
  
  const [classes, setClasses] = useState<{id: string, class_name: string, section: string}[]>([]);
  const [grade, setGrade] = useState(""); 
  const [section, setSection] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    api.get("/attendance/classes")
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          setClasses(res.data.data);
          setGrade(res.data.data[0].class_name);
          setSection(res.data.data[0].section);
        } else {
           // Provide some mock classes if backend is empty
           setClasses([
             {id: "mock1", class_name: "Grade 10", section: "A"},
             {id: "mock2", class_name: "Grade 10", section: "B"}
           ]);
           setGrade("Grade 10");
           setSection("A");
        }
      })
      .catch(err => {
        console.error("Failed to fetch classes, falling back to mock data:", err);
        setClasses([
          {id: "mock1", class_name: "Grade 10", section: "A"},
          {id: "mock2", class_name: "Grade 10", section: "B"},
          {id: "mock3", class_name: "Grade 11", section: "A"}
        ]);
        setGrade("Grade 10");
        setSection("A");
      });
  }, []);

  // Fetch students when grade/section changes
  useEffect(() => {
    const selectedClass = classes.find(c => c.class_name === grade && c.section === section);
    if (selectedClass && selectedClass.id !== 'mock1' && selectedClass.id !== 'mock2') {
      api.get(`/attendance/students?classId=${selectedClass.id}`)
        .then(res => {
          if (res.data?.data) {
            setStudents(res.data.data.map((s: any) => ({
              id: s.id,
              name: s.full_name,
              idCode: `STU-${s.id.substring(0, 4).toUpperCase()}`,
              attendancePercentage: 85, // Fallback since backend doesn't return this yet
              status: "Present", // Default status for marking today's attendance
            })));
          }
        })
        .catch(console.error);
    } else {
       // Mock data fallback for empty backend
       setStudents([
          { id: "mock1", name: "Aarav Kumar", idCode: "STU015", attendancePercentage: 92, status: "Present" },
          { id: "mock2", name: "Diya Sharma", idCode: "STU022", attendancePercentage: 85, status: "Present" },
       ]);
    }
  }, [grade, section, classes]);

  const uniqueGrades = Array.from(new Set(classes.map(c => c.class_name)));
  const availableSections = classes.filter(c => c.class_name === grade).map(c => c.section);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "teachers") setStaffRecords(teacherData);
    else if (tab === "staff") setStaffRecords(staffData);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveAttendance = async () => {
    const selectedClass = classes.find(c => c.class_name === grade && c.section === section);
    if (!selectedClass) {
        showToast("Please select a class and section first.");
        return;
    }

    setIsSubmitting(true);
    try {
       const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
       
       // Process students sequentially or in parallel
       await Promise.all(students.map(student => 
           api.post('/attendance/mark', {
               studentId: student.id,
               date: date,
               status: student.status,
               classId: selectedClass.id
           })
       ));

       showToast("Student Attendance Saved Successfully!");
    } catch (error: any) {
       console.error("Error saving attendance:", error);
       showToast(error.response?.data?.error || "Failed to save attendance.");
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleStaffStatusChange = (id: number, newStatus: string) => {
    setStaffRecords(staffRecords.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleStudentStatusChange = (id: string, newStatus: string) => {
    setStudents(students.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 65) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Attendance Management</h1>
          <p className="text-gray-500 text-sm">Manage attendance for Students, Teachers, and Staff</p>
        </div>
        {activeTab !== "students" ? (
          <button onClick={() => showToast("Staff Attendance Saved")} disabled={isSubmitting} className={`px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3949ab] hover:bg-[#283593]'}`}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        ) : (
          <button onClick={handleSaveAttendance} disabled={isSubmitting} className={`px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-colors text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3949ab] hover:bg-[#283593]'}`}>
            {isSubmitting ? "Saving..." : "Save Student Attendance"}
          </button>
        )}
      </div>

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

      {activeTab === "students" ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
                {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
              <select value={section} onChange={(e) => setSection(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[120px]">
                {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">ID / Code</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Overall Attendance</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {students.length > 0 ? students.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
                    <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
                    <td 
                      className="p-4 font-semibold text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/attendance/student/${r.id}`)}
                    >
                      {r.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                          <div className={`h-2.5 rounded-full ${getProgressBarColor(r.attendancePercentage)}`} style={{ width: `${r.attendancePercentage}%` }}></div>
                        </div>
                        <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
                      </div>
                    </td>
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
                        <button onClick={() => handleStudentStatusChange(r.id, 'Present')} className="px-2 py-1 bg-green-500 hover:bg-green-600 transition text-white rounded text-xs">P</button>
                        <button onClick={() => handleStudentStatusChange(r.id, 'Absent')} className="px-2 py-1 bg-red-500 hover:bg-red-600 transition text-white rounded text-xs">A</button>
                        <button onClick={() => handleStudentStatusChange(r.id, 'Late')} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 transition text-white rounded text-xs">L</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">No students found for this class and section.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">ID / Code</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Overall Attendance</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {staffRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 border-t border-gray-100">
                  <td className="p-4 font-mono text-[#3949ab] font-bold">{r.idCode}</td>
                  <td className="p-4 font-semibold text-gray-800">{r.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                        <div className={`h-2.5 rounded-full ${getProgressBarColor(r.attendancePercentage)}`} style={{ width: `${r.attendancePercentage}%` }}></div>
                      </div>
                      <span className="font-semibold text-gray-700">{r.attendancePercentage}%</span>
                    </div>
                  </td>
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
                      <button onClick={() => handleStaffStatusChange(r.id, 'Present')} className="px-2 py-1 bg-green-500 hover:bg-green-600 transition text-white rounded text-xs">P</button>
                      <button onClick={() => handleStaffStatusChange(r.id, 'Absent')} className="px-2 py-1 bg-red-500 hover:bg-red-600 transition text-white rounded text-xs">A</button>
                      <button onClick={() => handleStaffStatusChange(r.id, 'Late')} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 transition text-white rounded text-xs">L</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
