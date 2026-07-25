import {
  User,
  Phone,
  Mail,
  Hash,
  GraduationCap,
  Users,
} from "lucide-react";

import {
  ParentCard,
  StatusBadge,
  ACCENT,
} from "./parentShared.jsx";

import { useParentPreview } from "../context/ParentPreviewContext.jsx";

// Every value here is read directly from ERPContext.
function DetailItem({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        minWidth: 0,
      }}
    >
      <span
        style={{
          color: "#9fa5b8",
          marginTop: "2px",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            color: "#9fa5b8",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          {label}
        </div>

        <div
          title={value || undefined}
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#1a1f36",
            marginTop: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function ChildProfileCard() {
  const { parent, child } = useParentPreview();

  if (!child) {
    return (
      <ParentCard accent={ACCENT}>
        <div
          style={{
            textAlign: "center",
            padding: "24px 12px",
            color: "#9fa5b8",
          }}
        >
          <div
            style={{
              fontSize: "26px",
              marginBottom: "8px",
            }}
          >
            👨‍👩‍👧
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#5a5f72",
            }}
          >
            No linked student record found.
          </div>

          <div
            style={{
              fontSize: "11.5px",
              marginTop: "4px",
            }}
          >
            This parent account isn't linked to any student yet.
          </div>
        </div>
      </ParentCard>
    );
  }

  return (
    <ParentCard accent={ACCENT}>
      <div
        style={{
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: `${ACCENT}14`,
            color: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {child.name
            ? child.name.trim().charAt(0).toUpperCase()
            : <User size={26} />}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "160px",
          }}
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 800,
              color: "#1a1f36",
              letterSpacing: "-0.3px",
            }}
          >
            {child.name}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#9fa5b8",
              fontWeight: 600,
              marginTop: "3px",
            }}
          >
            {child.studentClass
              ? `Class ${child.studentClass}`
              : ""}
            {child.section
              ? ` · Section ${child.section}`
              : ""}
          </div>
        </div>

        <StatusBadge status={child.status} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(150px,1fr))",
          gap: "16px",
          paddingTop: "16px",
          borderTop: "1px solid #f0f2f8",
        }}
      >
        <DetailItem
          icon={<Hash size={15} />}
          label="Student ID"
          value={child.studentId}
        />

        <DetailItem
          icon={<GraduationCap size={15} />}
          label="Admission Date"
          value={child.admissionDate}
        />

        <DetailItem
          icon={<User size={15} />}
          label="Parent Name"
          value={parent?.name}
        />

        <DetailItem
          icon={<Users size={15} />}
          label="Relationship"
          value={parent?.relationship}
        />

        <DetailItem
          icon={<Phone size={15} />}
          label="Phone"
          value={parent?.phone}
        />

        <DetailItem
          icon={<Mail size={15} />}
          label="Email"
          value={parent?.email}
        />
      </div>
    </ParentCard>
  );
}

export default ChildProfileCard;