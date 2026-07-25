import { Bell } from "lucide-react";

type CommonNavbarProps = {
  title: string;
  role: string;
};

const CommonNavbar = ({ title, role }: CommonNavbarProps) => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex items-center justify-between bg-white shadow-sm rounded-xl px-6 py-4 mb-6 pl-16 md:pl-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-sm">
          {role} Portal
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-sm text-gray-500">{today}</p>
        </div>

        <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <Bell size={20} />

          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {role.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default CommonNavbar;