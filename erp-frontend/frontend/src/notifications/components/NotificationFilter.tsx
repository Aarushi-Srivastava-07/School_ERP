// src/notifications/components/NotificationFilter.tsx

import React from "react";

export type FilterOption = "all" | "unread" | "assignment" | "exam" | "attendance" | "announcement";

interface Props {
  active: FilterOption;
  onChange: (option: FilterOption) => void;
}

export const NotificationFilter: React.FC<Props> = ({ active, onChange }) => {
  const options: FilterOption[] = [
    "all",
    "unread",
    "assignment",
    "exam",
    "attendance",
    "announcement",
  ];

  const getLabel = (opt: FilterOption) => {
    switch (opt) {
      case "all":
        return "All";
      case "unread":
        return "Unread";
      case "assignment":
        return "Assignments";
      case "exam":
        return "Exams";
      case "attendance":
        return "Attendance";
      case "announcement":
        return "Announcements";
      default:
        return opt;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-full text-sm transition-colors 
            ${active === opt ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          {getLabel(opt)}
        </button>
      ))}
    </div>
  );
};
