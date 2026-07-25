import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

import TeacherSidebar from "./TeacherSidebar";
import CommonNavbar from "../../components/layout/CommonNavbar";
import Footer from "../../components/layout/Footer";

const TeacherLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFF]">
      {/* Sidebar */}
      <TeacherSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-5 left-4 z-50 p-2 rounded-lg bg-[#2f3273] text-white shadow-lg md:hidden hover:bg-[#24265a] transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
        <CommonNavbar
          title="Teacher Dashboard"
          role="Teacher"
        />

        <Outlet />

        <Footer />
      </main>
    </div>
  );
};

export default TeacherLayout;