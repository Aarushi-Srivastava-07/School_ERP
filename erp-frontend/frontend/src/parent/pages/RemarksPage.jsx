import { MessageSquareQuote } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function RemarksPage() {
  return (
    <ModulePlaceholderPage
      icon={<MessageSquareQuote size={17} />}
      title="Teacher Remarks"
      subtitle="Feedback and remarks left by your child's teachers"
      accent="#6a1b9a"
      emptyIcon="💬"
      emptyTitle="No teacher remarks available."
      emptyMessage="Waiting for backend integration."
    />
  );
}