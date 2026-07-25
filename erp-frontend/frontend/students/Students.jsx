/**
 * Students.jsx — School ERP | Student Management Module
 * Architecture: Enterprise-grade | ERP-style | Production-ready
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useERP } from "./ERPContext.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const RECORDS_PER_PAGE = 5;

const CLASS_OPTIONS   = ["Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];

const INITIAL_FORM_STATE = {
  name: "", studentClass: "", section: "",
  dob: "", parentName: "", phone: "", email: "", address: "", admissionDate: "",
};

// ─── Shared Security & Sanitization Helpers ──────────────────────────────────

/** Strip leading/trailing whitespace and collapse multiple internal spaces. */
const normalizeSpaces = (str) => str.trim().replace(/\s{2,}/g, " ");

/** Detect emoji codepoints. */
const EMOJI_RE = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;
const hasEmoji = (str) => EMOJI_RE.test(str);

/** Detect common XSS patterns. */
const XSS_RE = /[<>"'`\\]|javascript:|<script|<img|onerror|onload/i;
const hasXSS = (str) => XSS_RE.test(str);

/** Allow only letters (including unicode letters for Indian names) and spaces. */
const ALPHA_SPACE_RE = /^[A-Za-z][A-Za-z ]*$/;

/** Allow address-safe characters: letters, digits, commas, periods, hyphens, slashes, spaces. */
const ADDRESS_SAFE_RE = /^[A-Za-z0-9 ,.\-/]+$/;

/** Validate a date string against: not future, not older than 200 years. */
const validateDateRange = (dateStr, label) => {
  if (!dateStr) return `${label} is required.`;
  const d   = new Date(dateStr);
  const now = new Date();
  const minYear = now.getFullYear() - 200;
  if (isNaN(d.getTime()))              return `${label} is not a valid date.`;
  if (d.getFullYear() < minYear)       return `${label} cannot be older than 200 years.`;
  if (d.getFullYear() > 9999)          return `${label} contains an invalid year.`;
  if (d > now)                         return `${label} cannot be in the future.`;
  return null;
};

// ─── Validation Engine ────────────────────────────────────────────────────────
const validate = (fields, editingId, students) => {
  const errors = {};
  const today  = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Student Name ──
  const name = normalizeSpaces(fields.name);
  if (!name) {
    errors.name = "Student name is required.";
  } else if (hasXSS(name)) {
    errors.name = "Invalid characters are not allowed in the name.";
  } else if (hasEmoji(name)) {
    errors.name = "Emojis are not allowed in the name.";
  } else if (!ALPHA_SPACE_RE.test(name)) {
    errors.name = "Name must contain only letters and spaces.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 60) {
    errors.name = "Name must not exceed 60 characters.";
  }

  if (!fields.studentClass) errors.studentClass = "Class is required.";
  if (!fields.section)      errors.section      = "Section is required.";

  // ── Date of Birth ──
  const dobErr = validateDateRange(fields.dob, "Date of birth");
  if (dobErr) {
    errors.dob = dobErr;
  }

  // ── Admission Date ──
  const admErr = validateDateRange(fields.admissionDate, "Admission date");
  if (admErr) {
    errors.admissionDate = admErr;
  } else if (fields.dob && fields.admissionDate) {
    const dob = new Date(fields.dob);
    const adm = new Date(fields.admissionDate);
    if (adm < dob) errors.admissionDate = "Admission date cannot be before the date of birth.";
  }

  // ── Parent Name ──
  const parentName = normalizeSpaces(fields.parentName);
  if (!parentName) {
    errors.parentName = "Parent name is required.";
  } else if (hasXSS(parentName)) {
    errors.parentName = "Invalid characters are not allowed in the parent name.";
  } else if (hasEmoji(parentName)) {
    errors.parentName = "Emojis are not allowed in the parent name.";
  } else if (!ALPHA_SPACE_RE.test(parentName)) {
    errors.parentName = "Parent name must contain only letters and spaces.";
  } else if (parentName.length < 2) {
    errors.parentName = "Parent name must be at least 2 characters.";
  } else if (parentName.length > 60) {
    errors.parentName = "Parent name must not exceed 60 characters.";
  }

  // ── Phone ──
  if (!fields.phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(fields.phone)) {
    errors.phone = "Phone number must contain exactly 10 digits.";
  }

  // ── Email ──
  if (!fields.email) {
    errors.email = "Email address is required.";
  } else if (fields.email.length > 100) {
    errors.email = "Email address must not exceed 100 characters.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Please enter a valid email address.";
  }

  // ── Address ──
  const address = normalizeSpaces(fields.address);
  if (!address) {
    errors.address = "Address is required.";
  } else if (hasXSS(address)) {
    errors.address = "Invalid characters are not allowed in the address.";
  } else if (hasEmoji(address)) {
    errors.address = "Emojis are not allowed in the address.";
  } else if (!ADDRESS_SAFE_RE.test(address)) {
    errors.address = "Address may only contain letters, digits, commas, periods, hyphens, slashes, and spaces.";
  } else if (address.length > 250) {
    errors.address = "Address must not exceed 250 characters.";
  }

  return errors;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, accent }) => (
  <div className="erp-stat-card" style={{ "--accent": accent }}>
    <span className="erp-stat-value">{value}</span>
    <span className="erp-stat-label">{label}</span>
  </div>
);

const FormField = ({ label, error, children, required }) => (
  <div className={`erp-field${error ? " erp-field--error" : ""}`}>
    <label className="erp-label">
      {label}
      {required && <span className="erp-required">*</span>}
    </label>
    {children}
    {error && <span className="erp-error-msg">{error}</span>}
  </div>
);

const Badge = ({ status }) => (
  <span className={`erp-badge erp-badge--${status === "Active" ? "active" : "inactive"}`}>
    {status}
  </span>
);

const Pagination = ({ currentPage, totalPages, totalRecords, rangeStart, rangeEnd, onPrev, onNext, onPage }) => (
  <div className="erp-pagination">
    <span className="erp-pagination__info">
      Showing {rangeStart}–{rangeEnd} of {totalRecords} Students
    </span>
    <div className="erp-pagination__controls">
      <button className="erp-btn-page" onClick={onPrev} disabled={currentPage === 1}>
        ‹ Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`erp-btn-page${p === currentPage ? " erp-btn-page--active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      <button className="erp-btn-page" onClick={onNext} disabled={currentPage === totalPages || totalPages === 0}>
        Next ›
      </button>
    </div>
  </div>
);

const StudentTable = ({ students, onEdit, onToggleStatus }) => (
  <div className="erp-table-wrapper">
    <table className="erp-table">
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Class / Sec</th>
          <th>Parent</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Admission</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan={9} className="erp-table__empty">No records found.</td>
          </tr>
        ) : (
          students.map((s) => (
            <tr key={s.id} className={s.status === "Inactive" ? "erp-table__row--inactive" : ""}>
              <td><code className="erp-id">{s.studentId}</code></td>
              <td className="erp-table__name">{s.name}</td>
              <td>{s.studentClass} – {s.section}</td>
              <td>{s.parentName}</td>
              <td>{s.phone}</td>
              <td className="erp-table__email">{s.email}</td>
              <td>{s.admissionDate}</td>
              <td><Badge status={s.status} /></td>
              <td>
                <div className="erp-actions">
                  {s.status === "Active" && (
                    <button
                      className="erp-btn-action erp-btn-action--edit"
                      onClick={() => onEdit(s)}
                      title="Edit Student"
                    >✏️</button>
                  )}
                  <button
                    className={`erp-btn-action ${s.status === "Active" ? "erp-btn-action--deactivate" : "erp-btn-action--restore"}`}
                    onClick={() => onToggleStatus(s.id)}
                    title={s.status === "Active" ? "Deactivate" : "Restore"}
                  >
                    {s.status === "Active" ? "🚫" : "✅"}
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Students() {
  const {
    students,
    studentCounter: counter,
    addStudent,
    updateStudent,
    toggleStudentStatus,
  } = useERP();

  const [form,        setForm]        = useState(INITIAL_FORM_STATE);
  const [errors,      setErrors]      = useState({});
  const [editingId,   setEditingId]   = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab,   setActiveTab]   = useState("active");
  const [activePage,  setActivePage]  = useState(1);
  const [inactivePage,setInactivePage]= useState(1);
  const [toast,       setToast]       = useState(null);

  // ── Auto-dismiss toast ──
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  // ── Filtered lists ──
  const q = searchQuery.trim().toLowerCase();

  const activeStudents = useMemo(
    () => students.filter((s) =>
      s.status === "Active" && (
        !q ||
        s.studentId.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.studentClass.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.email.toLowerCase().includes(q)
      )
    ),
    [students, q]
  );

  const inactiveStudents = useMemo(
    () => students.filter((s) =>
      s.status === "Inactive" && (
        !q ||
        s.studentId.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.studentClass.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.email.toLowerCase().includes(q)
      )
    ),
    [students, q]
  );

  // ── Pagination helpers ──
  const paginate   = (list, page) => list.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);
  const totalPages = (list) => Math.max(1, Math.ceil(list.length / RECORDS_PER_PAGE));
  const rangeStart = (page) => (activeStudents.length === 0 && inactiveStudents.length === 0 ? 0 : (page - 1) * RECORDS_PER_PAGE + 1);
  const rangeEnd   = (list, page) => Math.min(page * RECORDS_PER_PAGE, list.length);

  useEffect(() => { setActivePage(1); setInactivePage(1); }, [searchQuery]);

  // ── Form handlers ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processed = value;

    if (name === "name" || name === "parentName") {
      // Strip non-alpha, non-space; strip XSS chars; collapse spaces; auto-capitalize
      processed = value.replace(/[^A-Za-z ]/g, "");
      if (processed.length > 0) processed = processed.charAt(0).toUpperCase() + processed.slice(1);
      // Enforce max length
      const limit = 60;
      if (processed.length > limit) processed = processed.slice(0, limit);
    }

    if (name === "phone") {
      processed = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "email") {
      // Trim whitespace but otherwise let user type; max 100 chars
      processed = value.replace(/\s/g, "").slice(0, 100);
    }

    if (name === "address") {
      // Strip XSS-dangerous characters inline; enforce max length
      processed = value.replace(/[<>"'`\\]/g, "").slice(0, 250);
    }

    setForm((prev) => ({ ...prev, [name]: processed }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const openAddForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    setEditingId(null);
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((student) => {
    setForm({
      name: student.name, studentClass: student.studentClass, section: student.section,
      dob: student.dob, parentName: student.parentName,
      phone: student.phone, email: student.email, address: student.address,
      admissionDate: student.admissionDate,
    });
    setErrors({});
    setEditingId(student.id);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM_STATE);
    setErrors({});
  }, []);

  const handleSubmit = useCallback(() => {
    const validationErrors = validate(form, editingId, students);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    // Sanitized payload — normalizeSpaces on all text fields before storing
    const payload = {
      name:          normalizeSpaces(form.name),
      studentClass:  form.studentClass,
      section:       form.section,
      dob:           form.dob,
      parentName:    normalizeSpaces(form.parentName),
      phone:         form.phone,
      email:         form.email.trim().toLowerCase(),
      address:       normalizeSpaces(form.address),
      admissionDate: form.admissionDate,
    };

    if (editingId) {
      updateStudent(editingId, payload);
      showToast("Student updated successfully.");
    } else {
      addStudent(payload, counter);
      showToast("Student added successfully.");
    }

    closeForm();
  }, [form, editingId, students, counter, addStudent, updateStudent, closeForm, showToast]);

  const handleToggleStatus = useCallback((id) => {
    const student = students.find((s) => s.id === id);
    toggleStudentStatus(id);
    const action = student?.status === "Active" ? "deactivated" : "restored";
    showToast(`Student ${action} successfully.`);
  }, [students, toggleStudentStatus, showToast]);

  // ── Derived pagination data ──
  const activePagedData    = paginate(activeStudents, activePage);
  const inactivePagedData  = paginate(inactiveStudents, inactivePage);
  const activeTotalPages   = totalPages(activeStudents);
  const inactiveTotalPages = totalPages(inactiveStudents);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{ERP_STYLES}</style>

      <div className="erp-module">
        {/* ── Header ── */}
        <header className="erp-module__header">
          <div className="erp-module__title-block">
            <span className="erp-module__eyebrow">School ERP — Module 1</span>
            <h1 className="erp-module__title">Student Management</h1>
          </div>
          <button className="erp-btn-primary" onClick={openAddForm}>
            + Add Student
          </button>
        </header>

        {/* ── Toast ── */}
        {toast && (
          <div className={`erp-toast erp-toast--${toast.type}`}>{toast.msg}</div>
        )}

        {/* ── Stats ── */}
        <section className="erp-stats">
          <StatCard label="Total Students"    value={students.length}                                       accent="#6366f1" />
          <StatCard label="Active Students"   value={students.filter((s) => s.status === "Active").length}  accent="#22c55e" />
          <StatCard label="Inactive Students" value={students.filter((s) => s.status === "Inactive").length} accent="#f59e0b" />
        </section>

        {/* ── Search ── */}
        <div className="erp-search-bar">
          <span className="erp-search-icon">🔍</span>
          <input
            className="erp-search-input"
            type="text"
            placeholder="Search by ID, Name, Class, Phone, or Email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="erp-search-clear" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="erp-tabs">
          <button className={`erp-tab${activeTab === "active" ? " erp-tab--active" : ""}`} onClick={() => setActiveTab("active")}>
            Active Students
            <span className="erp-tab__badge">{activeStudents.length}</span>
          </button>
          <button className={`erp-tab${activeTab === "inactive" ? " erp-tab--active" : ""}`} onClick={() => setActiveTab("inactive")}>
            Inactive Students
            <span className="erp-tab__badge erp-tab__badge--warn">{inactiveStudents.length}</span>
          </button>
        </div>

        {/* ── Active Table ── */}
        {activeTab === "active" && (
          <section className="erp-section">
            <StudentTable students={activePagedData} onEdit={openEditForm} onToggleStatus={handleToggleStatus} />
            <Pagination
              currentPage={activePage}
              totalPages={activeTotalPages}
              totalRecords={activeStudents.length}
              rangeStart={rangeStart(activePage)}
              rangeEnd={rangeEnd(activeStudents, activePage)}
              onPrev={() => setActivePage((p) => Math.max(1, p - 1))}
              onNext={() => setActivePage((p) => Math.min(activeTotalPages, p + 1))}
              onPage={setActivePage}
            />
          </section>
        )}

        {/* ── Inactive Table ── */}
        {activeTab === "inactive" && (
          <section className="erp-section">
            <StudentTable students={inactivePagedData} onEdit={openEditForm} onToggleStatus={handleToggleStatus} />
            <Pagination
              currentPage={inactivePage}
              totalPages={inactiveTotalPages}
              totalRecords={inactiveStudents.length}
              rangeStart={rangeStart(inactivePage)}
              rangeEnd={rangeEnd(inactiveStudents, inactivePage)}
              onPrev={() => setInactivePage((p) => Math.max(1, p - 1))}
              onNext={() => setInactivePage((p) => Math.min(inactiveTotalPages, p + 1))}
              onPage={setInactivePage}
            />
          </section>
        )}

        {/* ── Modal Form ── */}
        {showForm && (
          <div className="erp-overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
            <div className="erp-modal" role="dialog" aria-modal="true" aria-label={editingId ? "Edit Student" : "Add Student"}>
              <div className="erp-modal__header">
                <h2 className="erp-modal__title">
                  {editingId ? "✏️ Edit Student" : "➕ Add New Student"}
                </h2>
                <button className="erp-modal__close" onClick={closeForm} aria-label="Close">✕</button>
              </div>

              <div className="erp-modal__body">
                <div className="erp-form-grid">
                  {/* Name */}
                  <FormField label="Student Name" error={errors.name} required>
                    <input className="erp-input" name="name" value={form.name} onChange={handleChange} placeholder="Full name" maxLength={60} autoComplete="off" />
                  </FormField>

                  {/* Class */}
                  <FormField label="Class" error={errors.studentClass} required>
                    <select className="erp-input" name="studentClass" value={form.studentClass} onChange={handleChange}>
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormField>

                  {/* Section */}
                  <FormField label="Section" error={errors.section} required>
                    <select className="erp-input" name="section" value={form.section} onChange={handleChange}>
                      <option value="">Select Section</option>
                      {SECTION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FormField>

                  {/* Date of Birth */}
                  <FormField label="Date of Birth" error={errors.dob} required>
                    <input
                      className="erp-input" type="date" name="dob" value={form.dob} onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      min={`${new Date().getFullYear() - 200}-01-01`}
                    />
                  </FormField>

                  {/* Admission Date */}
                  <FormField label="Admission Date" error={errors.admissionDate} required>
                    <input
                      className="erp-input" type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      min={form.dob || `${new Date().getFullYear() - 200}-01-01`}
                    />
                  </FormField>

                  {/* Parent Name */}
                  <FormField label="Parent / Guardian Name" error={errors.parentName} required>
                    <input className="erp-input" name="parentName" value={form.parentName} onChange={handleChange} placeholder="Parent full name" maxLength={60} />
                  </FormField>

                  {/* Phone */}
                  <FormField label="Phone Number" error={errors.phone} required>
                    <input className="erp-input" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" inputMode="numeric" maxLength={10} />
                  </FormField>

                  {/* Email */}
                  <FormField label="Email Address" error={errors.email} required>
                    <input className="erp-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" maxLength={100} />
                  </FormField>

                  {/* Address — full width */}
                  <FormField label="Address" error={errors.address} required>
                    <textarea className="erp-input erp-textarea" name="address" value={form.address} onChange={handleChange} placeholder="Full residential address" rows={3} maxLength={250} />
                  </FormField>
                </div>
              </div>

              <div className="erp-modal__footer">
                <button className="erp-btn-secondary" onClick={closeForm}>Cancel</button>
                <button className="erp-btn-primary" onClick={handleSubmit}>
                  {editingId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ERP_STYLES = `
  .erp-module {
    --clr-bg: #f0f2f8; --clr-surface: #ffffff; --clr-border: #e2e6f0;
    --clr-primary: #4f46e5; --clr-primary-hover: #4338ca;
    --clr-text: #1e1f2e; --clr-muted: #6b7280;
    --clr-danger: #ef4444; --clr-success: #22c55e; --clr-warn: #f59e0b;
    --radius: 10px; --shadow: 0 2px 12px rgba(79,70,229,0.07);
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-size: 14px; color: var(--clr-text);
    background: var(--clr-bg); min-height: 100vh;
    padding: 28px 32px; box-sizing: border-box;
  }
  .erp-module__header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .erp-module__eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--clr-primary); display: block; margin-bottom: 4px; }
  .erp-module__title { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: var(--clr-text); margin: 0; }
  .erp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .erp-stat-card { background: var(--clr-surface); border: 1px solid var(--clr-border); border-top: 3px solid var(--accent); border-radius: var(--radius); padding: 20px 24px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 4px; }
  .erp-stat-value { font-size: 34px; font-weight: 800; color: var(--accent); line-height: 1; }
  .erp-stat-label { font-size: 12px; font-weight: 500; color: var(--clr-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .erp-search-bar { display: flex; align-items: center; background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--radius); padding: 0 14px; margin-bottom: 20px; box-shadow: var(--shadow); }
  .erp-search-icon { font-size: 16px; margin-right: 10px; }
  .erp-search-input { flex: 1; border: none; outline: none; padding: 12px 0; font-size: 14px; background: transparent; color: var(--clr-text); }
  .erp-search-clear { background: none; border: none; cursor: pointer; color: var(--clr-muted); font-size: 14px; padding: 4px 6px; border-radius: 4px; }
  .erp-search-clear:hover { background: #f3f4f6; }
  .erp-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 2px solid var(--clr-border); }
  .erp-tab { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--clr-muted); border-bottom: 2px solid transparent; margin-bottom: -2px; display: flex; align-items: center; gap: 8px; transition: color 0.15s; }
  .erp-tab--active { color: var(--clr-primary); border-bottom-color: var(--clr-primary); font-weight: 600; }
  .erp-tab__badge { background: #e0e7ff; color: var(--clr-primary); font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
  .erp-tab__badge--warn { background: #fef3c7; color: var(--clr-warn); }
  .erp-section { background: var(--clr-surface); border-radius: var(--radius); border: 1px solid var(--clr-border); overflow: hidden; box-shadow: var(--shadow); }
  .erp-table-wrapper { overflow-x: auto; }
  .erp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .erp-table th { padding: 12px 16px; background: #f8f9fc; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--clr-muted); border-bottom: 1px solid var(--clr-border); white-space: nowrap; }
  .erp-table td { padding: 12px 16px; border-bottom: 1px solid #f1f3f9; vertical-align: middle; color: var(--clr-text); }
  .erp-table tbody tr:hover { background: #f8f9fc; }
  .erp-table__row--inactive td { color: var(--clr-muted); }
  .erp-table__empty { text-align: center; padding: 40px !important; color: var(--clr-muted); font-style: italic; }
  .erp-table__name { font-weight: 600; }
  .erp-table__email { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .erp-id { font-family: 'JetBrains Mono','Fira Code',monospace; font-size: 12px; background: #eef2ff; color: var(--clr-primary); padding: 2px 6px; border-radius: 4px; }
  .erp-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .erp-badge--active { background: #dcfce7; color: #16a34a; }
  .erp-badge--inactive { background: #fef3c7; color: #b45309; }
  .erp-actions { display: flex; gap: 6px; }
  .erp-btn-action { background: none; border: 1px solid var(--clr-border); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 14px; transition: background 0.15s; }
  .erp-btn-action:hover { background: #f3f4f6; }
  .erp-pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--clr-border); flex-wrap: wrap; gap: 12px; }
  .erp-pagination__info { font-size: 13px; color: var(--clr-muted); }
  .erp-pagination__controls { display: flex; gap: 6px; align-items: center; }
  .erp-btn-page { min-width: 36px; height: 36px; padding: 0 10px; border: 1px solid var(--clr-border); border-radius: 7px; background: var(--clr-surface); color: var(--clr-text); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .erp-btn-page:hover:not(:disabled) { background: #eef2ff; border-color: var(--clr-primary); color: var(--clr-primary); }
  .erp-btn-page--active { background: var(--clr-primary); border-color: var(--clr-primary); color: #fff; font-weight: 700; }
  .erp-btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
  .erp-btn-primary { background: var(--clr-primary); color: #fff; border: none; border-radius: var(--radius); padding: 10px 22px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
  .erp-btn-primary:hover { background: var(--clr-primary-hover); }
  .erp-btn-secondary { background: var(--clr-surface); color: var(--clr-text); border: 1px solid var(--clr-border); border-radius: var(--radius); padding: 10px 22px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
  .erp-btn-secondary:hover { background: #f3f4f6; }
  .erp-overlay { position: fixed; inset: 0; background: rgba(15,15,40,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(3px); }
  .erp-modal { background: var(--clr-surface); border-radius: 14px; width: 100%; max-width: 760px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.18); overflow: hidden; }
  .erp-modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; border-bottom: 1px solid var(--clr-border); background: #fafbff; }
  .erp-modal__title { font-size: 18px; font-weight: 700; margin: 0; color: var(--clr-text); }
  .erp-modal__close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--clr-muted); width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .erp-modal__close:hover { background: #f3f4f6; }
  .erp-modal__body { padding: 24px 28px; overflow-y: auto; flex: 1; }
  .erp-modal__footer { display: flex; justify-content: flex-end; gap: 12px; padding: 18px 28px; border-top: 1px solid var(--clr-border); background: #fafbff; }
  .erp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
  .erp-form-grid .erp-field:last-child { grid-column: 1 / -1; }
  .erp-field { display: flex; flex-direction: column; gap: 5px; }
  .erp-label { font-size: 12px; font-weight: 600; color: #374151; letter-spacing: 0.03em; }
  .erp-required { color: var(--clr-danger); margin-left: 2px; }
  .erp-input { border: 1px solid var(--clr-border); border-radius: 8px; padding: 9px 12px; font-size: 14px; color: var(--clr-text); outline: none; transition: border-color 0.15s, box-shadow 0.15s; background: #fff; width: 100%; box-sizing: border-box; font-family: inherit; }
  .erp-input:focus { border-color: var(--clr-primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .erp-textarea { resize: vertical; }
  .erp-field--error .erp-input { border-color: var(--clr-danger); }
  .erp-field--error .erp-input:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
  .erp-error-msg { font-size: 11px; color: var(--clr-danger); font-weight: 500; }
  .erp-toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 2000; box-shadow: 0 4px 20px rgba(0,0,0,0.15); animation: erp-slide-up 0.25s ease; }
  .erp-toast--success { background: #22c55e; color: #fff; }
  .erp-toast--error { background: var(--clr-danger); color: #fff; }
  @keyframes erp-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @media (max-width: 768px) {
    .erp-module { padding: 16px; }
    .erp-stats { grid-template-columns: 1fr; }
    .erp-form-grid { grid-template-columns: 1fr; }
    .erp-form-grid .erp-field:last-child { grid-column: auto; }
    .erp-module__header { flex-direction: column; align-items: flex-start; }
  }
`;