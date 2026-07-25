import { Bell } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function NotificationsPage() {
  return (
    <ModulePlaceholderPage
      icon={<Bell size={17} />}
      title="Notifications"
      subtitle="School circulars, events, and announcements"
      accent="#ef6c00"
      emptyIcon="🔔"
      emptyTitle="No notifications available."
      emptyMessage="Waiting for backend integration."
    />
  );
}