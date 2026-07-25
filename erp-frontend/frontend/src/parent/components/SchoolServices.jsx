import {
  Wallet,
  CalendarDays,
  MessageSquareQuote,
  Bell,
  Megaphone,
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
    icon: <Wallet size={17} />,
    title: "Fee Summary",
    accent: "#2e7d32",
    emptyIcon: "💳",
    emptyTitle: "No fee records available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <CalendarDays size={17} />,
    title: "Today's Timetable",
    accent: "#1565c0",
    emptyIcon: "🕒",
    emptyTitle: "No timetable available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <MessageSquareQuote size={17} />,
    title: "Teacher Remarks",
    accent: "#6a1b9a",
    emptyIcon: "💬",
    emptyTitle: "No teacher remarks available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <Bell size={17} />,
    title: "Notifications",
    accent: "#ef6c00",
    emptyIcon: "🔔",
    emptyTitle: "No notifications available.",
    emptyMessage: "Waiting for backend integration.",
  },
  {
    icon: <Megaphone size={17} />,
    title: "Announcements",
    accent: "#c62828",
    emptyIcon: "📣",
    emptyTitle: "No announcements available.",
    emptyMessage: "Waiting for backend integration.",
  },
];

function SchoolServices() {
  return (
    <ParentSection
      title="School Services"
      subtitle="Fees, timetable, remarks, and communication from school"
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

export default SchoolServices;