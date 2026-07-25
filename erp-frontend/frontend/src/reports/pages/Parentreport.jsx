import { useState, useMemo, useCallback } from "react";
import { useERP } from "../ERPContext.jsx";
import {
  ReportShell, SummaryCard, DistributionBar, ProgressBar, AnalyticsPanel,
  StatusBadge, SearchBox, FilterSelect, SortableTh, PaginationBar, EmptyState,
  IdChip, ExportButtons, thStyle, tdStyle, ACCENT,
} from "./reportShared.jsx";
import { exportReportToPDF } from "../../utils/exportPDF.js";
import { exportReportToExcel } from "../../utils/exportExcel.js";

const RECORDS_PER_PAGE = 8;
const PARENT_ACCENT = "#ad1457"; // this report's own signature accent — visually distinct from Student (blue) / Teacher (purple)

// Columns for the Parent Report table — shared verbatim between the on-screen
// table, the PDF export, and the Excel export so all three always match.
const EXPORT_COLUMNS = [
  "Parent ID", "Parent Name", "Student Name", "Student ID", "Class", "Section",
  "Relationship", "Phone", "Email", "Linked Date", "Status",
];

// ─── Local, Parent-Report-only visual primitives (kept out of reportShared.jsx
//     so Student Report / Teacher Report are never affected) — these are what
//     give this report its own identity per the design requirement. ──────────

function StatRing({ pct, label, sub, color = PARENT_ACCENT, size = 96 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px",
      padding: "20px", display: "flex", alignItems: "center", gap: "18px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)", flex: "1", minWidth: "260px",
    }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: `conic-gradient(${color} ${clamped * 3.6}deg, #f0f2f8 0deg)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: size - 16, height: size - 16, borderRadius: "50%", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", fontWeight: 800, color: "#1a1f36",
        }}>
          {clamped}%
        </div>
      </div>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36" }}>{label}</div>
        <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "3px", lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  );
}

function InsightTile({ icon, label, value, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#f7f8fc", fg: "#1a1f36" },
    warn:    { bg: "#fff3e0", fg: "#e65100" },
    danger:  { bg: "#ffebee", fg: "#c62828" },
    good:    { bg: "#e8f5e9", fg: "#2e7d32" },
    info:    { bg: "#fce4ec", fg: PARENT_ACCENT },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      background: t.bg, borderRadius: "8px", padding: "12px 14px",
    }}>
      <div style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#7a7f8e" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 800, color: t.fg, marginTop: "2px" }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const monthLabel = (d) => d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
const monthKey   = (d) => d.getFullYear() * 12 + d.getMonth();
const fmtDate    = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function ParentReport() {
  const { parents, students } = useERP();

  // ── Local UI state — filters/sort/search/pagination affect ONLY this report ──
  const [search, setSearch]             = useState("");
  const [filterClass, setFilterClass]   = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterRelationship, setFilterRelationship] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLinked, setFilterLinked] = useState("all");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [sortKey, setSortKey]           = useState("linkedDate");
  const [sortDir, setSortDir]           = useState("desc");
  const [page, setPage]                 = useState(1);

  // ── The real Student ↔ Parent join, re-derived from ERPContext ───────────
  // One row per (parent, child) pair. A parent with zero children still
  // produces one "unlinked parent" row; a student with no matching parent
  // is tracked separately as a data-quality issue below.
  const links = useMemo(() => {
    const rows = [];
    parents.forEach((p) => {
      const childNames = (p.children && p.children.length > 0)
        ? p.children
        : (p.studentName ? p.studentName.split(",").map((n) => n.trim()).filter(Boolean) : []);

      if (childNames.length === 0) {
        rows.push({ parent: p, student: null });
        return;
      }
      childNames.forEach((childName) => {
        const student = students.find((s) => s.name === childName && s.phone === p.phone) || null;
        rows.push({ parent: p, student, childName });
      });
    });
    return rows;
  }, [parents, students]);

  const linkedStudentInternalIds = useMemo(
    () => new Set(links.filter((l) => l.student).map((l) => l.student.id)),
    [links]
  );

  // ── Summary Cards ──
  const totalParents = parents.length;
  const activeParents = useMemo(() => parents.filter((p) => p.active).length, [parents]);
  const inactiveParents = totalParents - activeParents;
  const totalLinkedStudents = linkedStudentInternalIds.size;
  const studentsWithoutParentLink = students.length - totalLinkedStudents;
  const avgChildrenPerParent = useMemo(() => {
    if (totalParents === 0) return 0;
    const sum = parents.reduce((acc, p) => acc + (p.numberOfChildren ?? (p.children ? p.children.length : 0)), 0);
    return sum / totalParents;
  }, [parents, totalParents]);
  const communicationCoverage = useMemo(() => {
    if (totalParents === 0) return 0;
    const fullyReachable = parents.filter((p) => p.phone && p.email).length;
    return Math.round((fullyReachable / totalParents) * 100);
  }, [parents, totalParents]);

  // ── Analytics 1: Parent ↔ Student Distribution (children per parent) ──
  const childDistribution = useMemo(() => {
    let one = 0, two = 0, multiple = 0;
    parents.forEach((p) => {
      const n = p.numberOfChildren ?? (p.children ? p.children.length : 0);
      if (n === 1) one += 1;
      else if (n === 2) two += 1;
      else if (n >= 3) multiple += 1;
    });
    return { one, two, multiple };
  }, [parents]);

  // ── Analytics 2: Parent Status ──
  // Note: the ERP's data model only tracks Active/Inactive for parents —
  // there is no "Pending" state in ERPContext, so it is intentionally not
  // fabricated here.

  // ── Analytics 3: Communication Health ──
  const commHealth = useMemo(() => ({
    emailOnFile:   parents.filter((p) => !!p.email).length,
    phoneOnFile:   parents.filter((p) => !!p.phone).length,
    missingEmail:  parents.filter((p) => !p.email).length,
    missingPhone:  parents.filter((p) => !p.phone).length,
  }), [parents]);

  // ── Analytics 4 & 5: Class-wise / Section-wise Parent Distribution ──
  // Counts DISTINCT parents represented in each class/section (a parent with
  // two children in the same class still counts once for that class).
  const classDistribution = useMemo(() => {
    const map = {};
    links.filter((l) => l.student).forEach((l) => {
      const label = l.student.studentClass ? `Class ${l.student.studentClass}` : "Unassigned";
      if (!map[label]) map[label] = new Set();
      map[label].add(l.parent.id);
    });
    return Object.entries(map)
      .map(([label, set]) => ({ label, count: set.size }))
      .sort((a, b) => b.count - a.count);
  }, [links]);

  const sectionDistribution = useMemo(() => {
    const map = {};
    links.filter((l) => l.student).forEach((l) => {
      const label = l.student.section ? `Section ${l.student.section}` : "Unassigned";
      if (!map[label]) map[label] = new Set();
      map[label].add(l.parent.id);
    });
    return Object.entries(map)
      .map(([label, set]) => ({ label, count: set.size }))
      .sort((a, b) => b.count - a.count);
  }, [links]);

  // ── Parent "first appearance" month — a parent record is created the
  //     moment its first child is admitted, so the earliest linked student's
  //     createdAt IS the parent's real registration moment. ──
  const parentFirstMonth = useMemo(() => {
    const map = new Map(); // parentId -> Date
    links.forEach((l) => {
      if (!l.student || !l.student.createdAt) return;
      const d = new Date(l.student.createdAt);
      if (isNaN(d.getTime())) return;
      const existing = map.get(l.parent.id);
      if (!existing || d < existing) map.set(l.parent.id, d);
    });
    return map;
  }, [links]);

  // ── Analytics 6: Monthly Parent Registration Trend (last 6 months present) ──
  const registrationTrend = useMemo(() => {
    const map = {};
    links.forEach((l) => {
      if (!l.student || !l.student.createdAt) return;
      const d = new Date(l.student.createdAt);
      if (isNaN(d.getTime())) return;
      const key = monthKey(d);
      const label = monthLabel(d);
      if (!map[key]) map[key] = { key, label, newParents: new Set(), additionalLinks: 0 };
      const firstMonth = parentFirstMonth.get(l.parent.id);
      if (firstMonth && monthKey(firstMonth) === key) {
        map[key].newParents.add(l.parent.id);
      } else {
        map[key].additionalLinks += 1;
      }
    });
    const rows = Object.values(map)
      .sort((a, b) => a.key - b.key)
      .slice(-6)
      .map((r) => ({ label: r.label, newParents: r.newParents.size, additionalLinks: r.additionalLinks }));
    return rows;
  }, [links, parentFirstMonth]);

  const growthPct = useMemo(() => {
    if (registrationTrend.length < 2) return null;
    const last = registrationTrend[registrationTrend.length - 1].newParents;
    const prev = registrationTrend[registrationTrend.length - 2].newParents;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }, [registrationTrend]);

  // ── Enterprise Insights ──
  const parentsWithoutStudentLink = useMemo(() => parents.filter((p) => !p.children || p.children.length === 0).length, [parents]);

  const duplicatePhoneGroups = useMemo(() => {
    const map = {};
    parents.forEach((p) => { if (p.phone) { map[p.phone] = (map[p.phone] || 0) + 1; } });
    return Object.values(map).filter((c) => c > 1).length;
  }, [parents]);

  const duplicateEmailGroups = useMemo(() => {
    const map = {};
    parents.forEach((p) => { if (p.email) { map[p.email] = (map[p.email] || 0) + 1; } });
    return Object.values(map).filter((c) => c > 1).length;
  }, [parents]);

  const recentlyAddedParents = useMemo(() => {
    return [...parentFirstMonth.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([parentId, date]) => ({ parent: parents.find((p) => p.id === parentId), date }))
      .filter((r) => r.parent);
  }, [parentFirstMonth, parents]);

  const recentlyLinkedStudents = useMemo(() => {
    return [...students]
      .filter((s) => s.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [students]);

  const mostRepresentedClass = classDistribution[0] || null;
  const leastRepresentedClass = classDistribution.length > 0 ? classDistribution[classDistribution.length - 1] : null;

  // ── Dynamic filter option lists — derived from live records ──
  const classOptions = useMemo(() =>
    [...new Set(links.filter((l) => l.student).map((l) => l.student.studentClass))]
      .sort((a, b) => (isNaN(a) || isNaN(b) ? String(a).localeCompare(String(b)) : Number(a) - Number(b))),
    [links]
  );
  const sectionOptions = useMemo(() =>
    [...new Set(links.filter((l) => l.student).map((l) => l.student.section))].sort(),
    [links]
  );
  const relationshipOptions = useMemo(() =>
    [...new Set(parents.map((p) => p.relationship).filter(Boolean))].sort(),
    [parents]
  );

  // ── Filtered + sorted + paginated table rows ──
  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return links.filter((l) => {
      if (filterClass !== "all" && (!l.student || l.student.studentClass !== filterClass)) return false;
      if (filterSection !== "all" && (!l.student || l.student.section !== filterSection)) return false;
      if (filterRelationship !== "all" && l.parent.relationship !== filterRelationship) return false;
      if (filterStatus === "active" && !l.parent.active) return false;
      if (filterStatus === "inactive" && l.parent.active) return false;
      if (filterLinked === "linked" && !l.student) return false;
      if (filterLinked === "unlinked" && l.student) return false;

      if ((dateFrom || dateTo) && l.student?.createdAt) {
        const d = new Date(l.student.createdAt);
        if (dateFrom && d < new Date(dateFrom)) return false;
        if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      } else if (dateFrom || dateTo) {
        return false; // no linked-date to compare against a date filter
      }

      if (!q) return true;
      return [l.parent.id, l.parent.name, l.childName, l.student?.studentId, l.parent.phone, l.parent.email]
        .some((f) => f && String(f).toLowerCase().includes(q));
    });
  }, [links, search, filterClass, filterSection, filterRelationship, filterStatus, filterLinked, dateFrom, dateTo]);

  const sortedLinks = useMemo(() => {
    const arr = [...filteredLinks];
    arr.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "linkedDate":
          av = a.student?.createdAt ? new Date(a.student.createdAt).getTime() : 0;
          bv = b.student?.createdAt ? new Date(b.student.createdAt).getTime() : 0;
          break;
        case "studentClass":
          av = a.student?.studentClass ?? ""; bv = b.student?.studentClass ?? ""; break;
        case "section":
          av = a.student?.section ?? ""; bv = b.student?.section ?? ""; break;
        case "studentName":
          av = (a.childName ?? "").toLowerCase(); bv = (b.childName ?? "").toLowerCase(); break;
        case "studentId":
          av = (a.student?.studentId ?? "").toLowerCase(); bv = (b.student?.studentId ?? "").toLowerCase(); break;
        case "status":
          av = a.parent.active ? 1 : 0; bv = b.parent.active ? 1 : 0; break;
        default:
          av = String(a.parent[sortKey] ?? "").toLowerCase();
          bv = String(b.parent[sortKey] ?? "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filteredLinks, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedLinks.length / RECORDS_PER_PAGE));
  const paged = sortedLinks.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const withPageReset = (setter) => (v) => { setter(v); setPage(1); };
  const handleSearch = withPageReset(setSearch);
  const handleFilterClass = withPageReset(setFilterClass);
  const handleFilterSection = withPageReset(setFilterSection);
  const handleFilterRelationship = withPageReset(setFilterRelationship);
  const handleFilterStatus = withPageReset(setFilterStatus);
  const handleFilterLinked = withPageReset(setFilterLinked);
  const handleDateFrom = withPageReset(setDateFrom);
  const handleDateTo = withPageReset(setDateTo);

  // ── Export — always the full filtered + sorted dataset (`sortedLinks`),
  //     never just the current page and never the raw unfiltered ERPContext data ──
  const buildExportRows = useCallback(() => sortedLinks.map((l) => [
    l.parent.id ?? "",
    l.parent.name ?? "",
    l.childName || l.student?.name || "Unlinked",
    l.student ? l.student.studentId : "—",
    l.student?.studentClass ?? "—",
    l.student?.section ?? "—",
    l.parent.relationship ?? "—",
    l.parent.phone || "Missing",
    l.parent.email || "Missing",
    fmtDate(l.student?.createdAt),
    l.parent.active ? "Active" : "Inactive",
  ]), [sortedLinks]);

  const handleExportPDF = useCallback(() => {
    exportReportToPDF({
      title: "Parent Report",
      summary: [
        { label: "Total Parents", value: totalParents },
        { label: "Active", value: activeParents },
        { label: "Inactive", value: inactiveParents },
        { label: "Linked Students", value: totalLinkedStudents },
        { label: "Comm. Coverage", value: `${communicationCoverage}%` },
      ],
      columns: EXPORT_COLUMNS,
      rows: buildExportRows(),
      fileName: "Parent_Report",
    });
  }, [buildExportRows, totalParents, activeParents, inactiveParents, totalLinkedStudents, communicationCoverage]);

  const handleExportExcel = useCallback(() => {
    exportReportToExcel({
      sheetName: "Parent Report",
      columns: EXPORT_COLUMNS,
      rows: buildExportRows(),
      fileName: "Parent_Report",
    });
  }, [buildExportRows]);

  return (
    <ReportShell
      eyebrow="Reports"
      title="Parent Report"
      subtitle="Parent ecosystem health, student linkage, and communication readiness — live from Parent &amp; Student Management"
      meta={
        <>
          <div style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 600 }}>{totalParents} total parent{totalParents !== 1 ? "s" : ""}</div>
          <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>{communicationCoverage}% fully reachable</div>
        </>
      }
    >
      {totalParents === 0 ? (
        <EmptyState
          icon="👪"
          title="No Parent Data Yet"
          message="Parent records are created automatically when a student is admitted through Student Management. Engagement, linkage, and communication analytics will appear here as soon as the first parent record exists."
        />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "18px" }}>
            <SummaryCard label="Total Parents" value={totalParents} sub="All registered guardians" accent={PARENT_ACCENT} icon="👪" />
            <SummaryCard label="Active Parent Accounts" value={activeParents} sub={`${totalParents === 0 ? 0 : Math.round((activeParents / totalParents) * 100)}% of total`} accent="#2e7d32" icon="✅" />
            <SummaryCard label="Inactive Parent Accounts" value={inactiveParents} sub={`${totalParents === 0 ? 0 : Math.round((inactiveParents / totalParents) * 100)}% of total`} accent="#e65100" icon="🚫" />
            <SummaryCard label="Total Linked Students" value={totalLinkedStudents} sub="Confirmed phone-matched link" accent="#1e88e5" icon="🔗" />
            <SummaryCard label="Students Without Parent Link" value={studentsWithoutParentLink} sub="Data-quality watchlist" accent={studentsWithoutParentLink > 0 ? "#c62828" : "#9fa5b8"} icon="⚠️" />
            <SummaryCard label="Avg. Children / Parent" value={avgChildrenPerParent.toFixed(1)} sub="Household average" accent="#00838f" icon="👶" />
          </div>

          {/* ── Hero: engagement rings — this report's own visual identity ── */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
            <StatRing pct={communicationCoverage} label="Communication Coverage" sub="Parents reachable by both phone and email" color={PARENT_ACCENT} />
            <StatRing pct={totalParents === 0 ? 0 : Math.round((activeParents / totalParents) * 100)} label="Active Parent Ratio" sub={`${activeParents} of ${totalParents} accounts currently active`} color="#2e7d32" />
            <StatRing pct={students.length === 0 ? 0 : Math.round((totalLinkedStudents / students.length) * 100)} label="Student Link Coverage" sub={`${totalLinkedStudents} of ${students.length} students matched to a parent`} color="#1e88e5" />
          </div>

          {/* ── Analytics Row 1: Child distribution + Parent Status ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Parent ↔ Student Distribution">
              <DistributionBar label="Parents with 1 Child" count={childDistribution.one} total={totalParents} color="#1e88e5" />
              <DistributionBar label="Parents with 2 Children" count={childDistribution.two} total={totalParents} color="#8e24aa" />
              <DistributionBar label="Parents with 3+ Children" count={childDistribution.multiple} total={totalParents} color="#fb8c00" />
            </AnalyticsPanel>

            <AnalyticsPanel title="Parent Status">
              <ProgressBar label="Account Status" active={activeParents} total={totalParents} color="#2e7d32" />
              <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "4px" }}>
                This ERP tracks Active/Inactive only — there is currently no "Pending" parent state in the data model.
              </div>
            </AnalyticsPanel>
          </div>

          {/* ── Analytics Row 2: Communication Health + Class/Section ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Communication Health">
              <DistributionBar label="Email on File" count={commHealth.emailOnFile} total={totalParents} color="#2e7d32" />
              <DistributionBar label="Phone on File" count={commHealth.phoneOnFile} total={totalParents} color="#2e7d32" />
              <DistributionBar label="Missing Email" count={commHealth.missingEmail} total={totalParents} color="#c62828" />
              <DistributionBar label="Missing Phone" count={commHealth.missingPhone} total={totalParents} color="#c62828" />
            </AnalyticsPanel>

            <AnalyticsPanel title="Class-wise Parent Distribution">
              {classDistribution.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#9fa5b8" }}>No linked students yet.</div>
              ) : classDistribution.map((row) => (
                <DistributionBar key={row.label} label={row.label} count={row.count} total={totalParents} color={PARENT_ACCENT} />
              ))}
            </AnalyticsPanel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Section-wise Parent Distribution">
              {sectionDistribution.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#9fa5b8" }}>No linked students yet.</div>
              ) : sectionDistribution.map((row) => (
                <DistributionBar key={row.label} label={row.label} count={row.count} total={totalParents} color="#6a1b9a" />
              ))}
            </AnalyticsPanel>

            <AnalyticsPanel title="Monthly Parent Registration Trend">
              {registrationTrend.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#9fa5b8" }}>No admission dates recorded yet.</div>
              ) : (
                <>
                  {registrationTrend.map((row) => {
                    const maxVal = Math.max(...registrationTrend.map((r) => r.newParents + r.additionalLinks), 1);
                    return (
                      <div key={row.label} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 500 }}>{row.label}</span>
                          <span style={{ fontSize: "11px", color: "#9fa5b8", fontWeight: 700 }}>
                            {row.newParents} new · {row.additionalLinks} additional link{row.additionalLinks !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", height: "7px", borderRadius: "4px", overflow: "hidden", background: "#f0f2f8" }}>
                          <div style={{ width: `${(row.newParents / maxVal) * 100}%`, background: PARENT_ACCENT }} />
                          <div style={{ width: `${(row.additionalLinks / maxVal) * 100}%`, background: "#c5cae9" }} />
                        </div>
                      </div>
                    );
                  })}
                  {growthPct !== null && (
                    <div style={{ fontSize: "11px", fontWeight: 700, color: growthPct >= 0 ? "#2e7d32" : "#c62828", marginTop: "6px" }}>
                      {growthPct >= 0 ? "▲" : "▼"} {Math.abs(growthPct)}% new-parent growth vs. previous month
                    </div>
                  )}
                </>
              )}
            </AnalyticsPanel>
          </div>

          {/* ── Enterprise Insights — exclusive to this report ── */}
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "22px 24px", marginBottom: "18px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: PARENT_ACCENT, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
              Enterprise Insights
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              <InsightTile icon="🎓" label="Students Without Parent Link" value={studentsWithoutParentLink} tone={studentsWithoutParentLink > 0 ? "danger" : "good"} />
              <InsightTile icon="👪" label="Parents Without Student Link" value={parentsWithoutStudentLink} tone={parentsWithoutStudentLink > 0 ? "warn" : "good"} />
              <InsightTile icon="📵" label="Missing Phone Numbers" value={commHealth.missingPhone} tone={commHealth.missingPhone > 0 ? "warn" : "good"} />
              <InsightTile icon="📧" label="Missing Email Addresses" value={commHealth.missingEmail} tone={commHealth.missingEmail > 0 ? "warn" : "good"} />
              <InsightTile icon="🔁" label="Duplicate Phone Numbers" value={duplicatePhoneGroups} tone={duplicatePhoneGroups > 0 ? "danger" : "good"} />
              <InsightTile icon="🔁" label="Duplicate Emails" value={duplicateEmailGroups} tone={duplicateEmailGroups > 0 ? "danger" : "good"} />
              <InsightTile icon="🏆" label="Most Represented Class" value={mostRepresentedClass ? `${mostRepresentedClass.label} (${mostRepresentedClass.count})` : "—"} tone="info" />
              <InsightTile icon="📉" label="Least Represented Class" value={leastRepresentedClass ? `${leastRepresentedClass.label} (${leastRepresentedClass.count})` : "—"} tone="neutral" />
              <InsightTile
                icon="📈"
                label="Parent Growth Trend"
                value={growthPct === null ? "Not enough data" : `${growthPct >= 0 ? "+" : ""}${growthPct}% vs last month`}
                tone={growthPct === null ? "neutral" : growthPct >= 0 ? "good" : "warn"}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginTop: "18px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#7a7f8e", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Recently Added Parents
                </div>
                {recentlyAddedParents.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#9fa5b8" }}>No dated parent records yet.</div>
                ) : recentlyAddedParents.map(({ parent, date }) => (
                  <div key={parent.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f2f8" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a1f36" }}>{parent.name}</span>
                    <span style={{ fontSize: "11px", color: "#9fa5b8" }}>{fmtDate(date)}</span>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#7a7f8e", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Recently Linked Students
                </div>
                {recentlyLinkedStudents.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#9fa5b8" }}>No dated student records yet.</div>
                ) : recentlyLinkedStudents.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f2f8" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a1f36" }}>{s.name} <span style={{ color: "#9fa5b8", fontWeight: 500 }}>· {s.parentName}</span></span>
                    <span style={{ fontSize: "11px", color: "#9fa5b8" }}>{fmtDate(s.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Parent Report Table ── */}
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(46,79,163,.05)" }}>

            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #e8eaf0", background: "#fafbff",
              display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1f36" }}>Parent Report Table</div>
                <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>
                  {sortedLinks.length} record{sortedLinks.length !== 1 ? "s" : ""} matching current filters
                </div>
              </div>
              <FilterSelect label="Class" value={filterClass} onChange={handleFilterClass} options={[["all", "All Classes"], ...classOptions.map((c) => [c, `Class ${c}`])]} />
              <FilterSelect label="Section" value={filterSection} onChange={handleFilterSection} options={[["all", "All Sections"], ...sectionOptions.map((s) => [s, `Section ${s}`])]} />
              <FilterSelect label="Relationship" value={filterRelationship} onChange={handleFilterRelationship} options={[["all", "All Relationships"], ...relationshipOptions.map((r) => [r, r])]} />
              <FilterSelect label="Status" value={filterStatus} onChange={handleFilterStatus} options={[["all", "All Status"], ["active", "Active"], ["inactive", "Inactive"]]} />
              <FilterSelect label="Linked Students" value={filterLinked} onChange={handleFilterLinked} options={[["all", "All"], ["linked", "Linked Only"], ["unlinked", "Unlinked Only"]]} />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#4a4f6a" }}>Linked Date From</label>
                <input type="date" value={dateFrom} onChange={(e) => handleDateFrom(e.target.value)} style={{ padding: "8px 10px", fontSize: "12px", border: "1px solid #d0d4e0", borderRadius: "6px", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#4a4f6a" }}>Linked Date To</label>
                <input type="date" value={dateTo} onChange={(e) => handleDateTo(e.target.value)} style={{ padding: "8px 10px", fontSize: "12px", border: "1px solid #d0d4e0", borderRadius: "6px", fontFamily: "inherit" }} />
              </div>
              <SearchBox value={search} onChange={handleSearch} placeholder="Search parent, student, ID, phone, email…" />
              <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={sortedLinks.length === 0} />
            </div>

            {paged.length === 0 ? (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#4a4f6a" }}>No Matching Records</div>
                <div style={{ fontSize: "12px", color: "#9fa5b8", marginTop: "4px" }}>Try adjusting the search term or filters above.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <SortableTh label="Parent ID" sortKey="id" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Parent Name" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Student Name" sortKey="studentName" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Student ID" sortKey="studentId" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Class" sortKey="studentClass" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Section" sortKey="section" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Relationship" sortKey="relationship" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Email</th>
                      <SortableTh label="Linked Date" sortKey="linkedDate" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Status" sortKey="status" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((l, i) => (
                      <tr key={`${l.parent.id}-${l.student?.id || l.childName || i}`}>
                        <td style={tdStyle}><IdChip value={l.parent.id} bg="#fce4ec" color={PARENT_ACCENT} /></td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{l.parent.name}</td>
                        <td style={tdStyle}>{l.childName || l.student?.name || <span style={{ color: "#c62828" }}>Unlinked</span>}</td>
                        <td style={tdStyle}>{l.student ? <IdChip value={l.student.studentId} /> : "—"}</td>
                        <td style={tdStyle}>{l.student?.studentClass || "—"}</td>
                        <td style={tdStyle}>{l.student?.section || "—"}</td>
                        <td style={tdStyle}>{l.parent.relationship || "—"}</td>
                        <td style={tdStyle}>{l.parent.phone || <span style={{ color: "#c62828" }}>Missing</span>}</td>
                        <td style={{ ...tdStyle, color: l.parent.email ? "#2e4fa3" : "#c62828" }}>{l.parent.email || "Missing"}</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{fmtDate(l.student?.createdAt)}</td>
                        <td style={tdStyle}><StatusBadge active={!!l.parent.active} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              totalRecords={sortedLinks.length}
              perPage={RECORDS_PER_PAGE}
              onPageChange={setPage}
              noun="record"
            />
          </div>
        </>
      )}

      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#b0b4c4", fontWeight: 500 }}>
        School ERP · Reports Module · Parent Report · All statistics are live from the ERP data layer
      </div>
    </ReportShell>
  );
}
