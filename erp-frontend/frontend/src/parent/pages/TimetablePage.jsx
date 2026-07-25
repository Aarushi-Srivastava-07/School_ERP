import { CalendarDays } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function TimetablePage() {
  return (
    <ModulePlaceholderPage
      icon={<CalendarDays size={17} />}
      title="Timetable"
      subtitle="Your child's weekly class schedule"
      accent="#1565c0"
      emptyIcon="🕒"
      emptyTitle="No timetable available."
      emptyMessage="Waiting for backend integration."
    />
  );
}