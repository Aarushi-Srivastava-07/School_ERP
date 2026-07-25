import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

import AdminSidebar from "./Adminsidebar";
import CommonNavbar from "../../components/layout/CommonNavbar";
import Footer from "../../components/layout/Footer";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#F8FAFF] min-h-screen h-screen">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#2f3273] text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={22} />
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <CommonNavbar
          title="Admin Dashboard"
          role="Admin"
        />

        <Outlet />

        <Footer />
      </main>
    </div>
  );
};

export default AdminLayout;