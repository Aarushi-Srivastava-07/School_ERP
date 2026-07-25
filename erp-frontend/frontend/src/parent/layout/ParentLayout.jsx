import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

import ParentSidebar from "../components/ParentSidebar";
import CommonNavbar from "../../components/layout/CommonNavbar";
import Footer from "../../components/layout/Footer";

import { ParentPreviewProvider } from "../context/ParentPreviewContext";

function ParentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ParentPreviewProvider>
      <div className="flex bg-[#F8FAFF] min-h-screen">
        <ParentSidebar
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

        <main className="flex-1 p-6 overflow-y-auto">
          <CommonNavbar
            title="Parent Dashboard"
            role="Parent"
          />

          <Outlet />

          <Footer />
        </main>
      </div>
    </ParentPreviewProvider>
  );
}

export default ParentLayout;