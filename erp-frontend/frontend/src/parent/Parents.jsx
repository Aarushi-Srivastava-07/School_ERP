import { useState, useMemo } from "react";
import { useERP } from "../context/ERPContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const RELATIONSHIPS = ["Father", "Mother", "Guardian"];
const RECORDS_PER_PAGE = 5;

const EMPTY_FORM = {
  name: "",
  studentName: "",
  relationship: "",
  occupation: "",
  phone: "",
  altPhone: "",
  email: "",
  address: "",
  parentStatus: "Active",
};

// ─── ID Generator ─────────────────────────────────────────────────────────────
const generateParentId = (allParents) => {
  const year = new Date().getFullYear();
  const prefix = `PAR${year}`;
  const taken = allParents
    .map((p) => p.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = taken.length > 0 ? Math.max(...taken) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

// ─── Sanitization / Validation Helpers (shared pattern with Students/Teachers) ─
const DANGEROUS_PATTERN = /<[^>]*>|javascript\s*:|on\w+\s*=|[<>"'`\\]/i;
const EMOJI_PATTERN = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}]/u;
const NAME_PATTERN = /^[A-Za-z][A-Za-z ]*$/;
const ADDRESS_PATTERN = /^[A-Za-z0-9.,\-/ ]+$/;
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\d{10}$/;

const FIELD_LIMITS = {
  name: 60,
  studentName: 60,
  relationship: 20,
  occupation: 50,
  phone: 10,
  altPhone: 10,
  email: 100,
  address: 250,
};

// Collapse internal whitespace and trim leading/trailing spaces.
const collapseSpaces = (value) => (value || "").replace(/\s+/g, " ").trim();

// Capitalize the first letter of a (already collapsed) string.
const capitalizeFirst = (value) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

// Strip characters that are not allowed in name-like fields, in real time.
const stripToNameChars = (value) => value.replace(/[^A-Za-z ]/g, "");

// Strip characters that are not allowed in the address field, in real time.
const stripToAddressChars = (value) => value.replace(/[^A-Za-z0-9.,\-/ ]/g, "");

const validateNameField = (rawValue, label, { min = 2, max = 60, required = true } = {}) => {
  const value = collapseSpaces(rawValue);
  if (!value) return required ? `${label} is required.` : null;
  if (DANGEROUS_PATTERN.test(rawValue)) return "Invalid characters are not allowed.";
  if (EMOJI_PATTERN.test(rawValue)) return "Emojis are not allowed.";
  if (!NAME_PATTERN.test(value)) return `${label} must contain only letters and spaces.`;
  if (value.length < min) return `${label} must be at least ${min} characters.`;
  if (value.length > max) return `${label} must not exceed ${max} characters.`;
  return null;
};

const validateAddressField = (rawValue, { max = 250, required = true } = {}) => {
  const value = collapseSpaces(rawValue);
  if (!value) return required ? "Address is required." : null;
  if (DANGEROUS_PATTERN.test(rawValue)) return "Invalid characters are not allowed.";
  if (EMOJI_PATTERN.test(rawValue)) return "Emojis are not allowed.";
  if (!ADDRESS_PATTERN.test(value)) return "Address contains invalid characters.";
  if (value.length > max) return `Address must not exceed ${max} characters.`;
  return null;
};

const validatePhoneField = (rawValue, label, { required = true } = {}) => {
  const value = (rawValue || "").trim();
  if (!value) return required ? `${label} is required.` : null;
  if (!/^\d+$/.test(value)) return `${label} must contain numbers only.`;
  if (!PHONE_PATTERN.test(value)) return `${label} must contain exactly 10 digits.`;
  return null;
};

const validateEmailField = (rawValue, { max = 100, required = true } = {}) => {
  const value = (rawValue || "").trim();
  if (!value) return required ? "Email is required." : null;
  if (DANGEROUS_PATTERN.test(rawValue)) return "Invalid characters are not allowed.";
  if (value.length > max) return `Email must not exceed ${max} characters.`;
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  return null;
};

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form, parents = [], editingId = null) => {
  const e = {};

  const nameErr = validateNameField(form.name, "Parent name", { min: 2, max: FIELD_LIMITS.name });
  if (nameErr) e.name = nameErr;

  const studentNameErr = validateNameField(form.studentName, "Student name", { min: 2, max: FIELD_LIMITS.studentName });
  if (studentNameErr) e.studentName = studentNameErr;

  if (!form.relationship) e.relationship = "Relationship is required.";
  else if (!RELATIONSHIPS.includes(form.relationship)) e.relationship = "Select a valid relationship.";

  const occupationErr = validateNameField(form.occupation, "Occupation", { min: 2, max: FIELD_LIMITS.occupation });
  if (occupationErr) e.occupation = occupationErr;

  const phoneErr = validatePhoneField(form.phone, "Phone number");
  if (phoneErr) e.phone = phoneErr;

  if (form.altPhone) {
    const altPhoneErr = validatePhoneField(form.altPhone, "Alternate phone", { required: false });
    if (altPhoneErr) e.altPhone = altPhoneErr;
    else if (form.altPhone === form.phone)
      e.altPhone = "Alternate phone cannot be the same as primary phone.";
  }

  const emailErr = validateEmailField(form.email, { max: FIELD_LIMITS.email });
  if (emailErr) e.email = emailErr;

  const addressErr = validateAddressField(form.address, { max: FIELD_LIMITS.address });
  if (addressErr) e.address = addressErr;

  // ── Duplicate validation ──
  if (!e.phone) {
    const normalizedPhone = collapseSpaces(form.phone);
    const phoneDup = parents.some(
      (p) => p.id !== editingId && p.phone === normalizedPhone
    );
    if (phoneDup) e.phone = "A parent with this phone number already exists.";
  }
  if (!e.email) {
    const normalizedEmail = collapseSpaces(form.email).toLowerCase();
    const emailDup = parents.some(
      (p) => p.id !== editingId && (p.email || "").toLowerCase() === normalizedEmail
    );
    if (emailDup) e.email = "A parent with this email address already exists.";
  }

  return e;
};

// Build a clean, storage-ready copy of the form (never persist dirty data).
const sanitizeParentForm = (form) => ({
  ...form,
  name: capitalizeFirst(collapseSpaces(form.name)),
  studentName: capitalizeFirst(collapseSpaces(form.studentName)),
  relationship: collapseSpaces(form.relationship),
  occupation: capitalizeFirst(collapseSpaces(form.occupation)),
  phone: collapseSpaces(form.phone),
  altPhone: collapseSpaces(form.altPhone),
  email: collapseSpaces(form.email).toLowerCase(),
  address: collapseSpaces(form.address),
});

// ─── Tiny Components ──────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const cfg = {
    success: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7", icon: "✓" },
    warning: { bg: "#fff8e1", color: "#f57f17", border: "#ffe082", icon: "⚠" },
    error:   { bg: "#ffebee", color: "#c62828", border: "#ef9a9a", icon: "✕" },
  }[toast.type] || { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7", icon: "✓" };
  return (
    <div style={{
      position: "fixed", top: "24px", right: "24px", zIndex: 9999,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      padding: "13px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.13)", maxWidth: "380px",
      animation: "toastIn 0.25s ease",
    }}>
      {cfg.icon} {toast.msg}
    </div>
  );
}

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "10px",
      border: "1px solid #e8eaf0", borderLeft: `4px solid ${accent}`,
      padding: "20px 24px", flex: "1", minWidth: "140px",
    }}>
      <div style={{ fontSize: "30px", fontWeight: 800, color: accent, letterSpacing: "-1px" }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a", marginTop: "4px" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function RelationBadge({ rel }) {
  const map = {
    Father:   { bg: "#e3f2fd", color: "#1565c0" },
    Mother:   { bg: "#fce4ec", color: "#880e4f" },
    Guardian: { bg: "#f3e5f5", color: "#6a1b9a" },
  };
  const s = map[rel] || { bg: "#f5f5f5", color: "#555" };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "3px 10px",
      borderRadius: "12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px",
      whiteSpace: "nowrap",
    }}>{rel || "—"}</span>
  );
}

function ChildrenList({ parent }) {
  const children = parent.children || (parent.studentName ? [parent.studentName] : []);
  if (children.length === 0) return <span style={{ color: "#9fa5b8" }}>—</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      {children.map((child, i) => (
        <span key={i} style={{
          display: "inline-block", background: "#e8f5e9", color: "#2e7d32",
          padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600,
          whiteSpace: "nowrap",
        }}>{child}</span>
      ))}
    </div>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a", letterSpacing: "0.3px" }}>
        {label}
        {required && <span style={{ color: "#e53935", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: "11px", color: "#e53935" }}>⚠ {error}</span>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, totalRecords, perPage, onPageChange }) {
  if (totalPages <= 1 && totalRecords === 0) return null;

  const start = totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalRecords);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const pageBtn = (page, label, disabled, active) => (
    <button
      key={label ?? page}
      onClick={() => !disabled && onPageChange(page)}
      disabled={disabled}
      style={{
        padding: "6px 12px", minWidth: "34px",
        border: active ? "none" : "1px solid #e8eaf0",
        borderRadius: "6px", fontSize: "13px", fontWeight: active ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? "#3949ab" : disabled ? "#f7f8fc" : "#fff",
        color: active ? "#fff" : disabled ? "#c0c4d0" : "#4a4f6a",
        transition: "all 0.15s",
      }}
    >
      {label ?? page}
    </button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", borderTop: "1px solid #f0f2f8", flexWrap: "wrap", gap: "10px",
    }}>
      <span style={{ fontSize: "12px", color: "#7a7f8e", fontWeight: 500 }}>
        {totalRecords === 0
          ? "No records found"
          : `Showing ${start}–${end} of ${totalRecords} parent${totalRecords !== 1 ? "s" : ""}`}
      </span>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        {pageBtn(currentPage - 1, "← Prev", currentPage === 1, false)}
        {pages.map((p) => pageBtn(p, null, false, p === currentPage))}
        {pageBtn(currentPage + 1, "Next →", currentPage === totalPages || totalPages === 0, false)}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Parents() {
  const {
    parents,
    activities,
    updateParent,
    deactivateParent,
    restoreParent,
  } = useERP();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeSearch, setActiveSearch] = useState("");
  const [inactiveSearch, setInactiveSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [activePage, setActivePage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);
  const [toast, setToast] = useState(null);

  // ── Derived ──
  const SEARCH_KEYS = ["id", "name", "studentName", "email", "phone", "relationship"];

  const filteredActive = useMemo(() =>
    parents.filter((p) => p.active && (
      activeSearch === "" ||
      SEARCH_KEYS.some((k) => p[k]?.toLowerCase().includes(activeSearch.toLowerCase()))
    )), [parents, activeSearch]);

  const filteredInactive = useMemo(() =>
    parents.filter((p) => !p.active && (
      inactiveSearch === "" ||
      SEARCH_KEYS.some((k) => p[k]?.toLowerCase().includes(inactiveSearch.toLowerCase()))
    )), [parents, inactiveSearch]);

  const totalActivePages = Math.max(1, Math.ceil(filteredActive.length / RECORDS_PER_PAGE));
  const totalInactivePages = Math.max(1, Math.ceil(filteredInactive.length / RECORDS_PER_PAGE));

  const pagedActive = filteredActive.slice(
    (activePage - 1) * RECORDS_PER_PAGE,
    activePage * RECORDS_PER_PAGE
  );
  const pagedInactive = filteredInactive.slice(
    (inactivePage - 1) * RECORDS_PER_PAGE,
    inactivePage * RECORDS_PER_PAGE
  );

  const totalCount = parents.length;
  const activeCount = parents.filter((p) => p.active).length;
  const inactiveCount = parents.filter((p) => !p.active).length;
  const totalChildren = useMemo(() =>
    parents.reduce((sum, p) => sum + (p.numberOfChildren || (p.children ? p.children.length : 1)), 0),
    [parents]
  );

  // ── Parent Dashboard: derived analytics (ERPContext remains the single
  //    source of truth — everything below is computed, never duplicated) ──
  const avgChildrenPerParent = useMemo(() =>
    totalCount === 0 ? 0 : totalChildren / totalCount,
    [totalCount, totalChildren]
  );

  const activePercentage = totalCount === 0 ? 0 : Math.round((activeCount / totalCount) * 100);
  const inactivePercentage = totalCount === 0 ? 0 : Math.round((inactiveCount / totalCount) * 100);

  const childrenDistribution = useMemo(() => {
    let one = 0, two = 0, multiple = 0;
    parents.forEach((p) => {
      const n = p.numberOfChildren || (p.children ? p.children.length : 1);
      if (n === 1) one += 1;
      else if (n === 2) two += 1;
      else if (n >= 3) multiple += 1;
    });
    return { one, two, multiple };
  }, [parents]);

  const relationshipDistribution = useMemo(() => {
    const dist = { Father: 0, Mother: 0, Guardian: 0 };
    parents.forEach((p) => {
      if (dist[p.relationship] !== undefined) dist[p.relationship] += 1;
      else dist.Guardian += 1;
    });
    return dist;
  }, [parents]);

  // Reuse the existing Activity system — filter only Parent-related events.
  const parentActivities = useMemo(() =>
    activities.filter((a) => a.module === "Parents"),
    [activities]
  );

  const mostRecentParent = useMemo(() => {
    const createdEvent = parentActivities.find((a) => a.type === "Parent Created");
    if (createdEvent) {
      const match = parents.find((p) => p.id === createdEvent.recordId);
      if (match) return match;
    }
    if (parents.length === 0) return null;
    return [...parents].sort((a, b) => (a.id < b.id ? 1 : -1))[0];
  }, [parentActivities, parents]);

  const topChildrenParent = useMemo(() => {
    if (parents.length === 0) return null;
    return [...parents].sort((a, b) => {
      const an = a.numberOfChildren || (a.children ? a.children.length : 1);
      const bn = b.numberOfChildren || (b.children ? b.children.length : 1);
      return bn - an;
    })[0];
  }, [parents]);

  // ── Toast ──
  const fireToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Search reset pagination ──
  const handleActiveSearch = (val) => { setActiveSearch(val); setActivePage(1); };
  const handleInactiveSearch = (val) => { setInactiveSearch(val); setInactivePage(1); };

  // ── Form ──
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name" || name === "studentName" || name === "occupation") {
      value = stripToNameChars(value).replace(/\s{2,}/g, " ");
      if (value.length > 0) value = value.charAt(0).toUpperCase() + value.slice(1);
      value = value.slice(0, FIELD_LIMITS[name]);
    } else if (name === "phone" || name === "altPhone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "email") {
      value = value.replace(/[<>"'`\\]/g, "").slice(0, FIELD_LIMITS.email);
    } else if (name === "address") {
      value = stripToAddressChars(value).replace(/\s{2,}/g, " ").slice(0, FIELD_LIMITS.address);
    }

    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const openEdit = (parent) => {
    setForm({
      name: parent.name,
      studentName: parent.studentName,
      relationship: parent.relationship,
      occupation: parent.occupation,
      phone: parent.phone,
      altPhone: parent.altPhone || "",
      email: parent.email,
      address: parent.address,
      parentStatus: parent.parentStatus,
    });
    setEditingId(parent.id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const errs = validate(form, parents, editingId);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const cleanForm = sanitizeParentForm(form);

    // Parents are never created manually — a Parent record is only ever
    // produced automatically from Student Admission. This form can only
    // edit an existing, auto-synced Parent record.
    if (editingId) {
      updateParent(editingId, cleanForm);
      fireToast(`"${cleanForm.name}" updated successfully.`);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleDeactivate = (id) => {
    const p = parents.find((x) => x.id === id);
    if (!p) return;
    deactivateParent(id);
    fireToast(`"${p.name}" moved to Inactive.`, "warning");
    setActivePage(1);
  };

  const handleRestore = (id) => {
    const p = parents.find((x) => x.id === id);
    if (!p) return;
    restoreParent(id);
    fireToast(`"${p.name}" restored to Active.`);
    setInactivePage(1);
  };

  // ── Style tokens ──
  const inp = (err) => ({
    padding: "9px 12px", fontSize: "13px", color: "#1a1f36",
    border: `1px solid ${err ? "#e53935" : "#d0d4e0"}`,
    borderRadius: "6px", background: "#fff", outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  });

  const sel = (err) => ({
    ...inp(err), appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%237a7f8e' d='M5 7L0 0h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "30px",
  });

  const btnPrimary = {
    padding: "9px 22px", background: "#2e4fa3", color: "#fff",
    border: "none", borderRadius: "6px", fontSize: "13px",
    fontWeight: 700, cursor: "pointer", letterSpacing: "0.2px",
  };
  const btnSecondary = {
    padding: "9px 20px", background: "#f0f2f8", color: "#2e4fa3",
    border: "1px solid #c5cae9", borderRadius: "6px", fontSize: "13px",
    fontWeight: 600, cursor: "pointer",
  };
  const btnEdit = {
    padding: "5px 12px", background: "#e8eaf6", color: "#283593",
    border: "1px solid #c5cae9", borderRadius: "5px", fontSize: "12px",
    fontWeight: 600, cursor: "pointer",
  };
  const btnDeactivate = {
    padding: "5px 12px", background: "#fff3f3", color: "#c62828",
    border: "1px solid #ffcdd2", borderRadius: "5px", fontSize: "12px",
    fontWeight: 600, cursor: "pointer",
  };
  const btnRestore = {
    padding: "5px 12px", background: "#f1f8e9", color: "#2e7d32",
    border: "1px solid #c8e6c9", borderRadius: "5px", fontSize: "12px",
    fontWeight: 600, cursor: "pointer",
  };

  const th = {
    padding: "11px 14px", textAlign: "left", fontSize: "11px",
    fontWeight: 700, color: "#7a7f8e", textTransform: "uppercase",
    letterSpacing: "0.6px", background: "#f7f8fc",
    borderBottom: "2px solid #e8eaf0", whiteSpace: "nowrap",
  };
  const td = {
    padding: "11px 14px", fontSize: "13px", color: "#1a1f36",
    borderBottom: "1px solid #f0f2f8", verticalAlign: "middle",
  };
  const tabStyle = (active) => ({
    padding: "10px 24px", border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: "13px", background: "transparent",
    color: active ? "#2e4fa3" : "#7a7f8e",
    borderBottom: active ? "3px solid #2e4fa3" : "3px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        input:focus, select:focus, textarea:focus { border-color:#2e4fa3!important; box-shadow:0 0 0 3px rgba(46,79,163,.1); }
        tbody tr:hover td { background:#fafbff; }
        ::-webkit-scrollbar { height:5px; } ::-webkit-scrollbar-thumb { background:#c5cae9; border-radius:4px; }
      `}</style>

      <Toast toast={toast} />

      {/* ── Page Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8eaf0" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-0.3px" }}>Parent Management</div>
            <div style={{ fontSize: "11px", color: "#7a7f8e", fontWeight: 500, marginTop: "1px" }}>Stakeholder Relations · Guardian Registry</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "28px 32px" }}>

        {/* ══════════════════════════════════════════════════════════════
            PARENT DASHBOARD — enhancement layer added above the existing
            Parent Management UI. Everything here is derived exclusively
            from ERPContext (parents + the existing Activity system); the
            section below (Stats / CRUD / Search / Tabs / Table /
            Pagination) is completely unchanged and untouched.
           ══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-0.3px" }}>
              Parent Dashboard
            </div>
            <div style={{ fontSize: "12px", color: "#7a7f8e", fontWeight: 500, marginTop: "2px" }}>
              Live analytics and insights, synchronized automatically with the Parent registry
            </div>
          </div>

          {totalCount === 0 ? (
            <div style={{
              background: "#fff", border: "1px dashed #d0d4e0", borderRadius: "10px",
              padding: "48px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: "34px", opacity: 0.35, marginBottom: "10px" }}>👪</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#4a4f6a" }}>No Parent Data Yet</div>
              <div style={{ fontSize: "12px", color: "#9fa5b8", marginTop: "6px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                Parent records are created automatically when a student is admitted through Student Management.
                Dashboard statistics, analytics, and activity will appear here as soon as the first parent record exists.
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <StatCard label="Total Parents" value={totalCount} accent="#2e4fa3" sub="All registered guardians" />
                <StatCard label="Active Parents" value={activeCount} accent="#2e7d32" sub={`${activePercentage}% of total`} />
                <StatCard label="Inactive Parents" value={inactiveCount} accent="#e65100" sub={`${inactivePercentage}% of total`} />
                <StatCard label="Total Children" value={totalChildren} accent="#6a1b9a" sub="Across all parents" />
                <StatCard label="Avg. Children / Parent" value={avgChildrenPerParent.toFixed(1)} accent="#00838f" sub="Household average" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "16px" }}>

                {/* Parent Analytics */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "20px 22px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                    Parent Analytics
                  </div>

                  {[
                    { label: "Active Parents", pct: activePercentage, color: "#2e7d32" },
                    { label: "Inactive Parents", pct: inactivePercentage, color: "#e65100" },
                  ].map((row) => (
                    <div key={row.label} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>{row.label}</span>
                        <span style={{ fontSize: "11px", color: "#9fa5b8", fontWeight: 700 }}>{row.pct}%</span>
                      </div>
                      <div style={{ height: "7px", background: "#f0f2f8", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, borderRadius: "4px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}

                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#7a7f8e", letterSpacing: "0.6px", textTransform: "uppercase", margin: "18px 0 10px" }}>
                    Children Distribution
                  </div>
                  {[
                    { label: "Parents with 1 Child", count: childrenDistribution.one, color: "#1e88e5" },
                    { label: "Parents with 2 Children", count: childrenDistribution.two, color: "#8e24aa" },
                    { label: "Parents with 3+ Children", count: childrenDistribution.multiple, color: "#fb8c00" },
                  ].map((row) => {
                    const pct = totalCount === 0 ? 0 : Math.round((row.count / totalCount) * 100);
                    return (
                      <div key={row.label} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 500 }}>{row.label}</span>
                          <span style={{ fontSize: "11px", color: "#9fa5b8", fontWeight: 700 }}>{row.count} · {pct}%</span>
                        </div>
                        <div style={{ height: "6px", background: "#f0f2f8", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: row.color, borderRadius: "4px", transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Insights */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "20px 22px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                    Quick Insights
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f2f8" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>Most Recent Parent Added</div>
                        <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>{mostRecentParent?.id || "—"}</div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36", textAlign: "right" }}>{mostRecentParent?.name || "—"}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f2f8" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>Highest Children Count</div>
                        <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>
                          {topChildrenParent
                            ? `${topChildrenParent.numberOfChildren ?? (topChildrenParent.children ? topChildrenParent.children.length : 1)} children`
                            : "—"}
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36", textAlign: "right" }}>{topChildrenParent?.name || "—"}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f2f8" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>Total Active Guardians</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#2e7d32" }}>{activeCount}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f2f8" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>Parents Currently Inactive</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#e65100" }}>{inactiveCount}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>Average Children / Guardian</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#00838f" }}>{avgChildrenPerParent.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>

                {/* Guardian Distribution (Parent Status Section) */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "20px 22px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                    Guardian Distribution
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {RELATIONSHIPS.map((rel) => (
                      <div key={rel} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "#f7f8fc", border: "1px solid #e8eaf0",
                        borderRadius: "8px", padding: "10px 14px", flex: "1", minWidth: "110px",
                      }}>
                        <RelationBadge rel={rel} />
                        <span style={{ marginLeft: "auto", fontSize: "15px", fontWeight: 800, color: "#1a1f36" }}>
                          {relationshipDistribution[rel] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Parent Activities — reuses the existing Activity system */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "20px 22px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                    Recent Parent Activities
                  </div>
                  {parentActivities.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#9fa5b8", padding: "12px 0" }}>
                      No parent activity recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "260px", overflowY: "auto" }}>
                      {parentActivities.slice(0, 8).map((a) => (
                        <div key={a.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                          gap: "10px", paddingBottom: "10px", borderBottom: "1px solid #f0f2f8",
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1f36" }}>{a.type}</div>
                            <div style={{ fontSize: "11px", color: "#7a7f8e", marginTop: "2px" }}>{a.description}</div>
                          </div>
                          <div style={{ fontSize: "10px", color: "#9fa5b8", whiteSpace: "nowrap", fontWeight: 600 }}>{a.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
          <StatCard label="Total Parents" value={totalCount} accent="#2e4fa3" sub="All registered guardians" />
          <StatCard label="Active Parents" value={activeCount} accent="#2e7d32" sub="Currently engaged" />
          <StatCard label="Inactive Parents" value={inactiveCount} accent="#e65100" sub="Deactivated records" />
          <StatCard label="Total Children" value={totalChildren} accent="#6a1b9a" sub="Across all parents" />
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={{
            background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px",
            marginBottom: "28px", boxShadow: "0 2px 16px rgba(46,79,163,.08)", overflow: "hidden",
          }}>
            {/* Form header */}
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid #e8eaf0", background: "#fafbff",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1f36" }}>
                  Edit Parent — {editingId}
                </div>
                <div style={{ fontSize: "11px", color: "#7a7f8e", marginTop: "2px" }}>
                  Update the details and save changes.
                </div>
              </div>
              <button onClick={handleCancel} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#9fa5b8", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>

              {/* Section A: Identity */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
                Parent & Student Identity
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <FormField label="Parent Name" required error={errors.name}>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Arjun Mehta" maxLength={FIELD_LIMITS.name} style={inp(errors.name)} />
                </FormField>
                <FormField label="Student Name" required error={errors.studentName}>
                  <input
                    name="studentName" value={form.studentName} readOnly
                    title="Linked automatically from Student Management"
                    style={{ ...inp(errors.studentName), background: "#f7f8fc", color: "#7a7f8e", cursor: "not-allowed" }}
                  />
                </FormField>
                <FormField label="Relationship" required error={errors.relationship}>
                  <select name="relationship" value={form.relationship} onChange={handleChange} style={sel(errors.relationship)}>
                    <option value="">Select relationship</option>
                    {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FormField>
                <FormField label="Occupation" required error={errors.occupation}>
                  <input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Software Engineer" maxLength={FIELD_LIMITS.occupation} style={inp(errors.occupation)} />
                </FormField>
              </div>

              {/* Section B: Contact */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
                Contact Information
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <FormField label="Phone Number" required error={errors.phone}>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" maxLength={10} style={inp(errors.phone)} />
                </FormField>
                <FormField label="Alternate Phone" error={errors.altPhone}>
                  <input name="altPhone" value={form.altPhone} onChange={handleChange} placeholder="Optional" maxLength={10} style={inp(errors.altPhone)} />
                </FormField>
                <FormField label="Email Address" required error={errors.email}>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="parent@gmail.com" maxLength={FIELD_LIMITS.email} style={inp(errors.email)} />
                </FormField>
              </div>

              {/* Section C: Address */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
                Address
              </div>
              <FormField label="Full Address" required error={errors.address}>
                <textarea
                  name="address" value={form.address} onChange={handleChange}
                  placeholder="House No., Street, Area, City – PIN"
                  rows={2}
                  maxLength={FIELD_LIMITS.address}
                  style={{ ...inp(errors.address), resize: "vertical", minHeight: "64px" }}
                />
              </FormField>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e8eaf0" }}>
                <button onClick={handleSubmit} style={btnPrimary}>
                  Save Changes
                </button>
                <button onClick={handleCancel} style={btnSecondary}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tables Panel ── */}
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 6px rgba(46,79,163,.06)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e8eaf0", padding: "0 16px" }}>
            {[
              { key: "active", label: "Active Parents", count: activeCount },
              { key: "inactive", label: "Inactive Parents", count: inactiveCount },
            ].map(({ key, label, count }) => (
              <button key={key} style={tabStyle(activeTab === key)} onClick={() => setActiveTab(key)}>
                {label}
                <span style={{
                  marginLeft: "8px", fontSize: "10px", fontWeight: 700,
                  padding: "2px 7px", borderRadius: "10px",
                  background: activeTab === key ? "#2e4fa3" : "#e8eaf0",
                  color: activeTab === key ? "#fff" : "#7a7f8e",
                }}>{count}</span>
              </button>
            ))}
          </div>

          {/* ── Active Parents Tab ── */}
          {activeTab === "active" && (
            <>
              {/* Search bar */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f8", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9fa5b8", pointerEvents: "none" }}>⌕</span>
                  <input
                    value={activeSearch}
                    onChange={(e) => handleActiveSearch(e.target.value)}
                    placeholder="Search by ID, name, student, email, phone, relationship…"
                    style={{ ...inp(false), paddingLeft: "30px" }}
                  />
                </div>
                {activeSearch && (
                  <button onClick={() => handleActiveSearch("")} style={{ ...btnSecondary, padding: "8px 14px", fontSize: "12px" }}>Clear</button>
                )}
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9fa5b8", fontWeight: 500 }}>
                  {filteredActive.length} record{filteredActive.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Parent ID", "Parent Name", "Relationship", "Children", "# Children", "Occupation", "Phone", "Alt. Phone", "Email", "Address", "Actions"].map((h) => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedActive.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ ...td, textAlign: "center", padding: "44px", color: "#9fa5b8" }}>
                          {activeSearch ? "No parents match your search query." : "No active parents. Click '+ Add Parent' to register one."}
                        </td>
                      </tr>
                    ) : (
                      pagedActive.map((p) => (
                        <tr key={p.id}>
                          <td style={td}>
                            <span style={{
                              fontFamily: "monospace", fontWeight: 700, fontSize: "12px",
                              background: "#e8eaf6", color: "#2e4fa3",
                              padding: "3px 8px", borderRadius: "4px",
                            }}>{p.id}</span>
                          </td>
                          <td style={td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                          <td style={td}><RelationBadge rel={p.relationship} /></td>
                          <td style={{ ...td, minWidth: "140px" }}><ChildrenList parent={p} /></td>
                          <td style={{ ...td, textAlign: "center" }}>
                            <span style={{
                              display: "inline-block", fontWeight: 700, fontSize: "13px",
                              background: "#e8f5e9", color: "#2e7d32",
                              padding: "3px 10px", borderRadius: "12px",
                            }}>
                              {p.numberOfChildren ?? (p.children ? p.children.length : 1)}
                            </span>
                          </td>
                          <td style={{ ...td, color: "#4a4f6a" }}>{p.occupation}</td>
                          <td style={td}>{p.phone}</td>
                          <td style={{ ...td, color: "#7a7f8e" }}>{p.altPhone || "—"}</td>
                          <td style={{ ...td, color: "#2e4fa3" }}>{p.email}</td>
                          <td style={{ ...td, maxWidth: "180px", fontSize: "12px", color: "#7a7f8e", whiteSpace: "normal" }}>{p.address}</td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => openEdit(p)} style={btnEdit}>Edit</button>
                              <button onClick={() => handleDeactivate(p.id)} style={btnDeactivate}>Deactivate</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={activePage}
                totalPages={totalActivePages}
                totalRecords={filteredActive.length}
                perPage={RECORDS_PER_PAGE}
                onPageChange={setActivePage}
              />
            </>
          )}

          {/* ── Inactive Parents Tab ── */}
          {activeTab === "inactive" && (
            <>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0f2f8" }}>
                <div style={{
                  background: "#fff8e1", border: "1px solid #ffe082",
                  borderRadius: "6px", padding: "9px 14px",
                  fontSize: "12px", color: "#f57f17", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px",
                }}>
                  ⚠ Inactive records are preserved permanently. Parent IDs are never reused.
                </div>
              </div>

              {/* Search */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f8", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9fa5b8", pointerEvents: "none" }}>⌕</span>
                  <input
                    value={inactiveSearch}
                    onChange={(e) => handleInactiveSearch(e.target.value)}
                    placeholder="Search inactive parents…"
                    style={{ ...inp(false), paddingLeft: "30px" }}
                  />
                </div>
                {inactiveSearch && (
                  <button onClick={() => handleInactiveSearch("")} style={{ ...btnSecondary, padding: "8px 14px", fontSize: "12px" }}>Clear</button>
                )}
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9fa5b8", fontWeight: 500 }}>
                  {filteredInactive.length} record{filteredInactive.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Parent ID", "Parent Name", "Relationship", "Children", "# Children", "Occupation", "Phone", "Email", "Address", "Actions"].map((h) => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedInactive.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ ...td, textAlign: "center", padding: "44px", color: "#9fa5b8" }}>
                          {inactiveSearch ? "No inactive parents match your search." : "No inactive parents. Deactivated records will appear here."}
                        </td>
                      </tr>
                    ) : (
                      pagedInactive.map((p) => (
                        <tr key={p.id} style={{ opacity: 0.72 }}>
                          <td style={td}>
                            <span style={{
                              fontFamily: "monospace", fontWeight: 700, fontSize: "12px",
                              background: "#f5f5f5", color: "#9fa5b8",
                              padding: "3px 8px", borderRadius: "4px",
                            }}>{p.id}</span>
                          </td>
                          <td style={td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                          <td style={td}><RelationBadge rel={p.relationship} /></td>
                          <td style={{ ...td, minWidth: "140px" }}><ChildrenList parent={p} /></td>
                          <td style={{ ...td, textAlign: "center" }}>
                            <span style={{
                              display: "inline-block", fontWeight: 700, fontSize: "13px",
                              background: "#f5f5f5", color: "#7a7f8e",
                              padding: "3px 10px", borderRadius: "12px",
                            }}>
                              {p.numberOfChildren ?? (p.children ? p.children.length : 1)}
                            </span>
                          </td>
                          <td style={{ ...td, color: "#4a4f6a" }}>{p.occupation}</td>
                          <td style={td}>{p.phone}</td>
                          <td style={{ ...td, color: "#7a7f8e" }}>{p.email}</td>
                          <td style={{ ...td, maxWidth: "160px", fontSize: "12px", color: "#7a7f8e", whiteSpace: "normal" }}>{p.address}</td>
                          <td style={td}>
                            <button onClick={() => handleRestore(p.id)} style={btnRestore}>↩ Restore</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={inactivePage}
                totalPages={totalInactivePages}
                totalRecords={filteredInactive.length}
                perPage={RECORDS_PER_PAGE}
                onPageChange={setInactivePage}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#b0b4c4", fontWeight: 500 }}>
          School ERP · Parent Management Module · Soft-delete architecture — no records are permanently removed
        </div>
      </div>
    </div>
  );
}
