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

// Columns for the Teacher Report table — shared verbatim between the on-screen
// table, the PDF export, and the Excel export so all three always match.
const EXPORT_COLUMNS = [
  "Teacher ID", "Teacher Name", "Subject", "Qualification", "Experience",
  "Joining Date", "Phone", "Email", "Status",
];

// Experience buckets are a display/categorization choice, not ERP data —
// every count inside each bucket is still computed live from `teachers`.
const EXPERIENCE_BUCKETS = [
  { label: "0–2 yrs",  min: 0,  max: 2 },
  { label: "3–5 yrs",  min: 3,  max: 5 },
  { label: "6–10 yrs", min: 6,  max: 10 },
  { label: "10+ yrs",  min: 11, max: Infinity },
];

export default function TeacherReport() {
  const { teachers } = useERP();

  // ── Local UI state — filters/sort/search/pagination affect ONLY this report ──
  const [search, setSearch]           = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey]         = useState("joiningDate");
  const [sortDir, setSortDir]         = useState("desc");
  const [page, setPage]               = useState(1);

  // ── Dynamic filter option list — derived from live records, never hardcoded ──
  const subjectOptions = useMemo(() =>
    [...new Set(teachers.map((t) => t.subject).filter(Boolean))].sort(),
    [teachers]
  );

  const getExp = (t) => Number(t.totalExp) || 0;

  // ── Summary Cards ──
  const totalTeachers = teachers.length;
  const activeTeachers = useMemo(() => teachers.filter((t) => t.active).length, [teachers]);
  const inactiveTeachers = totalTeachers - activeTeachers;
  const totalSubjects = useMemo(() => new Set(teachers.map((t) => t.subject).filter(Boolean)).size, [teachers]);
  const avgExperience = useMemo(() => {
    if (teachers.length === 0) return 0;
    const sum = teachers.reduce((acc, t) => acc + getExp(t), 0);
    return sum / teachers.length;
  }, [teachers]);

  // ── Analytics: Teachers by Subject ──
  const teachersBySubject = useMemo(() => {
    const map = {};
    teachers.forEach((t) => {
      const label = t.subject || "Unassigned";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [teachers]);

  // ── Analytics: Experience Distribution ──
  const experienceDistribution = useMemo(() => {
    return EXPERIENCE_BUCKETS.map((bucket) => ({
      label: bucket.label,
      count: teachers.filter((t) => { const e = getExp(t); return e >= bucket.min && e <= bucket.max; }).length,
    }));
  }, [teachers]);

  // ── Filtered + sorted + paginated table data ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      if (filterSubject !== "all" && t.subject !== filterSubject) return false;
      if (filterStatus === "active" && !t.active) return false;
      if (filterStatus === "inactive" && t.active) return false;
      if (!q) return true;
      return [t.id, t.name, t.subject, t.qualification, t.phone, t.email]
        .some((f) => f && String(f).toLowerCase().includes(q));
    });
  }, [teachers, search, filterSubject, filterStatus]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av, bv;
      if (sortKey === "joiningDate") {
        av = a.joiningDate ? new Date(a.joiningDate).getTime() : 0;
        bv = b.joiningDate ? new Date(b.joiningDate).getTime() : 0;
      } else if (sortKey === "totalExp") {
        av = getExp(a); bv = getExp(b);
      } else if (sortKey === "active") {
        av = a.active ? 1 : 0; bv = b.active ? 1 : 0;
      } else {
        av = String(a[sortKey] ?? "").toLowerCase();
        bv = String(b[sortKey] ?? "").toLowerCase();
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
  const handleFilterSubject = (v) => { setFilterSubject(v); setPage(1); };
  const handleFilterStatus = (v) => { setFilterStatus(v); setPage(1); };

  // ── Export — always the full filtered + sorted dataset (`sorted`), never
  //     just the current page and never the raw unfiltered ERPContext data ──
  const buildExportRows = useCallback(() => sorted.map((t) => [
    t.id ?? "",
    t.name ?? "",
    t.subject ?? "",
    t.qualification ?? "",
    `${getExp(t)} yrs`,
    t.joiningDate ? new Date(t.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    t.phone ?? "",
    t.email ?? "",
    t.active ? "Active" : "Inactive",
  ]), [sorted]);

  const handleExportPDF = useCallback(() => {
    exportReportToPDF({
      title: "Teacher Report",
      summary: [
        { label: "Total Teachers", value: totalTeachers },
        { label: "Active", value: activeTeachers },
        { label: "Inactive", value: inactiveTeachers },
        { label: "Subjects Covered", value: totalSubjects },
        { label: "Avg. Experience", value: `${avgExperience.toFixed(1)} yrs` },
      ],
      columns: EXPORT_COLUMNS,
      rows: buildExportRows(),
      fileName: "Teacher_Report",
    });
  }, [buildExportRows, totalTeachers, activeTeachers, inactiveTeachers, totalSubjects, avgExperience]);

  const handleExportExcel = useCallback(() => {
    exportReportToExcel({
      sheetName: "Teacher Report",
      columns: EXPORT_COLUMNS,
      rows: buildExportRows(),
      fileName: "Teacher_Report",
    });
  }, [buildExportRows]);

  return (
    <ReportShell
      eyebrow="Reports"
      title="Teacher Report"
      subtitle="Staffing, subject coverage, and experience analytics — live from Teacher Management"
      meta={
        <>
          <div style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 600 }}>{totalTeachers} total teacher{totalTeachers !== 1 ? "s" : ""}</div>
          <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>{totalSubjects} subject{totalSubjects !== 1 ? "s" : ""} covered</div>
        </>
      }
    >
      {totalTeachers === 0 ? (
        <EmptyState
          icon="👨‍🏫"
          title="No Teacher Data Yet"
          message="Add teachers through Teacher Management to see staffing KPIs, subject/experience analytics, and the full teacher report appear here automatically."
        />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
            <SummaryCard label="Total Teachers" value={totalTeachers} sub="All registered staff" accent="#8e24aa" icon="👨‍🏫" />
            <SummaryCard label="Active Teachers" value={activeTeachers} sub={`${totalTeachers === 0 ? 0 : Math.round((activeTeachers / totalTeachers) * 100)}% of total`} accent="#2e7d32" icon="✅" />
            <SummaryCard label="Inactive Teachers" value={inactiveTeachers} sub={`${totalTeachers === 0 ? 0 : Math.round((inactiveTeachers / totalTeachers) * 100)}% of total`} accent="#e65100" icon="🚫" />
            <SummaryCard label="Total Subjects" value={totalSubjects} sub="Distinct subjects taught" accent="#1e88e5" icon="📚" />
            <SummaryCard label="Avg. Experience" value={`${avgExperience.toFixed(1)} yrs`} sub="Across all teachers" accent="#00838f" icon="📈" />
          </div>

          {/* ── Analytics Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Teachers by Subject">
              {teachersBySubject.map((row) => (
                <DistributionBar key={row.label} label={row.label} count={row.count} total={totalTeachers} color="#8e24aa" />
              ))}
            </AnalyticsPanel>

            <AnalyticsPanel title="Teachers by Status">
              <ProgressBar label="Staffing Status" active={activeTeachers} total={totalTeachers} color="#2e7d32" />
            </AnalyticsPanel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <AnalyticsPanel title="Experience Distribution">
              {experienceDistribution.map((row) => (
                <DistributionBar key={row.label} label={row.label} count={row.count} total={totalTeachers} color="#fb8c00" />
              ))}
            </AnalyticsPanel>
          </div>

          {/* ── Teacher Report Table ── */}
          <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(46,79,163,.05)" }}>

            {/* Filter / search bar */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #e8eaf0", background: "#fafbff",
              display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a1f36" }}>Teacher Report Table</div>
                <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "2px" }}>
                  {sorted.length} record{sorted.length !== 1 ? "s" : ""} matching current filters
                </div>
              </div>
              <FilterSelect label="Subject" value={filterSubject} onChange={handleFilterSubject} options={[["all", "All Subjects"], ...subjectOptions.map((s) => [s, s])]} />
              <FilterSelect label="Status" value={filterStatus} onChange={handleFilterStatus} options={[["all", "All Status"], ["active", "Active"], ["inactive", "Inactive"]]} />
              <SearchBox value={search} onChange={handleSearch} placeholder="Search by ID, name, subject, phone, email…" />
              <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={sorted.length === 0} />
            </div>

            {/* Table */}
            {paged.length === 0 ? (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#4a4f6a" }}>No Matching Teachers</div>
                <div style={{ fontSize: "12px", color: "#9fa5b8", marginTop: "4px" }}>Try adjusting the search term or filters above.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <SortableTh label="Teacher ID" sortKey="id" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Teacher Name" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Subject" sortKey="subject" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Qualification" sortKey="qualification" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Experience" sortKey="totalExp" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <SortableTh label="Joining Date" sortKey="joiningDate" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Email</th>
                      <SortableTh label="Status" sortKey="active" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((t) => (
                      <tr key={t.id}>
                        <td style={tdStyle}><IdChip value={t.id} bg="#e8eaf6" color="#3949ab" /></td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{t.name}</td>
                        <td style={tdStyle}>{t.subject}</td>
                        <td style={tdStyle}>{t.qualification}</td>
                        <td style={tdStyle}>{getExp(t)} yrs</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {t.joiningDate ? new Date(t.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={tdStyle}>{t.phone}</td>
                        <td style={{ ...tdStyle, color: "#2e4fa3" }}>{t.email}</td>
                        <td style={tdStyle}><StatusBadge active={!!t.active} /></td>
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
              noun="teacher"
            />
          </div>
        </>
      )}

      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "#b0b4c4", fontWeight: 500 }}>
        School ERP · Reports Module · Teacher Report · All statistics are live from the ERP data layer
      </div>
    </ReportShell>
  );
}
