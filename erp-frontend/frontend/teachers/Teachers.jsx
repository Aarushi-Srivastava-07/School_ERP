import { useState, useMemo, useEffect, useCallback } from "react";
import { useERP } from "./ERPContext.jsx";

// ─── Constants ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Physical Education",
  "Art & Craft", "Music", "Economics", "Accountancy", "Civics", "Other",
];

const QUALIFICATIONS = [
  "B.Ed", "M.Ed", "B.Sc + B.Ed", "M.Sc + B.Ed", "MA + B.Ed",
  "MBA", "MCA", "B.Tech + B.Ed", "Ph.D", "Other",
];

const EMPLOYMENT_STATUS = ["Full-Time", "Part-Time", "Contract", "Visiting"];

const EMPTY_FORM = {
  name: "", subject: "", qualification: "", previousOrg: "",
  totalExp: "", currentExp: "", phone: "", email: "",
  joiningDate: "", status: "Full-Time", address: "",
};

const PAGE_SIZE = 10;

// ─── Field length limits ──────────────────────────────────────────────────────
const LIMITS = {
  name:        60,
  previousOrg: 100,
  phone:       10,
  email:       100,
  address:     250,
  totalExp:    2,
  currentExp:  2,
};

// ─── ID Generator ────────────────────────────────────────────────────────────
const generateTeacherId = (existingTeachers) => {
  const year   = new Date().getFullYear();
  const prefix = `TCH${year}`;
  const existing = existingTeachers
    .map((t) => t.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

// ─── Security & Sanitization Helpers ─────────────────────────────────────────

/** Returns true if the value contains XSS / injection patterns. */
const containsXSS = (value) => {
  const lower = value.toLowerCase();
  const xssPatterns = [
    "<script", "</script", "<img", "<svg", "<iframe", "<object", "<embed",
    "javascript:", "onerror=", "onload=", "onclick=", "onfocus=", "onmouseover=",
    "alert(", "eval(", "document.", "window.",
    "<", ">",
  ];
  return xssPatterns.some((p) => lower.includes(p));
};

/** Returns true if the value contains emojis. */
const containsEmoji = (value) =>
  /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F9FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F1E0}-\u{1F1FF}]/u.test(value);

/** Collapses multiple internal spaces and trims edges. */
const normalizeSpaces = (value) => value.replace(/\s+/g, " ").trim();

/** Sanitizes a free-text value: trim, collapse spaces, block XSS. Returns cleaned string or null if dangerous. */
const sanitizeText = (value) => {
  const cleaned = normalizeSpaces(value);
  if (containsXSS(cleaned)) return null;
  return cleaned;
};

/** Capitalize the first letter; leave the rest as typed. */
const capitalizeFirst = (value) =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

// ─── Shared per-field sanitizers used in handleChange ────────────────────────
const fieldSanitizers = {
  name: (v) => {
    // Allow only letters and single spaces; capitalize first letter
    const stripped = v.replace(/[^A-Za-z ]/g, "");
    return capitalizeFirst(stripped.replace(/\s{2,}/g, " "));
  },
  previousOrg: (v) => {
    // Allow letters, numbers, spaces, common punctuation — no XSS chars
    const stripped = v.replace(/[<>"'`\\]/g, "");
    return stripped.replace(/\s{2,}/g, " ");
  },
  phone: (v) => v.replace(/\D/g, "").slice(0, LIMITS.phone),
  email: (v) => v.slice(0, LIMITS.email),
  totalExp:   (v) => v.replace(/[^0-9]/g, "").slice(0, LIMITS.totalExp),
  currentExp: (v) => v.replace(/[^0-9]/g, "").slice(0, LIMITS.currentExp),
  address: (v) => {
    // Allow letters, numbers, spaces, comma, period, hyphen, slash — reject XSS
    const stripped = v.replace(/[<>"'`\\]/g, "");
    return stripped.slice(0, LIMITS.address);
  },
};

// ─── Validation Engine ────────────────────────────────────────────────────────
const validate = (form, editingId, teachers) => {
  const errors = {};
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today.getFullYear() - 200, 0, 1);

  // ── Name ──
  const name = normalizeSpaces(form.name);
  if (!name) {
    errors.name = "Teacher name is required.";
  } else if (containsEmoji(name)) {
    errors.name = "Name must not contain emojis.";
  } else if (containsXSS(name)) {
    errors.name = "Invalid characters are not allowed.";
  } else if (!/^[A-Za-z ]+$/.test(name)) {
    errors.name = "Name must contain only letters and spaces.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > LIMITS.name) {
    errors.name = `Name must not exceed ${LIMITS.name} characters.`;
  } else if (!/^[A-Z]/.test(name)) {
    errors.name = "Name must start with an uppercase letter.";
  }

  // ── Subject (dropdown — trusted list, still validate) ──
  if (!form.subject) {
    errors.subject = "Subject is required.";
  } else if (!SUBJECTS.includes(form.subject)) {
    errors.subject = "Please select a valid subject from the list.";
  }

  // ── Qualification (dropdown — trusted list) ──
  if (!form.qualification) {
    errors.qualification = "Qualification is required.";
  } else if (!QUALIFICATIONS.includes(form.qualification)) {
    errors.qualification = "Please select a valid qualification from the list.";
  }

  // ── Employment Status (dropdown) ──
  if (!EMPLOYMENT_STATUS.includes(form.status)) {
    errors.status = "Please select a valid employment status.";
  }

  // ── Previous Organization ──
  const prevOrg = normalizeSpaces(form.previousOrg);
  if (!prevOrg) {
    errors.previousOrg = "Previous organization is required.";
  } else if (containsEmoji(prevOrg)) {
    errors.previousOrg = "Organization name must not contain emojis.";
  } else if (containsXSS(prevOrg)) {
    errors.previousOrg = "Invalid characters are not allowed.";
  } else if (prevOrg.length < 2) {
    errors.previousOrg = "Organization name must be at least 2 characters.";
  } else if (prevOrg.length > LIMITS.previousOrg) {
    errors.previousOrg = `Organization name must not exceed ${LIMITS.previousOrg} characters.`;
  }

  // ── Total Experience ──
  const totalExpNum = Number(form.totalExp);
  if (form.totalExp === "") {
    errors.totalExp = "Total experience is required.";
  } else if (!/^\d+$/.test(form.totalExp)) {
    errors.totalExp = "Total experience must be a whole number.";
  } else if (totalExpNum < 0) {
    errors.totalExp = "Total experience cannot be negative.";
  } else if (totalExpNum > 99) {
    errors.totalExp = "Total experience must not exceed 99 years.";
  }

  // ── Current Experience ──
  const currentExpNum = Number(form.currentExp);
  if (form.currentExp === "") {
    errors.currentExp = "Current school experience is required.";
  } else if (!/^\d+$/.test(form.currentExp)) {
    errors.currentExp = "Current experience must be a whole number.";
  } else if (currentExpNum < 0) {
    errors.currentExp = "Current experience cannot be negative.";
  } else if (currentExpNum > 99) {
    errors.currentExp = "Current experience must not exceed 99 years.";
  } else if (!errors.totalExp && currentExpNum > totalExpNum) {
    errors.currentExp = "Current school experience cannot exceed total experience.";
  }

  // ── Phone ──
  if (!form.phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = "Phone number must contain exactly 10 digits.";
  } else if (/^0{10}$/.test(form.phone)) {
    errors.phone = "Phone number must not be all zeros.";
  } else {
    // Duplicate phone check (excluding current record when editing)
    const dupPhone = teachers.find(
      (t) => t.phone === form.phone && t.id !== editingId
    );
    if (dupPhone) errors.phone = "This phone number is already registered to another teacher.";
  }

  // ── Email ──
  const email = form.email.trim().toLowerCase();
  if (!email) {
    errors.email = "Email address is required.";
  } else if (containsXSS(email)) {
    errors.email = "Invalid characters are not allowed in the email.";
  } else if (email.length > LIMITS.email) {
    errors.email = `Email must not exceed ${LIMITS.email} characters.`;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address (e.g. name@school.edu).";
  } else {
    const dupEmail = teachers.find(
      (t) => t.email.toLowerCase() === email && t.id !== editingId
    );
    if (dupEmail) errors.email = "This email address is already registered to another teacher.";
  }

  // ── Joining Date ──
  if (!form.joiningDate) {
    errors.joiningDate = "Joining date is required.";
  } else {
    const jDate = new Date(form.joiningDate);
    const year  = jDate.getFullYear();
    if (isNaN(jDate.getTime())) {
      errors.joiningDate = "Enter a valid joining date.";
    } else if (year < 1900 || year > today.getFullYear()) {
      errors.joiningDate = `Joining date must be between 1900 and ${today.getFullYear()}.`;
    } else if (jDate > today) {
      errors.joiningDate = "Joining date cannot be in the future.";
    }
  }

  // ── Address ──
  const address = normalizeSpaces(form.address);
  if (!address) {
    errors.address = "Address is required.";
  } else if (containsEmoji(address)) {
    errors.address = "Address must not contain emojis.";
  } else if (containsXSS(address)) {
    errors.address = "Invalid characters are not allowed in the address.";
  } else if (address.length < 5) {
    errors.address = "Address must be at least 5 characters.";
  } else if (address.length > LIMITS.address) {
    errors.address = `Address must not exceed ${LIMITS.address} characters.`;
  }

  return errors;
};

// ─── Sanitize form before saving to context ───────────────────────────────────
const sanitizeForm = (form) => ({
  name:        normalizeSpaces(form.name),
  subject:     form.subject,
  qualification: form.qualification,
  previousOrg: normalizeSpaces(form.previousOrg),
  totalExp:    form.totalExp.trim(),
  currentExp:  form.currentExp.trim(),
  phone:       form.phone.trim(),
  email:       form.email.trim().toLowerCase(),
  joiningDate: form.joiningDate,
  status:      form.status,
  address:     normalizeSpaces(form.address),
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ status }) {
  const map = {
    "Full-Time": { bg: "#e8f5e9", color: "#2e7d32" },
    "Part-Time": { bg: "#fff8e1", color: "#f57f17" },
    Contract:    { bg: "#e3f2fd", color: "#1565c0" },
    Visiting:    { bg: "#f3e5f5", color: "#6a1b9a" },
  };
  const s = map[status] || { bg: "#f5f5f5", color: "#333" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.4px" }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderLeft: `4px solid ${accent}`, borderRadius: "8px", padding: "18px 22px", minWidth: "140px", flex: "1" }}>
      <div style={{ fontSize: "28px", fontWeight: 800, color: accent }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#7a7f8e", marginTop: "4px", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FormField({ label, error, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a", letterSpacing: "0.3px" }}>
        {label}{required && <span style={{ color: "#e53935", marginLeft: "2px" }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: "11px", color: "#e53935", display: "flex", alignItems: "center", gap: "4px" }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, totalRecords, pageSize, onPageChange }) {
  if (totalRecords === 0) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord   = Math.min(currentPage * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages      = [];
    const addPage     = (p) => pages.push(p);
    const addEllipsis = ()  => pages.push("…");
    const windowSize  = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) addPage(i);
    } else {
      addPage(1);
      if (currentPage - windowSize > 2) addEllipsis();
      const start = Math.max(2, currentPage - windowSize);
      const end   = Math.min(totalPages - 1, currentPage + windowSize);
      for (let i = start; i <= end; i++) addPage(i);
      if (currentPage + windowSize < totalPages - 1) addEllipsis();
      addPage(totalPages);
    }
    return pages;
  };

  const pageBtnStyle = (active) => ({
    minWidth: "32px", height: "32px", padding: "0 8px", borderRadius: "6px",
    border: active ? "1px solid #3949ab" : "1px solid #d0d4e0",
    background: active ? "#3949ab" : "#fff",
    color: active ? "#fff" : "#4a4f6a",
    fontSize: "12px", fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  const navBtnStyle = (disabled) => ({
    padding: "0 14px", height: "32px", borderRadius: "6px",
    border: "1px solid #d0d4e0",
    background: disabled ? "#f7f8fc" : "#fff",
    color: disabled ? "#b0b4c4" : "#3949ab",
    fontSize: "12px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "14px 20px", borderTop: "1px solid #f0f2f8", background: "#fafbff" }}>
      <div style={{ fontSize: "12px", color: "#7a7f8e", fontWeight: 500 }}>
        Showing <strong style={{ color: "#1a1f36" }}>{startRecord}–{endRecord}</strong> of{" "}
        <strong style={{ color: "#1a1f36" }}>{totalRecords}</strong> record{totalRecords !== 1 ? "s" : ""}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={navBtnStyle(currentPage === 1)}>‹ Prev</button>
        {getPageNumbers().map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} style={{ padding: "0 4px", color: "#9fa5b8", fontSize: "12px" }}>…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)} style={pageBtnStyle(p === currentPage)}>{p}</button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={navBtnStyle(currentPage === totalPages)}>Next ›</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Teachers() {
  const { teachers, addTeacher, updateTeacher, deactivateTeacher, restoreTeacher } = useERP();

  const [form,           setForm]          = useState(EMPTY_FORM);
  const [errors,         setErrors]        = useState({});
  const [editingId,      setEditingId]     = useState(null);
  const [showForm,       setShowForm]      = useState(false);
  const [activeSearch,   setActiveSearch]  = useState("");
  const [inactiveSearch, setInactiveSearch]= useState("");
  const [activeTab,      setActiveTab]     = useState("active");
  const [toast,          setToast]         = useState(null);
  const [activePage,     setActivePage]    = useState(1);
  const [inactivePage,   setInactivePage]  = useState(1);

  // ── Derived lists ──
  const activeTeachers = useMemo(() =>
    teachers.filter((t) => t.active && (
      activeSearch === "" ||
      [t.id, t.name, t.subject, t.email, t.phone].some((f) =>
        f.toLowerCase().includes(activeSearch.toLowerCase())
      )
    )), [teachers, activeSearch]);

  const inactiveTeachers = useMemo(() =>
    teachers.filter((t) => !t.active && (
      inactiveSearch === "" ||
      [t.id, t.name, t.subject, t.email, t.phone].some((f) =>
        f.toLowerCase().includes(inactiveSearch.toLowerCase())
      )
    )), [teachers, inactiveSearch]);

  const activeTotalPages   = Math.max(1, Math.ceil(activeTeachers.length / PAGE_SIZE));
  const inactiveTotalPages = Math.max(1, Math.ceil(inactiveTeachers.length / PAGE_SIZE));

  const paginatedActiveTeachers = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return activeTeachers.slice(start, start + PAGE_SIZE);
  }, [activeTeachers, activePage]);

  const paginatedInactiveTeachers = useMemo(() => {
    const start = (inactivePage - 1) * PAGE_SIZE;
    return inactiveTeachers.slice(start, start + PAGE_SIZE);
  }, [inactiveTeachers, inactivePage]);

  useEffect(() => { setActivePage(1); }, [activeSearch, activeTeachers.length]);
  useEffect(() => { setInactivePage(1); }, [inactiveSearch, inactiveTeachers.length]);
  useEffect(() => { if (activePage > activeTotalPages) setActivePage(activeTotalPages); }, [activePage, activeTotalPages]);
  useEffect(() => { if (inactivePage > inactiveTotalPages) setInactivePage(inactiveTotalPages); }, [inactivePage, inactiveTotalPages]);

  // ── Toast ──
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Form handlers ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const sanitizer = fieldSanitizers[name];
    const processed = sanitizer ? sanitizer(value) : value;
    setForm((prev) => ({ ...prev, [name]: processed }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleEdit = useCallback((teacher) => {
    setForm({
      name:         teacher.name,
      subject:      teacher.subject,
      qualification: teacher.qualification,
      previousOrg:  teacher.previousOrg,
      totalExp:     teacher.totalExp,
      currentExp:   teacher.currentExp,
      phone:        teacher.phone,
      email:        teacher.email,
      joiningDate:  teacher.joiningDate,
      status:       teacher.status,
      address:      teacher.address,
    });
    setEditingId(teacher.id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(() => {
    const validationErrors = validate(form, editingId, teachers);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Sanitize before writing to context — never store dirty data
    const clean = sanitizeForm(form);

    if (editingId) {
      updateTeacher(editingId, clean);
      showToast(`Teacher "${clean.name}" updated successfully.`);
    } else {
      const newId = generateTeacherId(teachers);
      addTeacher(clean, newId);
      showToast(`Teacher "${clean.name}" added with ID ${newId}.`);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  }, [form, editingId, teachers, addTeacher, updateTeacher, showToast]);

  const handleCancel = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  }, []);

  const handleDeactivate = useCallback((id) => {
    const teacher = teachers.find((t) => t.id === id);
    deactivateTeacher(id);
    showToast(`"${teacher.name}" moved to Inactive Teachers.`, "warning");
  }, [teachers, deactivateTeacher, showToast]);

  const handleRestore = useCallback((id) => {
    const teacher = teachers.find((t) => t.id === id);
    restoreTeacher(id);
    showToast(`"${teacher.name}" restored to Active Teachers.`);
  }, [teachers, restoreTeacher, showToast]);

  // ── Styles ──
  const inputStyle = (hasError) => ({
    padding: "9px 12px", border: `1px solid ${hasError ? "#e53935" : "#d0d4e0"}`,
    borderRadius: "6px", fontSize: "13px", color: "#1a1f36",
    background: "#fff", outline: "none", width: "100%", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.2s",
  });

  const selectStyle = (hasError) => ({
    ...inputStyle(hasError), appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%237a7f8e' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px",
  });

  const btnPrimary   = { padding: "9px 20px", background: "#3949ab", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.2px" };
  const btnSecondary = { padding: "9px 20px", background: "#f0f2f8", color: "#3949ab", border: "1px solid #c5cae9", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
  const btnDanger    = { padding: "6px 13px", background: "#fff3f3", color: "#c62828", border: "1px solid #ffcdd2", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
  const btnSuccess   = { padding: "6px 13px", background: "#f1f8e9", color: "#2e7d32", border: "1px solid #c8e6c9", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
  const btnEdit      = { padding: "6px 13px", background: "#e8eaf6", color: "#283593", border: "1px solid #c5cae9", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
  const thStyle      = { padding: "11px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#7a7f8e", textTransform: "uppercase", letterSpacing: "0.6px", background: "#f7f8fc", borderBottom: "2px solid #e8eaf0", whiteSpace: "nowrap" };
  const tdStyle      = { padding: "12px 14px", fontSize: "13px", color: "#1a1f36", borderBottom: "1px solid #f0f2f8", verticalAlign: "middle" };
  const tabBtn       = (active) => ({ padding: "10px 24px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", letterSpacing: "0.2px", borderBottom: active ? "3px solid #3949ab" : "3px solid transparent", color: active ? "#3949ab" : "#7a7f8e", background: "transparent", transition: "all 0.2s" });

  const totalTeachers = teachers.length;
  const activeCount   = teachers.filter((t) => t.active).length;
  const inactiveCount = teachers.filter((t) => !t.active).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: toast.type === "warning" ? "#fff8e1" : toast.type === "error" ? "#ffebee" : "#e8f5e9",
          color: toast.type === "warning" ? "#f57f17" : toast.type === "error" ? "#c62828" : "#2e7d32",
          border: `1px solid ${toast.type === "warning" ? "#ffe082" : toast.type === "error" ? "#ef9a9a" : "#a5d6a7"}`,
          padding: "14px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)", maxWidth: "360px",
          animation: "slideIn 0.25s ease",
        }}>
          {toast.type === "warning" ? "⚠ " : toast.type === "error" ? "✕ " : "✓ "}{toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus, textarea:focus { border-color: #3949ab !important; box-shadow: 0 0 0 3px rgba(57,73,171,0.1); }
        tr:hover td { background: #fafbff; }
        ::-webkit-scrollbar { height: 6px; } ::-webkit-scrollbar-track { background: #f0f2f8; }
        ::-webkit-scrollbar-thumb { background: #c5cae9; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8eaf0", padding: "0 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-0.3px" }}>Teacher Management</div>
            <div style={{ fontSize: "11px", color: "#7a7f8e", marginTop: "1px", fontWeight: 500 }}>Human Resources · Academic Staff</div>
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); }} style={btnPrimary}>
              + Add Teacher
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 32px" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
          <StatCard label="Total Teachers" value={totalTeachers} accent="#3949ab" />
          <StatCard label="Active"         value={activeCount}   accent="#2e7d32" />
          <StatCard label="Inactive"       value={inactiveCount} accent="#f57f17" />
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", marginBottom: "28px", overflow: "hidden", boxShadow: "0 2px 12px rgba(57,73,171,0.08)" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8eaf0", background: "#fafbff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1f36" }}>
                  {editingId ? `Edit Teacher — ${editingId}` : "Register New Teacher"}
                </div>
                <div style={{ fontSize: "11px", color: "#7a7f8e", marginTop: "2px" }}>
                  {editingId ? "Modify the details below and save." : "All fields marked * are required."}
                </div>
              </div>
              <button onClick={handleCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a7f8e", fontSize: "20px", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Personal Information */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#3949ab", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Personal Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <FormField label="Teacher Name" required error={errors.name}>
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Ananya Krishnan"
                    maxLength={LIMITS.name}
                    style={inputStyle(errors.name)}
                    autoComplete="off"
                  />
                </FormField>
                <FormField label="Phone Number" required error={errors.phone}>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={LIMITS.phone}
                    inputMode="numeric"
                    style={inputStyle(errors.phone)}
                  />
                </FormField>
                <FormField label="Email Address" required error={errors.email}>
                  <input
                    name="email" value={form.email} onChange={handleChange}
                    placeholder="name@school.edu"
                    maxLength={LIMITS.email}
                    style={inputStyle(errors.email)}
                    autoComplete="off"
                  />
                </FormField>
                <FormField label="Joining Date" required error={errors.joiningDate}>
                  <input
                    type="date" name="joiningDate" value={form.joiningDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    min="1900-01-01"
                    style={inputStyle(errors.joiningDate)}
                  />
                </FormField>
              </div>

              {/* Academic Details */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#3949ab", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Academic Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <FormField label="Subject" required error={errors.subject}>
                  <select name="subject" value={form.subject} onChange={handleChange} style={selectStyle(errors.subject)}>
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Qualification" required error={errors.qualification}>
                  <select name="qualification" value={form.qualification} onChange={handleChange} style={selectStyle(errors.qualification)}>
                    <option value="">Select qualification</option>
                    {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </FormField>
                <FormField label="Employment Status" required>
                  <select name="status" value={form.status} onChange={handleChange} style={selectStyle(false)}>
                    {EMPLOYMENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Previous Organization" required error={errors.previousOrg}>
                  <input
                    name="previousOrg" value={form.previousOrg} onChange={handleChange}
                    placeholder="Name of previous school/institution"
                    maxLength={LIMITS.previousOrg}
                    style={inputStyle(errors.previousOrg)}
                  />
                </FormField>
                <FormField label="Total Teaching Experience (yrs)" required error={errors.totalExp}>
                  <input
                    name="totalExp" value={form.totalExp} onChange={handleChange}
                    placeholder="e.g. 10"
                    maxLength={LIMITS.totalExp}
                    inputMode="numeric"
                    style={inputStyle(errors.totalExp)}
                  />
                </FormField>
                <FormField label="Experience in Current School (yrs)" required error={errors.currentExp}>
                  <input
                    name="currentExp" value={form.currentExp} onChange={handleChange}
                    placeholder="e.g. 3"
                    maxLength={LIMITS.currentExp}
                    inputMode="numeric"
                    style={inputStyle(errors.currentExp)}
                  />
                </FormField>
              </div>

              {/* Address */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#3949ab", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Address</div>
              <FormField label="Full Address" required error={errors.address}>
                <textarea
                  name="address" value={form.address} onChange={handleChange}
                  placeholder="House No., Street, Area, City - PIN"
                  rows={2}
                  maxLength={LIMITS.address}
                  style={{ ...inputStyle(errors.address), resize: "vertical", minHeight: "60px" }}
                />
              </FormField>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e8eaf0" }}>
                <button onClick={handleSubmit} style={btnPrimary}>
                  {editingId ? "Save Changes" : "Register Teacher"}
                </button>
                <button onClick={handleCancel} style={btnSecondary}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 6px rgba(57,73,171,0.06)" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e8eaf0", padding: "0 16px" }}>
            <button style={tabBtn(activeTab === "active")} onClick={() => setActiveTab("active")}>
              Active Teachers
              <span style={{ marginLeft: "8px", background: activeTab === "active" ? "#3949ab" : "#e8eaf0", color: activeTab === "active" ? "#fff" : "#7a7f8e", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px" }}>{activeCount}</span>
            </button>
            <button style={tabBtn(activeTab === "inactive")} onClick={() => setActiveTab("inactive")}>
              Inactive Teachers
              <span style={{ marginLeft: "8px", background: activeTab === "inactive" ? "#3949ab" : "#e8eaf0", color: activeTab === "inactive" ? "#fff" : "#7a7f8e", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px" }}>{inactiveCount}</span>
            </button>
          </div>

          {/* ── Active Table ── */}
          {activeTab === "active" && (
            <>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f2f8", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9fa5b8", fontSize: "14px" }}>⌕</span>
                  <input value={activeSearch} onChange={(e) => setActiveSearch(e.target.value)} placeholder="Search by ID, name, subject, email, phone…" style={{ ...inputStyle(false), paddingLeft: "32px" }} />
                </div>
                {activeSearch && (
                  <button onClick={() => setActiveSearch("")} style={{ ...btnSecondary, padding: "8px 14px", fontSize: "12px" }}>Clear</button>
                )}
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9fa5b8" }}>
                  {activeTeachers.length} result{activeTeachers.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Teacher ID", "Name", "Subject", "Qualification", "Total Exp", "School Exp", "Phone", "Email", "Status", "Joining Date", "Actions"].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActiveTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "#9fa5b8" }}>
                          {activeSearch ? "No teachers match your search." : "No active teachers found. Click '+ Add Teacher' to begin."}
                        </td>
                      </tr>
                    ) : (
                      paginatedActiveTeachers.map((t) => (
                        <tr key={t.id}>
                          <td style={tdStyle}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#3949ab", fontSize: "12px", background: "#e8eaf6", padding: "3px 8px", borderRadius: "4px" }}>{t.id}</span></td>
                          <td style={tdStyle}><span style={{ fontWeight: 600 }}>{t.name}</span></td>
                          <td style={tdStyle}>{t.subject}</td>
                          <td style={tdStyle}>{t.qualification}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{t.totalExp} yr{t.totalExp !== "1" ? "s" : ""}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{t.currentExp} yr{t.currentExp !== "1" ? "s" : ""}</td>
                          <td style={tdStyle}>{t.phone}</td>
                          <td style={tdStyle}><span style={{ color: "#3949ab" }}>{t.email}</span></td>
                          <td style={tdStyle}><Badge status={t.status} /></td>
                          <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{t.joiningDate}</td>
                          <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleEdit(t)} style={btnEdit}>Edit</button>
                              <button onClick={() => handleDeactivate(t.id)} style={btnDanger}>Deactivate</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination currentPage={activePage} totalPages={activeTotalPages} totalRecords={activeTeachers.length} pageSize={PAGE_SIZE} onPageChange={setActivePage} />
            </>
          )}

          {/* ── Inactive Table ── */}
          {activeTab === "inactive" && (
            <>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f8", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#fff8e1", border: "1px solid #ffe082", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", color: "#f57f17", fontWeight: 600 }}>
                  ⚠ Inactive records are preserved. Teacher IDs are permanently reserved.
                </div>
              </div>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f8", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9fa5b8", fontSize: "14px" }}>⌕</span>
                  <input value={inactiveSearch} onChange={(e) => setInactiveSearch(e.target.value)} placeholder="Search inactive teachers…" style={{ ...inputStyle(false), paddingLeft: "32px" }} />
                </div>
                {inactiveSearch && (
                  <button onClick={() => setInactiveSearch("")} style={{ ...btnSecondary, padding: "8px 14px", fontSize: "12px" }}>Clear</button>
                )}
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9fa5b8" }}>
                  {inactiveTeachers.length} result{inactiveTeachers.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Teacher ID", "Name", "Subject", "Qualification", "Total Exp", "Phone", "Email", "Prev. Status", "Joining Date", "Address", "Actions"].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInactiveTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "#9fa5b8" }}>
                          No inactive teachers. Deactivated staff will appear here.
                        </td>
                      </tr>
                    ) : (
                      paginatedInactiveTeachers.map((t) => (
                        <tr key={t.id} style={{ opacity: 0.75 }}>
                          <td style={tdStyle}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#9fa5b8", fontSize: "12px", background: "#f5f5f5", padding: "3px 8px", borderRadius: "4px" }}>{t.id}</span></td>
                          <td style={tdStyle}><span style={{ fontWeight: 600 }}>{t.name}</span></td>
                          <td style={tdStyle}>{t.subject}</td>
                          <td style={tdStyle}>{t.qualification}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{t.totalExp} yr{t.totalExp !== "1" ? "s" : ""}</td>
                          <td style={tdStyle}>{t.phone}</td>
                          <td style={tdStyle}>{t.email}</td>
                          <td style={tdStyle}><Badge status={t.status} /></td>
                          <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{t.joiningDate}</td>
                          <td style={{ ...tdStyle, maxWidth: "180px", whiteSpace: "normal", fontSize: "12px", color: "#7a7f8e" }}>{t.address}</td>
                          <td style={tdStyle}>
                            <button onClick={() => handleRestore(t.id)} style={btnSuccess}>↩ Restore</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination currentPage={inactivePage} totalPages={inactiveTotalPages} totalRecords={inactiveTeachers.length} pageSize={PAGE_SIZE} onPageChange={setInactivePage} />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#b0b4c4", fontWeight: 500 }}>
          School ERP · Teacher Management Module · Records are never permanently deleted
        </div>
      </div>
    </div>
  );
}