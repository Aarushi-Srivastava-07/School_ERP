import {
  Settings,
  User,
  Phone,
  Mail,
  Users,
  MapPin,
} from "lucide-react";
import {
  ParentSection,
  ParentCard,
  CardHeader,
  EmptyState,
} from "../components/parentShared.jsx";
import { useParentPreview } from "../context/ParentPreviewContext.jsx";

function InfoRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 0",
        borderBottom: "1px solid #f0f2f8",
      }}
    >
      <span style={{ color: "#9fa5b8", flexShrink: 0 }}>{icon}</span>

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#9fa5b8",
          minWidth: "110px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#1a1f36",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { parent } = useParentPreview();

  return (
    <ParentSection
      title="Settings"
      subtitle="Your account details, as held by the school"
    >
      <ParentCard>
        <CardHeader
          icon={<Settings size={17} />}
          title="Account Information"
        />

        {!parent ? (
          <EmptyState
            icon="⚙️"
            title="No account information available."
            message="Waiting for backend integration."
          />
        ) : (
          <div>
            <InfoRow
              icon={<User size={15} />}
              label="Name"
              value={parent.name}
            />

            <InfoRow
              icon={<Users size={15} />}
              label="Relationship"
              value={parent.relationship}
            />

            <InfoRow
              icon={<Phone size={15} />}
              label="Phone"
              value={parent.phone}
            />

            <InfoRow
              icon={<Mail size={15} />}
              label="Email"
              value={parent.email}
            />

            <InfoRow
              icon={<MapPin size={15} />}
              label="Address"
              value={parent.address}
            />
          </div>
        )}
      </ParentCard>
    </ParentSection>
  );
}