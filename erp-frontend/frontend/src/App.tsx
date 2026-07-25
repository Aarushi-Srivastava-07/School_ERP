import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import AdminResultsDashboard from "./admin/pages/AdminResultsDashboard";
import Dashboard from "./students/pages/Dashboard";
import Attendance from "./students/pages/Attendance";
import Profile from "./students/pages/Profile";
import StudentSidebar from "./students/components/StudentSidebar";
import ResultsPage from "./exams/ResultsPage"; 
import ClassResultsPage from "./teachers/ClassResultsPage"; 
import { CreateAssignment, StudentDashboard, TeacherDashboard } from './assignments';
import { NotificationsPage } from "./notifications/pages/Notifications";
import { AttendanceReports } from "./reports/pages/AttendanceReports";
import TeacherLayout from "./teachers/components/TeacherLayout";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import CommonNavbar from "./components/layout/CommonNavbar";
import Footer from "./components/layout/Footer";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLayout from "./admin/components/AdminLayout";
import TeacherAttendancePage from "./teachers/TeacherAttendancePage";
import StudentDetailAttendance from "./teachers/StudentDetailAttendance";
import AdminStudents from "./students/pages/Students";
import AdminTeachers from "./teachers/Teachers";
import AdminParents from "./parent/Parents";
import AdminAttendance from "./attendance/pages/AdminAttendance";
import Fees from "./fees/Fees";
import Timetable from "./timetable/Timetable";
import Library from "./Library/Library";
import Reports from "./reports/Reports";
import Settings from "./settings/Settings";
import AdminStudentAttendanceDetail from "./attendance/pages/AdminStudentAttendanceDetail";

import ParentLayout from "./parent/layout/ParentLayout";
import ParentDashboard from "./parent/pages/ParentDashboard";
import AttendancePage from "./parent/pages/AttendancePage";
import MarksPage from "./parent/pages/MarksPage";
import AssignmentsPage from "./parent/pages/AssignmentsPage";
import HomeworkPage from "./parent/pages/HomeworkPage";
import ExaminationsPage from "./parent/pages/ExaminationsPage";
import TimetablePage from "./parent/pages/TimetablePage";
import FeesPage from "./parent/pages/FeesPage";
import ParentNotificationsPage from "./parent/pages/NotificationsPage";
import RemarksPage from "./parent/pages/RemarksPage";
import SettingsPage from "./parent/pages/SettingsPage";


const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex bg-[#F8FAFF] min-h-screen">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed top-4 left-4 z-50 bg-[#2f3273] text-white p-2 rounded-lg shadow-lg">
        <Menu size={22} />
      </button>
      <main className="flex-1 p-6 overflow-y-auto">
        <CommonNavbar title="Student Dashboard" role="Student" />
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

       
        {/* Protected Student Routes */}
        
        <Route
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/assignments" element={<StudentDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/attendance-reports" element={<AttendanceReports />} />
        </Route>

        
        {/* Admin Routes */}
       
        <Route
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/results" element={<AdminResultsDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/parents" element={<AdminParents />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/attendance/student/:studentId" element={<AdminStudentAttendanceDetail />} />
          <Route path="/admin/fees" element={<Fees />} />
          <Route path="/admin/timetable" element={<Timetable />} />
          <Route path="/admin/library" element={<Library />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
          
        {/* Parent Routes */}
        <Route
          element={
            <ProtectedRoute allowedRole="parent">
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/attendance" element={<AttendancePage />} />
          <Route path="/parent/marks" element={<MarksPage />} />
          <Route path="/parent/assignments" element={<AssignmentsPage />} />
          <Route path="/parent/homework" element={<HomeworkPage />} />
          <Route path="/parent/examinations" element={<ExaminationsPage />} />
          <Route path="/parent/timetable" element={<TimetablePage />} />
          <Route path="/parent/fees" element={<FeesPage />} />
          <Route path="/parent/notifications" element={<ParentNotificationsPage />} />
          <Route path="/parent/remarks" element={<RemarksPage />} />
          <Route path="/parent/settings" element={<SettingsPage />} />
        </Route>


        <Route element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
          <Route path="/teacher/assignments" element={<TeacherDashboard />} />
          <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
          <Route path="/teacher/results" element={<ClassResultsPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/teacher/attendance/:studentId" element={<StudentDetailAttendance />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
