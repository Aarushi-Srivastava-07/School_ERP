import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useERP } from "../pages/ERPContext.jsx";
import "./Navbar.css";

const PAGE_TITLES = {
  "/admin":    "Dashboard",
  "/students": "Students",
  "/teachers": "Teachers",
  "/parents":  "Parents",
};

// ─── Global Search ────────────────────────────────────────────────────────────
function GlobalSearch() {
  const { students, teachers, parents } = useERP();
  const navigate = useNavigate();

  const [query, setQuery]   = useState("");
  const [open,  setOpen]    = useState(false);
  const containerRef        = useRef(null);
  const inputRef            = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { students: [], teachers: [], parents: [] };

    const matchStudent = (s) =>
      [s.studentId, s.name, s.phone, s.email].some(
        (f) => f && f.toLowerCase().includes(q)
      );
    const matchTeacher = (t) =>
      [t.id, t.name, t.phone, t.email].some(
        (f) => f && f.toLowerCase().includes(q)
      );
    const matchParent = (p) =>
      [p.id, p.name, p.phone, p.email].some(
        (f) => f && f.toLowerCase().includes(q)
      );

    return {
      students: students.filter(matchStudent).slice(0, 5),
      teachers: teachers.filter(matchTeacher).slice(0, 5),
      parents:  parents.filter(matchParent).slice(0, 5),
    };
  }, [q, students, teachers, parents]);

  const hasResults =
    results.students.length + results.teachers.length + results.parents.length > 0;

  const handleSelect = (path) => {
    setQuery("");
    setOpen(false);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "340px" }}>
      {/* Search Input */}
      <div className="navbar__search">
        <svg
          className="navbar__search-icon"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search students, teachers, parents…"
          aria-label="Global Search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query) setOpen(true); }}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13px" }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9fa5b8", fontSize: "14px", padding: "0 4px", lineHeight: 1 }}
            aria-label="Clear search"
          >✕</button>
        )}
      </div>

      {/* Results Dropdown */}
      {open && query && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 9999, overflow: "hidden",
          maxHeight: "420px", overflowY: "auto",
        }}>
          {!hasResults ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#9fa5b8", fontSize: "13px" }}>
              No results found for <strong>"{query}"</strong>
            </div>
          ) : (
            <>
              <ResultGroup
                label="Students"
                icon="🎓"
                color="#1e88e5"
                items={results.students}
                renderItem={(s) => (
                  <ResultRow
                    key={s.id}
                    primary={s.name}
                    secondary={`${s.studentId} · Class ${s.studentClass}-${s.section}`}
                    meta={s.phone}
                    badgeBg="#e3f2fd"
                    badgeColor="#1565c0"
                    onClick={() => handleSelect("/students")}
                  />
                )}
              />
              <ResultGroup
                label="Teachers"
                icon="👨‍🏫"
                color="#3949ab"
                items={results.teachers}
                renderItem={(t) => (
                  <ResultRow
                    key={t.id}
                    primary={t.name}
                    secondary={`${t.id} · ${t.subject}`}
                    meta={t.phone}
                    badgeBg="#e8eaf6"
                    badgeColor="#283593"
                    onClick={() => handleSelect("/teachers")}
                  />
                )}
              />
              <ResultGroup
                label="Parents"
                icon="👪"
                color="#8e24aa"
                items={results.parents}
                renderItem={(p) => (
                  <ResultRow
                    key={p.id}
                    primary={p.name}
                    secondary={`${p.id} · ${p.relationship || "Guardian"}`}
                    meta={p.phone}
                    badgeBg="#f3e5f5"
                    badgeColor="#6a1b9a"
                    onClick={() => handleSelect("/parents")}
                  />
                )}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, icon, color, items, renderItem }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div style={{
        padding: "8px 14px 4px",
        fontSize: "10px", fontWeight: 700, color,
        textTransform: "uppercase", letterSpacing: "0.8px",
        borderBottom: "1px solid #f0f2f8", background: "#fafbff",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        <span>{icon}</span> {label}
        <span style={{ marginLeft: "auto", background: color, color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "10px" }}>
          {items.length}
        </span>
      </div>
      {items.map(renderItem)}
    </div>
  );
}

function ResultRow({ primary, secondary, meta, badgeBg, badgeColor, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        width: "100%", padding: "10px 14px", border: "none", textAlign: "left",
        background: hovered ? "#f4f5fb" : "#fff", cursor: "pointer",
        borderBottom: "1px solid #f8f9fc", transition: "background 0.1s",
      }}
    >
      <div style={{
        width: "34px", height: "34px", borderRadius: "8px",
        background: badgeBg, color: badgeColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: "12px", flexShrink: 0,
      }}>
        {primary.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1f36", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {primary}
        </div>
        <div style={{ fontSize: "11px", color: "#7a7f8e", marginTop: "1px" }}>{secondary}</div>
      </div>
      {meta && (
        <div style={{ fontSize: "11px", color: "#9fa5b8", flexShrink: 0 }}>{meta}</div>
      )}
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { pathname } = useLocation();
  const title        = PAGE_TITLES[pathname] || "Brightwood ERP";
  const isAdmin      = pathname === "/admin";

  return (
    <header className="navbar">
      <div className="navbar__title-block">
        <h1 className="navbar__title">{title}</h1>
        <p className="navbar__breadcrumb">Admin Console / {title}</p>
      </div>

      <div className="navbar__actions">
        {/* Search is ONLY shown on the Admin Dashboard */}
        {isAdmin && <GlobalSearch />}

        <button type="button" className="navbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="navbar__notification-dot" />
        </button>

        <div className="navbar__avatar" aria-hidden="true">A</div>
      </div>
    </header>
  );
}

export default Navbar;