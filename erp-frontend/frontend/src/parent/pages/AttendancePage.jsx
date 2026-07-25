import { CalendarCheck } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function AttendancePage() {
  return (
    <ModulePlaceholderPage
      icon={<CalendarCheck size={17} />}
      title="Attendance"
      subtitle="Your child's day-wise attendance record"
      accent="#2e7d32"
      emptyIcon="🗓️"
      emptyTitle="No attendance records available."
      emptyMessage="Waiting for backend integration."
    />
  );
}