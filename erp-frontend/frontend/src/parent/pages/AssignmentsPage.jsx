import { ClipboardList } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function AssignmentsPage() {
  return (
    <ModulePlaceholderPage
      icon={<ClipboardList size={17} />}
      title="Assignments"
      subtitle="Assigned work and submission status"
      accent="#6a1b9a"
      emptyIcon="📝"
      emptyTitle="No assignments available."
      emptyMessage="Waiting for backend integration."
    />
  );
}