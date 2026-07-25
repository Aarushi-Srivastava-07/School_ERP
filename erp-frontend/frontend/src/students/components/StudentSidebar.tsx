import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type StudentSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const StudentSidebar = ({ open, onClose }: StudentSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    {
      label: "Dashboard",
      icon: "📊",
      path: "/dashboard",
    },
    {
      label: "Profile",
      icon: "👤",
      path: "/profile",
    },
    {
      label: "Attendance",
      icon: "📋",
      path: "/attendance",
    },
    {
      label: "Results",
      icon: "📚",
      path: "/results",
    },
    {
      label: "Assignments",
      icon: "📝",
      path: "/assignments",
    },
    {
      label: "Notifications",
      icon: "🔔",
      path: "/notifications",
    },
    {
      label: "Attendance Reports",
      icon: "📈",
      path: "/attendance-reports",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    onClose();
  };

  // const navItems = [
  //   { label: "Dashboard", icon: "📊", active: true },
  //   { label: "Profile", icon: "👤", active: false },
  //   { label: "Attendance", icon: "📋", active: false },
  //   { label: "Results", icon: "📝", active: false},
  //   <<<<<{ label: "Assignments", icon: "📝", active: false }
  // ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0
          h-screen
          w-[260px]
          bg-[#2f3273]
          text-white
          shadow-xl
          z-40

          transform
          transition-transform
          duration-300
          ease-in-out

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
          md:sticky
          md:flex
          flex-col
        `}
      >
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={onClose}
            className="text-white hover:text-red-300"
          >
            <X size={26} />
          </button>
        </div>
        {/* Header */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl bg-white p-1 rounded text-[#2f3273]">
              🎓
            </span>

            <h1 className="text-xl font-bold">
              School ERP
            </h1>
          </div>

          <p className="mt-2 text-blue-200 text-xs uppercase tracking-[2px]">
            Student Portal
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#5B5FEF] text-white shadow-lg font-semibold"
                    : "text-blue-200 hover:bg-[#3b3e85] hover:text-white"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-auto border-t border-[#44478d] p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#24265a]">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              I
            </div>

            <div>
              <p className="font-semibold text-sm">
                Ishaan
              </p>

              <p className="text-xs text-blue-200">
                Class 10-A • Roll 21
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-[#3b3e85] hover:text-white transition-all duration-200"
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

export default StudentSidebar;