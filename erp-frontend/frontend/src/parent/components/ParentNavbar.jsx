import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

// Reuses the EXACT SAME stylesheet as the Admin Navbar
//import "../../components/Navbar.css";
import "../../components/layout/Navbar.css";
import { useParentPreview } from "../context/ParentPreviewContext.jsx";

const PAGE_TITLES = {
  "/parent/dashboard": "Dashboard",
  "/parent/attendance": "Attendance",
  "/parent/marks": "Marks",
  "/parent/assignments": "Assignments",
  "/parent/homework": "Homework",
  "/parent/examinations": "Examinations",
  "/parent/timetable": "Timetable",
  "/parent/fees": "Fees",
  "/parent/notifications": "Notifications",
  "/parent/remarks": "Teacher Remarks",
  "/parent/settings": "Settings",
};

const TODAY = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// TEMPORARY Preview Switcher
function PreviewAsSwitcher() {
  const {
    activeParents,
    parent,
    selectParent,
  } = useParentPreview();

  if (activeParents.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#c62828",
          background: "#ffebee",
          padding: "3px 8px",
          borderRadius: "10px",
          letterSpacing: "0.3px",
          whiteSpace: "nowrap",
        }}
      >
        PREVIEW MODE
      </span>

      <select
        value={parent?.id || ""}
        onChange={(e) => selectParent(e.target.value)}
        aria-label="Preview as parent"
        style={{
          fontSize: "12px",
          padding: "8px 10px",
          borderRadius: "6px",
          border: "1px solid #d0d4e0",
          background: "#fff",
          color: "#1a1f36",
          fontFamily: "inherit",
          cursor: "pointer",
          maxWidth: "180px",
        }}
      >
        {activeParents.map((p) => (
          <option
            key={p.id}
            value={p.id}
          >
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ParentNavbar() {
  const { pathname } = useLocation();
  const { parent } = useParentPreview();

  const title =
    PAGE_TITLES[pathname] || "Parent Portal";

  const firstName = parent?.name
    ? parent.name.trim().split(" ")[0]
    : "Parent";

  return (
    <header className="navbar">
      <div className="navbar__title-block">
        <h1 className="navbar__title">
          {pathname === "/parent/dashboard"
            ? `Welcome, ${firstName}`
            : title}
        </h1>

        <p className="navbar__breadcrumb">
          {TODAY}
        </p>
      </div>

      <div className="navbar__actions">
        <PreviewAsSwitcher />

        <button
          type="button"
          className="navbar__icon-btn"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="navbar__notification-dot" />
        </button>

        <div
          className="navbar__avatar"
          aria-hidden="true"
        >
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default ParentNavbar;