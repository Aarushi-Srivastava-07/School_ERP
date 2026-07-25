import { useState, useMemo, useCallback } from "react";
import { useERP } from "../ERPContext.jsx";
import {
  ReportShell, SummaryCard, ProgressBar, DistributionBar, AnalyticsPanel,
  StatusBadge, SearchBox, FilterSelect, SortableTh, PaginationBar, EmptyState,
  IdChip, ExportButtons, thStyle, tdStyle,
} from "./reportShared.jsx";
import { exportReportToPDF } from "../../utils/exportPDF.js";
import { exportReportToExcel } from "../../utils/exportExcel.js";

const RECORDS_PER_PAGE = 8;

// Columns for the Student Report table — shared verbatim between the on-screen
// table, the PDF export, and the Excel export so all three always match.
const EXPORT_COLUMNS = [
  "Student ID", "Student Name", "Parent Name", "Class", "Section",
  "Phone", "Email", "Admission Date", "Status",
];

export default function StudentReport() {
  const { students } = useERP();

  // ── Local UI state — filters/sort/search/pagination affect ONLY this report ──
  const [search, setSearch]             = useState("");
  const [filterClass, setFilterClass]   = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey]           = useState("admissionDate");
  const [sortDir, setSortDir]           = useState("desc");
  const [page, setPage]                 = useState(1);

  // ── Dynamic filter option lists — derived from live records, never hardcoded ──
  const classOptions = useMemo(() =>
    [...new Set(students.map((s) => s.studentClass).filter(Boolean))]
      .sort((a, b) => (isNaN(a) || isNaN(b) ? String(a).localeCompare(String(b)) : Number(a) - Number(b))),
    [students]
  );
  const sectionOptions = useMemo(() =>
    [...new Set(students.map((s) => s.section).filter(Boolean))].sort(),
    [students]
  );

  // ── Summary Cards ──
  const totalStudents = students.length;
  const activeStudents = useMemo(() => students.filter((s) => s.status === "Active").length, [students]);
  const inactiveStudents = totalStudents - activeStudents;
  const newAdmissions = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return students.filter((s) => {
      if (!s.admissionDate) return false;
      const admission = new Date(s.admissionDate);
      if (isNaN(admission.getTime())) return false;
      const admissionMidnight = new Date(admission.getFullYear(), admission.getMonth(), admission.getDate());
      const diffDays = Math.round((todayMidnight - admissionMidnight) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;
  }, [students]);

  // ── Analytics: Students by Class ──
  const studentsByClass = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      const label = s.studentClass ? `Class ${s.studentClass}` : "Unassigned";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [students]);

  // ── Analytics: Students by Section ──
  const studentsBySection = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      const label = s.section ? `Section ${s.section}` : "Unassigned";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [students]);

  // ── Analytics: Admission Overview — admissions per month, last 6 months present in data ──
  const admissionOverview = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      if (!s.admissionDate) return;
      const d = new Date(s.admissionDate);
      if (isNaN(d.getTime())) return;
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      const sortKey = d.getFullYear() * 12 + d.getMonth();
      if (!map[label]) map[label] = { label, count: 0, sortKey };
      map[label].count += 1;
    });
    return Object.values(map).sort((a, b) => a.sortKey - b.sortKey).slice(-6);
  }, [students]);

  // ── Filtered + sorted + paginated table data ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (filterClass !== "all" && s.studentClass !== filterClass) return false;
      if (filterSection !== "all" && s.section !== filterSection) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (!q) return true;
      return [s.studentId, s.name, s.parentName, s.studentClass, s.section, s.phone, s.email]
        .some((f) => f && String(f).toLowerCase().includes(q));
    });
  }, [students, search, filterClass, filterSection, filterStatus]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "admissionDate") {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      } else {
        av = String(av ?? "").toLowerCase();
        bv = String(bv ?? "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / RECORDS_PER_PAGE));
  const paged = sorted.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };
  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleFilterClass = (v) => { setFilterClass(v); setPage(1); };
  const handleFilterSection = (v) => { setFilterSection(v); setPage(1); };
  const handleFilterStatus = (v) => { setFilterStatus(v); setPage(1); };

  // ── Export — always the full filtered + sorted dataset (`sorted`), never
  //     just the current page and never the raw unfiltered ERPContext data ──
  const buildExportRows = useCallback(() => sorted.map((s) => [
    s.studentId ?? "",
    s.name ?? "",
    s.parentName ?? "",
    s.studentClass ?? "",
    s.section ?? "",
    s.phone ?? "",
    s.email ?? "",
    s.admissionDate ? new Date(s.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    s.status ?? "",
  ]), [sorted]);

  const handleExportPDF = useCallback(() => {
    exportReportToPDF({
      title: "Student Report",
      summary: [
        { label: "Total Students", value: totalStudents },
        { label: "Active", value: activeStudents },
        { label: "Inactive", value: inactiveStudents },
        { label: "New Admissions (30d)", value: newAdmissions },
      ],
      columns: EXPORT_COLUMNS,
      rows: buildExportRows(),
      fileName: "Student_Report",
    });
  }, [buildExportRows, totalStudents, activeStudents, inactiveStudents, newAdmissions]);

  const handleExportExcel = useCallback(() => {
    exportReportToExcel({
      sheetName: "Student Report",
      columns: EXPORT_COLUMNS,
      rows: buildExportRows(),
      fileName: "Student_Report",
    });
  }, [buildExportRows]);

  return (
    <ReportShell
      eyebrow="Reports"
      title="Student Report"
      subtitle="Enrollment, admissions, and class-wise analytics — live from Student Management"
      meta={
        <>
          <div style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 600 }}>{totalStudents} total student{totalStudents !== 1 ? "s" : ""}</div>
          <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>{newAdmissions} admitted in the last 30 days</div>
        </>
      }
    >
      {totalStudents === 0 ? (
        <EmptyState
          icon="🎓"
          title="No Student Data Yet"
          message="Add students through Student Management to see enrollment KPIs, class/section analytics, and the full student report appear here automatically."
        />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
            <SummaryCard label="Total Students" value={totalStudents} sub="All enrolled records" accent="#1e88e5" icon="🎓" />
            <SummaryCard label="Active Students" value={activeStudents} sub={`${totalStudents === 0 ? 0 : Math.round((activeStudents / totalStudents) * 100)}% of total`} accent="#2e7d32" icon="✅" />
            <SummaryCard label="Inactive Students" value={inactiveStudents} sub={`${totalStudents === 0 ? 0 : Math.round((inactiveStudents / totalStudents) * 100)}% of total`} accent="#e65100" icon="🚫" />
            <SummaryCard label="New Admissions" value={newAdmissions} sub="Last 30 days" accent="#6a1b9a" icon="🆕" />
          </div>

          {/* ── Analytics Row 1 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Students by Class">
              {studentsByClass.map((row) => (
                <DistributionBar key={row.label} label={row.label} count={row.count} total={totalStudents} color="#1e88e5" />
              ))}
            </AnalyticsPanel>

            <AnalyticsPanel title="Students by Section">
              {studentsBySection.map((row) => (
                <DistributionBar key={row.label} label={row.label} count={row.count} total={totalStudents} color="#8e24aa" />
              ))}
            </AnalyticsPanel>
          </div>

          {/* ── Analytics Row 2 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Students by Status">
              <ProgressBar label="Enrollment Status" active={activeStudents} total={totalStudents} color="#2e7d32" />
            </AnalyticsPanel>

            <AnalyticsPanel title="Admission Overview · Last 6 Months">
              {admissionOverview.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#9fa5b8" }}>No admission dates recorded yet.</div>
              ) : (
                admissionOverview.map((row) => {
                  const maxCount = Math.max(...admissionOverview.map((r) => r.count));
                  return <DistributionBar key={row.label} label={row.label} count={row.count} total={maxCount} color="#fb8c00" />;
                })
              )}
            </AnalyticsPanel>
          </div>

          {/* ── Student Report Table ── */}
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(46,79,163,.05)" }}>

            {/* Filter / search bar */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #e8eaf0", background: "#fafbff",
              display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1f36" }}>Student Report Table</div>
                <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>
                  {sorted.length} record{sorted.length !== 1 ? "s" : ""} matching current filters
                </div>
              </div>
              <FilterSelect label="Class" value={filterClass} onChange={handleFilterClass} options={[["all", "All Classes"], ...classOptions.map((c) => [c, `Class ${c}`])]} />
              <FilterSelect label="Section" value={filterSection} onChange={handleFilterSection} options={[["all", "All Sections"], ...sectionOptions.map((s) => [s, `Section ${s}`])]} />
              <FilterSelect label="Status" value={filterStatus} onChange={handleFilterStatus} options={[["all", "All Status"], ["Active", "Active"], ["Inactive", "Inactive"]]} />
              <SearchBox value={search} onChange={handleSearch} placeholder="Search by ID, name, parent, phone, email…" />
              <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={sorted.length === 0} />
            </div>

            {/* Table */}
            {paged.length === 0 ? (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#4a4f6a" }}>No Matching Students</div>
                <div style={{ fontSize: "12px", color: "#9fa5b8", marginTop: "4px" }}>Try adjusting the search term or filters above.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <SortableTh label="Student ID" sortKey="studentId" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Student Name" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Parent Name" sortKey="parentName" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Class" sortKey="studentClass" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Section" sortKey="section" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Email</th>
                      <SortableTh label="Admission Date" sortKey="admissionDate" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Status" sortKey="status" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr key={s.id}>
                        <td style={tdStyle}><IdChip value={s.studentId} /></td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                        <td style={tdStyle}>{s.parentName}</td>
                        <td style={tdStyle}>{s.studentClass}</td>
                        <td style={tdStyle}>{s.section}</td>
                        <td style={tdStyle}>{s.phone}</td>
                        <td style={{ ...tdStyle, color: "#2e4fa3" }}>{s.email}</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {s.admissionDate ? new Date(s.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={tdStyle}><StatusBadge active={s.status === "Active"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              totalRecords={sorted.length}
              perPage={RECORDS_PER_PAGE}
              onPageChange={setPage}
              noun="student"
            />
          </div>
        </>
      )}

      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#b0b4c4", fontWeight: 500 }}>
        School ERP · Reports Module · Student Report · All statistics are live from the ERP data layer
      </div>
    </ReportShell>
  );
}
