import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  NotebookPen,
  ClipboardList,
  BookOpenCheck,
  CalendarDays,
  Bell,
  Wallet,
} from "lucide-react";

import {
  ParentSection,
  ParentCard,
  ACCENT,
} from "./parentShared.jsx";

const ACTIONS = [
  {
    label: "View Attendance",
    path: "/parent/attendance",
    icon: CalendarCheck,
  },
  {
    label: "View Marks",
    path: "/parent/marks",
    icon: NotebookPen,
  },
  {
    label: "View Assignments",
    path: "/parent/assignments",
    icon: ClipboardList,
  },
  {
    label: "View Homework",
    path: "/parent/homework",
    icon: BookOpenCheck,
  },
  {
    label: "View Timetable",
    path: "/parent/timetable",
    icon: CalendarDays,
  },
  {
    label: "View Notifications",
    path: "/parent/notifications",
    icon: Bell,
  },
  {
    label: "View Fee Details",
    path: "/parent/fees",
    icon: Wallet,
  },
];

function QuickActions() {
  const navigate = useNavigate();

  return (
    <ParentSection
      title="Quick Actions"
      subtitle="Jump straight to a module"
    >
      <ParentCard>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {ACTIONS.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "6px",
                border: `1px solid ${ACCENT}33`,
                background: `${ACCENT}0d`,
                color: ACCENT,
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = `${ACCENT}1f`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = `${ACCENT}0d`)
              }
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </ParentCard>
    </ParentSection>
  );
}

export default QuickActions;