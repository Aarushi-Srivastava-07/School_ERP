import { FileClock } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function ExaminationsPage() {
  return (
    <ModulePlaceholderPage
      icon={<FileClock size={17} />}
      title="Examinations"
      subtitle="Upcoming and past examination schedule"
      accent="#c62828"
      emptyIcon="🗂️"
      emptyTitle="No examination records available."
      emptyMessage="Waiting for backend integration."
    />
  );
}