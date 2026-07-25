import {
  ParentSection,
  ParentCard,
  CardHeader,
  EmptyState,
} from "./parentShared.jsx";

// Generic full-page shell for every backend-dependent parent module
// (Attendance, Marks, Assignments, Homework, Examinations, Timetable, Fees,
// Notifications, Teacher Remarks). Each real page below is a thin wrapper
// around this component — only the copy differs, never the structure —
// so once a backend exists, only that one page needs real content.

function ModulePlaceholderPage({
  icon,
  title,
  subtitle,
  accent,
  emptyIcon,
  emptyTitle,
  emptyMessage,
}) {
  return (
    <ParentSection title={title} subtitle={subtitle}>
      <ParentCard accent={accent}>
        <CardHeader
          icon={icon}
          title={title}
          accent={accent}
        />

        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          message={emptyMessage}
        />
      </ParentCard>
    </ParentSection>
  );
}

export default ModulePlaceholderPage;