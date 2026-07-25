import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function ParentSidebar({ open = true, onClose = () => {} }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", icon: "📊", path: "/parent/dashboard" },
    { label: "Attendance", icon: "📅", path: "/parent/attendance" },
    { label: "Marks", icon: "📚", path: "/parent/marks" },
    { label: "Assignments", icon: "📝", path: "/parent/assignments" },
    { label: "Homework", icon: "📖", path: "/parent/homework" },
    { label: "Examinations", icon: "🧾", path: "/parent/examinations" },
    { label: "Timetable", icon: "🗓️", path: "/parent/timetable" },
    { label: "Fees", icon: "💳", path: "/parent/fees" },
    { label: "Notifications", icon: "🔔", path: "/parent/notifications" },
    { label: "Teacher Remarks", icon: "💬", path: "/parent/remarks" },
    { label: "Settings", icon: "⚙️", path: "/parent/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

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
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          md:sticky
          flex
          flex-col
          overflow-y-auto
        `}
      >
        <div className="flex justify-end p-4 md:hidden">
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white p-1 rounded text-[#2f3273]">
              👨‍👩‍👧
            </span>

            <h1 className="text-xl font-bold">
              School ERP
            </h1>
          </div>

          <p className="mt-2 text-blue-200 text-xs uppercase tracking-[2px]">
            Parent Portal
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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

        <div className="mt-auto border-t border-[#44478d] p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#24265a]">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">
              P
            </div>

            <div>
              <p className="font-semibold text-sm">
                Parent
              </p>

              <p className="text-xs text-blue-200">
                Guardian
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-[#3b3e85] hover:text-white"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default ParentSidebar;