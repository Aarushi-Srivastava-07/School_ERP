import {
  CalendarCheck,
  NotebookPen,
  ClipboardList,
  BookOpenCheck,
  FileClock,
} from "lucide-react";

import {
  ParentSection,
  ParentCard,
  CardHeader,
  EmptyState,
  CardGrid,
} from "./parentShared.jsx";

const CARDS = [
  {
    icon: <CalendarCheck size={17} />,
    title: "Attendance",
    accent: "#2e7d32",
    emptyIcon: "🗓️",
    emptyTitle: "No attendance records available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <NotebookPen size={17} />,
    title: "Marks",
    accent: "#1565c0",
    emptyIcon: "📊",
    emptyTitle: "No marks available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <ClipboardList size={17} />,
    title: "Assignments",
    accent: "#6a1b9a",
    emptyIcon: "📝",
    emptyTitle: "No assignments available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <BookOpenCheck size={17} />,
    title: "Homework",
    accent: "#ef6c00",
    emptyIcon: "📚",
    emptyTitle: "No homework available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <FileClock size={17} />,
    title: "Upcoming Exams",
    accent: "#c62828",
    emptyIcon: "🗂️",
    emptyTitle: "No examination records available.",
    emptyMessage: "Waiting for backend integration.",
  },
];

function AcademicOverview() {
  return (
    <ParentSection
      title="Academic Overview"
      subtitle="Attendance, marks, assignments, and exams at a glance"
    >
      <CardGrid minWidth="220px">
        {CARDS.map((c) => (
          <ParentCard
            key={c.title}
            accent={c.accent}
          >
            <CardHeader
              icon={c.icon}
              title={c.title}
              accent={c.accent}
            />

            <EmptyState
              icon={c.emptyIcon}
              title={c.emptyTitle}
              message={c.emptyMessage}
              compact
            />
          </ParentCard>
        ))}
      </CardGrid>
    </ParentSection>
  );
}

export default AcademicOverview;