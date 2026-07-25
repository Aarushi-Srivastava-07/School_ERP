import { BookOpenCheck } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function HomeworkPage() {
  return (
    <ModulePlaceholderPage
      icon={<BookOpenCheck size={17} />}
      title="Homework"
      subtitle="Daily homework assigned by teachers"
      accent="#ef6c00"
      emptyIcon="📚"
      emptyTitle="No homework available."
      emptyMessage="Waiting for backend integration."
    />
  );
}