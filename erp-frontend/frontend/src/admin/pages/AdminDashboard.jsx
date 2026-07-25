import { useState, useMemo } from "react";
import { useERP } from "../../context/ERPContext.jsx";

const RECORDS_PER_PAGE = 5;

// ─── Activity type config ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  "Student Added":       { icon: "🎓", bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047" },
  "Student Updated":     { icon: "✏️",  bg: "#e3f2fd", color: "#1565c0", dot: "#1e88e5" },
  "Student Deactivated": { icon: "🚫", bg: "#fce4ec", color: "#880e4f", dot: "#e91e63" },
  "Student Restored":    { icon: "✅", bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047" },
  "Student Deleted":     { icon: "🗑️", bg: "#fce4ec", color: "#880e4f", dot: "#e91e63" },
  "Teacher Added":       { icon: "👨‍🏫", bg: "#e8eaf6", color: "#283593", dot: "#3949ab" },
  "Teacher Updated":     { icon: "✏️",  bg: "#e3f2fd", color: "#1565c0", dot: "#1e88e5" },
  "Teacher Deactivated": { icon: "🚫", bg: "#fff3e0", color: "#e65100", dot: "#fb8c00" },
  "Teacher Restored":    { icon: "✅", bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047" },
  "Parent Created":      { icon: "👪", bg: "#f3e5f5", color: "#6a1b9a", dot: "#8e24aa" },
  "Parent Updated":      { icon: "✏️",  bg: "#e3f2fd", color: "#1565c0", dot: "#1e88e5" },
  "Parent Deactivated":  { icon: "🚫", bg: "#fce4ec", color: "#880e4f", dot: "#e91e63" },
  "Parent Restored":     { icon: "✅", bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047" },
};

const getTypeCfg = (type) =>
  TYPE_CONFIG[type] || { icon: "📋", bg: "#f5f5f5", color: "#555", dot: "#999" };

 
function SummaryCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "10px",
      border: "1px solid #e8eaf0", borderTop: `4px solid ${accent}`,
      padding: "22px 24px", flex: "1", minWidth: "160px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#9fa5b8", textTransform: "uppercase", letterSpacing: "0.7px" }}>{label}</div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-1px", marginTop: "6px", lineHeight: 1 }}>{value.toLocaleString()}</div>
          <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "6px", fontWeight: 500 }}>{sub}</div>
        </div>
        <div style={{ fontSize: "26px", opacity: 0.18, userSelect: "none" }}>{icon}</div>
      </div>
    </div>
  );
}

function ProgressBar({ label, active, total, color }) {
  const pct     = total === 0 ? 0 : Math.round((active / total) * 100);
  const inactive = total - active;
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>{label}</span>
        <span style={{ fontSize: "11px", color: "#9fa5b8", fontWeight: 500 }}>{active} active / {inactive} inactive</span>
      </div>
      <div style={{ height: "7px", background: "#f0f2f8", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: "11px", color, fontWeight: 700, marginTop: "4px" }}>{pct}% active</div>
    </div>
  );
}

function ActivityBadge({ type }) {
  const cfg = getTypeCfg(type);
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: "12px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.2px",
      whiteSpace: "nowrap",
    }}>
      {cfg.icon} {type}
    </span>
  );
}

function PaginationBar({ currentPage, totalPages, totalRecords, perPage, onPageChange }) {
  const start = totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end   = Math.min(currentPage * perPage, totalRecords);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  const pageBtn = (pg, label, disabled, isActive) => (
    <button
      key={`${label ?? pg}`}
      onClick={() => !disabled && onPageChange(pg)}
      disabled={disabled}
      style={{
        padding: "6px 11px", minWidth: "34px",
        border: isActive ? "none" : "1px solid #e8eaf0",
        borderRadius: "6px", fontSize: "12px", fontWeight: isActive ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        background: isActive ? "#2e4fa3" : disabled ? "#f7f8fc" : "#fff",
        color: isActive ? "#fff" : disabled ? "#c0c4d0" : "#4a4f6a",
      }}
    >{label ?? pg}</button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", borderTop: "1px solid #f0f2f8", flexWrap: "wrap", gap: "10px",
    }}>
      <span style={{ fontSize: "12px", color: "#7a7f8e", fontWeight: 500 }}>
        {totalRecords === 0
          ? "No activities found"
          : `Showing ${start}–${end} of ${totalRecords} activit${totalRecords !== 1 ? "ies" : "y"}`}
      </span>
      <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
        {pageBtn(currentPage - 1, "← Prev", currentPage === 1, false)}
        {pages.map((p) => pageBtn(p, null, false, p === currentPage))}
        {pageBtn(currentPage + 1, "Next →", currentPage === totalPages || totalPages === 0, false)}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { students, teachers, parents, activities } = useERP();
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  // ── Live ERP stats derived from context (never hardcoded) ──
  const ERP_STATS = useMemo(() => {
    const studentsActive = students.filter((s) => s.status === "Active").length;
    const teachersActive = teachers.filter((t) => t.active).length;
    const parentsActive  = parents.filter((p) => p.active).length;
    return {
      students: { total: students.length, active: studentsActive, inactive: students.length - studentsActive },
      teachers: { total: teachers.length, active: teachersActive, inactive: teachers.length - teachersActive },
      parents:  { total: parents.length,  active: parentsActive,  inactive: parents.length - parentsActive  },
    };
  }, [students, teachers, parents]);

  // ══════════════════════════════════════════════════════════════════════
  // ANALYTICS DASHBOARD — filters + derived calculations. This block only
  // reads from ERPContext (students/teachers/parents/activities); it never
  // duplicates or copies that data, and its filters never touch Student,
  // Teacher, or Parent Management, CRUD, the existing Dashboard Statistics,
  // or the existing Search/Pagination below.
  // ══════════════════════════════════════════════════════════════════════
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterClass,     setFilterClass]     = useState("all");
  const [filterTeacher,   setFilterTeacher]   = useState("all");
  const [filterParent,    setFilterParent]    = useState("all");

  const hasAnyErpData = students.length > 0 || teachers.length > 0 || parents.length > 0;

  const resetAnalyticsFilters = () => {
    setFilterDateRange("all");
    setFilterStatus("all");
    setFilterClass("all");
    setFilterTeacher("all");
    setFilterParent("all");
  };

  // Dynamic filter option lists — always derived from live records, never hardcoded.
  const classOptions = useMemo(() =>
    [...new Set(students.map((s) => s.studentClass).filter(Boolean))]
      .sort((a, b) => (isNaN(a) || isNaN(b) ? String(a).localeCompare(String(b)) : Number(a) - Number(b))),
    [students]
  );
  const teacherOptions = useMemo(() =>
    [...new Set(teachers.map((t) => t.name).filter(Boolean))].sort(),
    [teachers]
  );
  const parentOptions = useMemo(() =>
    [...new Set(parents.map((p) => p.name).filter(Boolean))].sort(),
    [parents]
  );

  const analyticsDateStart = useMemo(() => {
    const now = new Date();
    if (filterDateRange === "today") { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    if (filterDateRange === "7d")    { const d = new Date(now); d.setDate(d.getDate() - 7);  return d; }
    if (filterDateRange === "30d")   { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
    return null; // "all" — no lower bound
  }, [filterDateRange]);

  // Filtered record sets — computed once, reused by every KPI/table below.
  const filteredStudents = useMemo(() => students.filter((s) => {
    if (filterStatus === "active" && s.status !== "Active") return false;
    if (filterStatus === "inactive" && s.status === "Active") return false;
    if (filterClass !== "all" && s.studentClass !== filterClass) return false;
    if (analyticsDateStart && s.createdAt && new Date(s.createdAt) < analyticsDateStart) return false;
    return true;
  }), [students, filterStatus, filterClass, analyticsDateStart]);

  const filteredTeachers = useMemo(() => teachers.filter((t) => {
    if (filterStatus === "active" && !t.active) return false;
    if (filterStatus === "inactive" && t.active) return false;
    if (filterTeacher !== "all" && t.name !== filterTeacher) return false;
    return true;
  }), [teachers, filterStatus, filterTeacher]);

  const filteredParents = useMemo(() => parents.filter((p) => {
    if (filterStatus === "active" && !p.active) return false;
    if (filterStatus === "inactive" && p.active) return false;
    if (filterParent !== "all" && p.name !== filterParent) return false;
    return true;
  }), [parents, filterStatus, filterParent]);

  const filteredAnalyticsActivities = useMemo(() => activities.filter((a) => {
    if (!analyticsDateStart) return true;
    const ts = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
    return ts >= analyticsDateStart;
  }), [activities, analyticsDateStart]);

  // ── KPI Cards ──
  const analyticsTotalStudents = filteredStudents.length;
  const analyticsTotalTeachers = filteredTeachers.length;
  const analyticsTotalParents  = filteredParents.length;
  const analyticsTotalRecords  = analyticsTotalStudents + analyticsTotalTeachers + analyticsTotalParents;
  const analyticsActiveRecords =
    filteredStudents.filter((s) => s.status === "Active").length +
    filteredTeachers.filter((t) => t.active).length +
    filteredParents.filter((p) => p.active).length;
  const analyticsInactiveRecords = analyticsTotalRecords - analyticsActiveRecords;
  const analyticsTotalActivities = filteredAnalyticsActivities.length;

  // ── Summary Widgets ──
  const analyticsActivePct   = analyticsTotalRecords === 0 ? 0 : Math.round((analyticsActiveRecords / analyticsTotalRecords) * 100);
  const analyticsInactivePct = analyticsTotalRecords === 0 ? 0 : 100 - analyticsActivePct;

  const latestActivityCount = useMemo(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return activities.filter((a) => {
      const ts = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
      return ts >= cutoff;
    }).length;
  }, [activities]);

  // ── Progress Indicators (share of filtered total records) ──
  const studentsSharePct = analyticsTotalRecords === 0 ? 0 : Math.round((analyticsTotalStudents / analyticsTotalRecords) * 100);
  const teachersSharePct = analyticsTotalRecords === 0 ? 0 : Math.round((analyticsTotalTeachers / analyticsTotalRecords) * 100);
  const parentsSharePct  = analyticsTotalRecords === 0 ? 0 : Math.round((analyticsTotalParents / analyticsTotalRecords) * 100);

  // ── Analytics Tables ──
  const studentsPerClass = useMemo(() => {
    const map = {};
    filteredStudents.forEach((s) => {
      const label = s.studentClass ? `Class ${s.studentClass}${s.section ? "-" + s.section : ""}` : "Unassigned";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents]);

  const topClasses = useMemo(() => studentsPerClass.slice(0, 5), [studentsPerClass]);

  const teacherDistribution = useMemo(() => {
    const map = {};
    filteredTeachers.forEach((t) => {
      const label = t.subject || "Unassigned";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTeachers]);

  const parentDistribution = useMemo(() => {
    const map = {};
    filteredParents.forEach((p) => {
      const label = p.relationship || "Unspecified";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredParents]);

  const recentStatistics = useMemo(() => filteredAnalyticsActivities.slice(0, 6), [filteredAnalyticsActivities]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // ── Filtered + paginated activity log ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) =>
      [a.id, a.type, a.description, a.status, a.module, a.recordName, a.recordId]
        .some((f) => f && f.toLowerCase().includes(q))
    );
  }, [search, activities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / RECORDS_PER_PAGE));
  const paged      = filtered.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  // ── ERP totals ──
  const totalRecords = ERP_STATS.students.total + ERP_STATS.teachers.total + ERP_STATS.parents.total;
  const totalActive  = ERP_STATS.students.active + ERP_STATS.teachers.active + ERP_STATS.parents.active;

  // ── Today's count ──
  const todayStr   = new Date().toISOString().split("T")[0];
  const todayCount = activities.filter((a) => a.date === todayStr).length;

  // ── Style tokens ──
  const th = {
    padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700,
    color: "#7a7f8e", textTransform: "uppercase", letterSpacing: "0.6px",
    background: "#f7f8fc", borderBottom: "2px solid #e8eaf0", whiteSpace: "nowrap",
  };
  const td = {
    padding: "12px 16px", fontSize: "13px", color: "#1a1f36",
    borderBottom: "1px solid #f0f2f8", verticalAlign: "middle",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5fb", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      <style>{`
        tbody tr:hover td { background: #fafbff; }
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-thumb { background: #c5cae9; border-radius: 4px; }
        input:focus { outline: none; border-color: #2e4fa3 !important; box-shadow: 0 0 0 3px rgba(46,79,163,.1); }
      `}</style>

      {/* ── Top Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8eaf0" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-0.3px" }}>Admin Dashboard</div>
            <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "1px", fontWeight: 500 }}>School ERP · System Overview</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 600 }}>{today}</div>
            <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>{todayCount} activit{todayCount !== 1 ? "ies" : "y"} today</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "28px 32px" }}>

        {/* ══════════════════════════════════════════════════════════════
            ANALYTICS DASHBOARD — enhancement layer added above the
            existing Admin Dashboard. Everything here is derived
            exclusively from ERPContext; the section below (Summary
            Overview / System Snapshot / Recent Activities / Search /
            Pagination) is completely unchanged and untouched.
           ══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-0.3px" }}>
              Analytics Dashboard
            </div>
            <div style={{ fontSize: "12px", color: "#7a7f8e", fontWeight: 500, marginTop: "2px" }}>
              Enterprise-wide analytics across Students, Teachers, and Parents — filters apply only to this section
            </div>
          </div>

          {!hasAnyErpData ? (
            <div style={{
              background: "#fff", border: "1px dashed #d0d4e0", borderRadius: "10px",
              padding: "48px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: "34px", opacity: 0.35, marginBottom: "10px" }}>📊</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#4a4f6a" }}>No Analytics Data Yet</div>
              <div style={{ fontSize: "12px", color: "#9fa5b8", marginTop: "6px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                Add students, teachers, or parents through their respective management modules to see live KPIs,
                distributions, and analytics tables appear here automatically.
              </div>
            </div>
          ) : (
            <>
              {/* ── Analytics Filters ── */}
              <div style={{
                background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px",
                padding: "16px 20px", marginBottom: "20px",
                display: "flex", gap: "14px", alignItems: "flex-end", flexWrap: "wrap",
              }}>
                {[
                  {
                    label: "Date Range", value: filterDateRange, onChange: setFilterDateRange,
                    options: [["all", "All Time"], ["today", "Today"], ["7d", "Last 7 Days"], ["30d", "Last 30 Days"]],
                  },
                  {
                    label: "Status", value: filterStatus, onChange: setFilterStatus,
                    options: [["all", "All Status"], ["active", "Active"], ["inactive", "Inactive"]],
                  },
                  {
                    label: "Class", value: filterClass, onChange: setFilterClass,
                    options: [["all", "All Classes"], ...classOptions.map((c) => [c, `Class ${c}`])],
                  },
                  {
                    label: "Teacher", value: filterTeacher, onChange: setFilterTeacher,
                    options: [["all", "All Teachers"], ...teacherOptions.map((t) => [t, t])],
                  },
                  {
                    label: "Parent", value: filterParent, onChange: setFilterParent,
                    options: [["all", "All Parents"], ...parentOptions.map((p) => [p, p])],
                  },
                ].map((f) => (
                  <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "150px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#4a4f6a", letterSpacing: "0.3px" }}>{f.label}</label>
                    <select
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      style={{
                        padding: "8px 10px", fontSize: "12px", color: "#1a1f36",
                        border: "1px solid #d0d4e0", borderRadius: "6px", background: "#fff",
                        fontFamily: "inherit", outline: "none", cursor: "pointer",
                      }}
                    >
                      {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                ))}
                <button
                  onClick={resetAnalyticsFilters}
                  style={{
                    padding: "8px 16px", background: "#f0f2f8", color: "#2e4fa3",
                    border: "1px solid #c5cae9", borderRadius: "6px", fontSize: "12px",
                    fontWeight: 600, cursor: "pointer", marginLeft: "auto",
                  }}
                >
                  Reset Filters
                </button>
              </div>

              {/* ── KPI Cards ── */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
                <SummaryCard label="Total Students" value={analyticsTotalStudents} sub="Matching current filters" accent="#1e88e5" icon="🎓" />
                <SummaryCard label="Total Teachers" value={analyticsTotalTeachers} sub="Matching current filters" accent="#8e24aa" icon="👨‍🏫" />
                <SummaryCard label="Total Parents" value={analyticsTotalParents} sub="Matching current filters" accent="#fb8c00" icon="👪" />
                <SummaryCard label="Total Records" value={analyticsTotalRecords} sub="Students + Teachers + Parents" accent="#2e4fa3" icon="🗂️" />
                <SummaryCard label="Total Active Records" value={analyticsActiveRecords} sub={`${analyticsActivePct}% of filtered total`} accent="#2e7d32" icon="✅" />
                <SummaryCard label="Total Inactive Records" value={analyticsInactiveRecords} sub={`${analyticsInactivePct}% of filtered total`} accent="#e65100" icon="🚫" />
                <SummaryCard label="Total Activities" value={analyticsTotalActivities} sub="Within selected date range" accent="#6a1b9a" icon="📋" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>

                {/* Progress Indicators */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
                    Composition · Share of Filtered Records
                  </div>
                  {[
                    { label: "Students", count: analyticsTotalStudents, pct: studentsSharePct, color: "#1e88e5" },
                    { label: "Teachers", count: analyticsTotalTeachers, pct: teachersSharePct, color: "#8e24aa" },
                    { label: "Parents",  count: analyticsTotalParents,  pct: parentsSharePct,  color: "#fb8c00" },
                  ].map((row) => (
                    <div key={row.label} style={{ marginBottom: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>{row.label}</span>
                        <span style={{ fontSize: "11px", color: "#9fa5b8", fontWeight: 500 }}>{row.count} record{row.count !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ height: "7px", background: "#f0f2f8", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, borderRadius: "4px", transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ fontSize: "11px", color: row.color, fontWeight: 700, marginTop: "4px" }}>{row.pct}% of filtered total</div>
                    </div>
                  ))}
                </div>

                {/* Summary Widgets */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
                    Current System Snapshot
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { label: "Today's Activity Count", value: activities.filter((a) => a.date === new Date().toISOString().split("T")[0]).length.toString(), accent: "#c62828", bg: "#ffebee" },
                      { label: "Latest Activity (24h)",   value: latestActivityCount.toString(),                                                              accent: "#00838f", bg: "#e0f7fa" },
                      { label: "Active %",                value: `${analyticsActivePct}%`,                                                                    accent: "#2e7d32", bg: "#e8f5e9" },
                      { label: "Inactive %",               value: `${analyticsInactivePct}%`,                                                                  accent: "#e65100", bg: "#fff3e0" },
                      { label: "Total Records",            value: analyticsTotalRecords.toLocaleString(),                                                      accent: "#2e4fa3", bg: "#e8eaf6" },
                      { label: "Active Records",           value: analyticsActiveRecords.toLocaleString(),                                                     accent: "#2e7d32", bg: "#e8f5e9" },
                      { label: "Inactive Records",         value: analyticsInactiveRecords.toLocaleString(),                                                   accent: "#e65100", bg: "#fff3e0" },
                      { label: "Filtered Activities",      value: analyticsTotalActivities.toLocaleString(),                                                   accent: "#6a1b9a", bg: "#f3e5f5" },
                    ].map(({ label, value, accent, bg }) => (
                      <div key={label} style={{ background: bg, borderRadius: "8px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: accent }}>{value}</div>
                        <div style={{ fontSize: "11px", color: "#4a4f6a", fontWeight: 600, marginTop: "3px" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Analytics Tables ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>

                {/* Students Per Class */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8eaf0", background: "#fafbff", fontWeight: 700, fontSize: "13px", color: "#1a1f36" }}>
                    Students Per Class
                  </div>
                  {studentsPerClass.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#9fa5b8" }}>No students match the current filters.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {studentsPerClass.map((row) => (
                          <tr key={row.label}>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8" }}>{row.label}</td>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8", textAlign: "right", fontWeight: 700, color: "#1e88e5" }}>{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Top Classes */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8eaf0", background: "#fafbff", fontWeight: 700, fontSize: "13px", color: "#1a1f36" }}>
                    Top Classes
                  </div>
                  {topClasses.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#9fa5b8" }}>No students match the current filters.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {topClasses.map((row, i) => (
                          <tr key={row.label}>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8", width: "28px", color: "#9fa5b8", fontWeight: 700 }}>#{i + 1}</td>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8" }}>{row.label}</td>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8", textAlign: "right", fontWeight: 700, color: "#8e24aa" }}>{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Teacher Distribution */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8eaf0", background: "#fafbff", fontWeight: 700, fontSize: "13px", color: "#1a1f36" }}>
                    Teacher Distribution · By Subject
                  </div>
                  {teacherDistribution.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#9fa5b8" }}>No teachers match the current filters.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {teacherDistribution.map((row) => (
                          <tr key={row.label}>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8" }}>{row.label}</td>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8", textAlign: "right", fontWeight: 700, color: "#8e24aa" }}>{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Parent Distribution */}
                <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8eaf0", background: "#fafbff", fontWeight: 700, fontSize: "13px", color: "#1a1f36" }}>
                    Parent Distribution · By Relationship
                  </div>
                  {parentDistribution.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#9fa5b8" }}>No parents match the current filters.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {parentDistribution.map((row) => (
                          <tr key={row.label}>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8" }}>{row.label}</td>
                            <td style={{ ...td, borderBottom: "1px solid #f0f2f8", textAlign: "right", fontWeight: 700, color: "#fb8c00" }}>{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Recent Statistics */}
              <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8eaf0", background: "#fafbff", fontWeight: 700, fontSize: "13px", color: "#1a1f36" }}>
                  Recent Statistics
                </div>
                {recentStatistics.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#9fa5b8" }}>No activity within the selected date range.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Activity ID", "Type", "Module", "Date"].map((h) => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentStatistics.map((a) => (
                          <tr key={a.id}>
                            <td style={td}>
                              <span style={{
                                fontFamily: "monospace", fontWeight: 700, fontSize: "12px",
                                background: "#e8eaf6", color: "#2e4fa3", padding: "3px 8px", borderRadius: "4px",
                              }}>{a.id}</span>
                            </td>
                            <td style={td}><ActivityBadge type={a.type} /></td>
                            <td style={{ ...td, color: "#7a7f8e", fontSize: "12px" }}>
                              <span style={{ background: "#f0f2f8", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 600 }}>
                                {a.module || "—"}
                              </span>
                            </td>
                            <td style={{ ...td, whiteSpace: "nowrap", color: "#7a7f8e", fontSize: "12px", fontWeight: 500 }}>{a.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Section label ── */}
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
          Summary Overview
        </div>

        {/* ── Summary Cards ── */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "28px" }}>
          <SummaryCard label="Total Students"  value={ERP_STATS.students.total}  sub={`${ERP_STATS.students.active} active · ${ERP_STATS.students.inactive} inactive`}  accent="#1e88e5" icon="🎓" />
          <SummaryCard label="Active Students" value={ERP_STATS.students.active} sub={`${ERP_STATS.students.total === 0 ? 0 : Math.round(ERP_STATS.students.active/ERP_STATS.students.total*100)}% of total enrolled`} accent="#43a047" icon="✅" />
          <SummaryCard label="Total Teachers"  value={ERP_STATS.teachers.total}  sub={`${ERP_STATS.teachers.active} active · ${ERP_STATS.teachers.inactive} inactive`}  accent="#8e24aa" icon="👨‍🏫" />
          <SummaryCard label="Active Teachers" value={ERP_STATS.teachers.active} sub={`${ERP_STATS.teachers.total === 0 ? 0 : Math.round(ERP_STATS.teachers.active/ERP_STATS.teachers.total*100)}% of teaching staff`} accent="#00897b" icon="✅" />
          <SummaryCard label="Total Parents"   value={ERP_STATS.parents.total}   sub={`${ERP_STATS.parents.active} active · ${ERP_STATS.parents.inactive} inactive`}   accent="#fb8c00" icon="👪" />
          <SummaryCard label="Active Parents"  value={ERP_STATS.parents.active}  sub={`${ERP_STATS.parents.total === 0 ? 0 : Math.round(ERP_STATS.parents.active/ERP_STATS.parents.total*100)}% of guardians`} accent="#e53935" icon="✅" />
        </div>

        {/* ── Analytics Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "28px" }}>

          {/* Distribution Progress */}
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
              Active vs Inactive · By Category
            </div>
            <ProgressBar label="Students" active={ERP_STATS.students.active} total={ERP_STATS.students.total} color="#1e88e5" />
            <ProgressBar label="Teachers" active={ERP_STATS.teachers.active} total={ERP_STATS.teachers.total} color="#8e24aa" />
            <ProgressBar label="Parents"  active={ERP_STATS.parents.active}  total={ERP_STATS.parents.total}  color="#fb8c00" />
          </div>

          {/* Quick Stats Grid */}
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#2e4fa3", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
              System Snapshot
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Total Records",          value: totalRecords.toLocaleString(),                                                         accent: "#2e4fa3", bg: "#e8eaf6" },
                { label: "Total Active",            value: totalActive.toLocaleString(),                                                          accent: "#2e7d32", bg: "#e8f5e9" },
                { label: "Total Inactive",          value: (totalRecords - totalActive).toLocaleString(),                                         accent: "#e65100", bg: "#fff3e0" },
                { label: "Activities Logged",       value: activities.length.toString(),                                                          accent: "#6a1b9a", bg: "#f3e5f5" },
                { label: "Student–Teacher Ratio",   value: ERP_STATS.teachers.active === 0 ? "—" : `${Math.round(ERP_STATS.students.active / ERP_STATS.teachers.active)}:1`, accent: "#00838f", bg: "#e0f7fa" },
                { label: "Today's Events",          value: todayCount.toString(),                                                                 accent: "#c62828", bg: "#ffebee" },
              ].map(({ label, value, accent, bg }) => (
                <div key={label} style={{ background: bg, borderRadius: "8px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: accent }}>{value}</div>
                  <div style={{ fontSize: "11px", color: "#4a4f6a", fontWeight: 600, marginTop: "3px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity Distribution Mini-cards ── */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
          {[
            { label: "Student Events", count: activities.filter((a) => a.type && a.type.startsWith("Student")).length,  color: "#1e88e5", bg: "#e3f2fd" },
            { label: "Teacher Events", count: activities.filter((a) => a.type && a.type.startsWith("Teacher")).length,  color: "#8e24aa", bg: "#f3e5f5" },
            { label: "Parent Events",  count: activities.filter((a) => a.type && a.type.startsWith("Parent")).length,   color: "#fb8c00", bg: "#fff8e1" },
            { label: "Additions",      count: activities.filter((a) => a.type && (a.type.includes("Added") || a.type.includes("Created"))).length, color: "#2e7d32", bg: "#e8f5e9" },
            { label: "Deactivations",  count: activities.filter((a) => a.type && a.type.includes("Deactivated")).length, color: "#c62828", bg: "#ffebee" },
            { label: "Updates",        count: activities.filter((a) => a.type && a.type.includes("Updated")).length,     color: "#00838f", bg: "#e0f7fa" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{
              background: "#fff", border: "1px solid #e8eaf0", borderRadius: "8px",
              padding: "14px 18px", flex: "1", minWidth: "130px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{ width: "38px", height: "38px", background: bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color }}>{count}</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#4a4f6a" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Recent Activities Table ── */}
        <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(46,79,163,.05)" }}>

          {/* Table header bar */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #e8eaf0", background: "#fafbff",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1f36" }}>Recent Activities</div>
              <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>
                {activities.length === 0
                  ? "No activities yet — perform CRUD operations to see logs here."
                  : `${activities.length} total ERP event${activities.length !== 1 ? "s" : ""} logged`}
              </div>
            </div>
            {/* Activity search bar */}
            <div style={{ position: "relative", width: "320px" }}>
              <span style={{
                position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)",
                color: "#9fa5b8", fontSize: "15px", pointerEvents: "none",
              }}>⌕</span>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by ID, type, description…"
                style={{
                  width: "100%", padding: "8px 12px 8px 30px", fontSize: "13px",
                  border: "1px solid #d0d4e0", borderRadius: "6px", background: "#fff",
                  color: "#1a1f36", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  style={{
                    position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9fa5b8", fontSize: "14px",
                  }}
                >✕</button>
              )}
            </div>
          </div>

          {/* Table */}
          {activities.length === 0 && !search ? (
            <div style={{ padding: "64px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#4a4f6a" }}>No Recent Activities</div>
              <div style={{ fontSize: "13px", color: "#9fa5b8", marginTop: "6px" }}>
                Add a student, teacher, or parent to see activity logs appear here automatically.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Activity ID", "Activity Type", "Description", "Module", "Date", "Status"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...td, textAlign: "center", padding: "48px", color: "#9fa5b8" }}>
                        No activities match <strong>"{search}"</strong>. Try a different search term.
                      </td>
                    </tr>
                  ) : (
                    paged.map((a) => (
                      <tr key={a.id}>
                        <td style={td}>
                          <span style={{
                            fontFamily: "monospace", fontWeight: 700, fontSize: "12px",
                            background: "#e8eaf6", color: "#2e4fa3",
                            padding: "3px 8px", borderRadius: "4px",
                          }}>{a.id}</span>
                        </td>
                        <td style={td}><ActivityBadge type={a.type} /></td>
                        <td style={{ ...td, maxWidth: "280px", color: "#4a4f6a" }}>{a.description}</td>
                        <td style={{ ...td, color: "#7a7f8e", fontSize: "12px" }}>
                          <span style={{
                            background: "#f0f2f8", padding: "2px 8px", borderRadius: "8px",
                            fontSize: "11px", fontWeight: 600,
                          }}>{a.module || "—"}</span>
                        </td>
                        <td style={{ ...td, whiteSpace: "nowrap", color: "#7a7f8e", fontSize: "12px", fontWeight: 500 }}>
                          {a.timestamp
                            ? new Date(a.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td style={td}>
                          <span style={{
                            background: "#e8f5e9", color: "#2e7d32",
                            padding: "3px 10px", borderRadius: "12px",
                            fontSize: "11px", fontWeight: 700,
                          }}>✓ {a.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activities.length > 0 && (
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              totalRecords={filtered.length}
              perPage={RECORDS_PER_PAGE}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#b0b4c4", fontWeight: 500 }}>
          School ERP · Admin Dashboard · All statistics are live from the ERP data layer
        </div>
      </div>
    </div>
  );
}
