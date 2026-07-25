import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type TeacherSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const TeacherSidebar = ({ open, onClose }: TeacherSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    {
      label: "Assignments",
      icon: "📝",
      path: "/teacher/assignments",
    },
    {
      label: "Examination & Results",
      icon: "🎓",
      path: "/teacher/results",
    },
    {
      label: "Attendance", 
      icon: "✅", 
      path: "/teacher/attendance",
    },
  ];
  

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0
          h-screen
          w-[280px]
          bg-[#2f3273]
          text-white
          shadow-2xl
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
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center px-5 pt-5 md:hidden">
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pt-2 pb-6 border-b border-[#43479b]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow">
              <span className="text-3xl text-[#2f3273]">🎓</span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                School ERP
              </h1>

              <p className="mt-1 text-blue-200 text-xs uppercase tracking-[3px]">
                Teacher Portal
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
                      ? "bg-[#4f53a7] shadow-lg text-white font-semibold"
                      : "text-blue-200 hover:bg-[#3b3e85] hover:text-white"
                  }`
                }
              >
                <span className="text-2xl">{item.icon}</span>

                <span className="text-base">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-[#43479b] p-5">
          {/* Teacher Card */}
          <div className="flex items-center gap-3 rounded-xl bg-[#24265a] p-4 shadow">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-lg font-bold">
              T
            </div>

            <div>
              <p className="font-semibold text-sm">
                Teacher
              </p>

              <p className="text-xs text-blue-200">
                Faculty
              </p>
            </div>
          </div>

          {/* Logout */}
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

export default TeacherSidebar;
