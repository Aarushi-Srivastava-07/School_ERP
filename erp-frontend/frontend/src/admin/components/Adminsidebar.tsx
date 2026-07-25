import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const AdminSidebar = ({ open, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { label: "Students", icon: "🎓", path: "/admin/students" },
    { label: "Teachers", icon: "👨‍🏫", path: "/admin/teachers" },
    { label: "Parents", icon: "👨‍👩‍👧", path: "/admin/parents" },
    { label: "Attendance", icon: "📅", path: "/admin/attendance" },
    { label: "Fees", icon: "💳", path: "/admin/fees" },
    { label: "Timetable", icon: "⏰", path: "/admin/timetable" },
    { label: "Exam Results", icon: "📑", path: "/admin/results" },
    { label: "Library", icon: "📚", path: "/admin/library" },
    { label: "Reports", icon: "📈", path: "/admin/reports" },
    { label: "Settings", icon: "⚙️", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0
          h-screen
          w-[280px]
          bg-[#2f3273]
          text-white
          shadow-2xl
          z-40

          transform md:transform
          transition-transform duration-300

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0 md:sticky md:flex flex-col
          overflow-y-auto
        `}
      >
        {/* Mobile Close */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={onClose}
            className="hover:text-red-300"
          >
            <X size={28} />
          </button>
        </div>

        {/* Logo */}
        <div className="px-6 pb-6 border-b border-[#44478d]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center">
              <span className="text-3xl text-[#2f3273]">
                🎓
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                School ERP
              </h1>

              <p className="text-xs uppercase tracking-[3px] text-blue-200">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-8">
          <div className="space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#4f53a7] text-white shadow-lg font-semibold"
                      : "text-blue-200 hover:bg-[#3b3e85] hover:text-white"
                  }`
                }
              >
                <span className="text-2xl">
                  {item.icon}
                </span>

                <span className="text-base">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-auto border-t border-[#44478d] p-5">
          <div className="flex items-center gap-3 rounded-xl bg-[#24265a] p-4">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-lg font-bold">
              A
            </div>

            <div>
              <p className="font-semibold text-sm">
                Administrator
              </p>

              <p className="text-xs text-blue-200">
                School ERP
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-5 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-[#3b3e85] hover:text-white transition-all duration-200"
          >
            <LogOut size={20} />

            <span className="font-medium">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
