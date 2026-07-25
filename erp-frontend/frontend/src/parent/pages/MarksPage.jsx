import { NotebookPen } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function MarksPage() {
  return (
    <ModulePlaceholderPage
      icon={<NotebookPen size={17} />}
      title="Marks"
      subtitle="Subject-wise marks and grades"
      accent="#1565c0"
      emptyIcon="📊"
      emptyTitle="No marks available."
      emptyMessage="Waiting for backend integration."
    />
  );
}