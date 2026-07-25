import { Wallet } from "lucide-react";
import ModulePlaceholderPage from "../components/ModulePlaceholderPage.jsx";

export default function FeesPage() {
  return (
    <ModulePlaceholderPage
      icon={<Wallet size={17} />}
      title="Fees"
      subtitle="Fee dues, payment history, and receipts"
      accent="#2e7d32"
      emptyIcon="💳"
      emptyTitle="No fee records available."
      emptyMessage="Waiting for backend integration."
    />
  );
}