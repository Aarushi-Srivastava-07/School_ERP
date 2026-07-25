export const PAGE_BG = "#f4f5fb";
export const ACCENT = "#2e4fa3";

export const REPORT_STYLE_TAG = `
  tbody tr:hover td { background: #fafbff; }
  ::-webkit-scrollbar { height: 5px; width: 5px; }
  ::-webkit-scrollbar-thumb { background: #c5cae9; border-radius: 4px; }
  input:focus, select:focus { outline: none; border-color: #2e4fa3 !important; box-shadow: 0 0 0 3px rgba(46,79,163,.1); }
`;

export const thStyle = {
  padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700,
  color: "#7a7f8e", textTransform: "uppercase", letterSpacing: "0.6px",
  background: "#f7f8fc", borderBottom: "2px solid #e8eaf0", whiteSpace: "nowrap",
};

export const tdStyle = {
  padding: "12px 16px", fontSize: "13px", color: "#1a1f36",
  borderBottom: "1px solid #f0f2f8", verticalAlign: "middle",
};

// ─── Page Shell (header bar + max-width container, identical to AdminDashboard) ─
export function ReportShell({ eyebrow, title, subtitle, meta, children }) {
  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{REPORT_STYLE_TAG}</style>

      <div style={{ background: "#fff", borderBottom: "1px solid #e8eaf0" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            {eyebrow && (
              <div style={{ fontSize: "10px", fontWeight: 700, color: ACCENT, letterSpacing: "0.8px", textTransform: "uppercase" }}>{eyebrow}</div>
            )}
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-0.3px" }}>{title}</div>
            <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "1px", fontWeight: 500 }}>{subtitle}</div>
          </div>
          {meta && <div style={{ textAlign: "right" }}>{meta}</div>}
        </div>
      </div>

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "28px 32px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Summary Card (identical to AdminDashboard.jsx's SummaryCard) ────────────
export function SummaryCard({ label, value, sub, accent, icon }) {
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
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#1a1f36", letterSpacing: "-1px", marginTop: "6px", lineHeight: 1 }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div style={{ fontSize: "11px", color: "#9fa5b8", marginTop: "6px", fontWeight: 500 }}>{sub}</div>
        </div>
        <div style={{ fontSize: "26px", opacity: 0.18, userSelect: "none" }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Active/Inactive Progress Bar (identical to AdminDashboard.jsx's ProgressBar) ─
export function ProgressBar({ label, active, total, color }) {
  const pct = total === 0 ? 0 : Math.round((active / total) * 100);
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

// ─── Generic Distribution Bar row — used for "by Class", "by Subject", etc. ──
export function DistributionBar({ label, count, total, color }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "12px", color: "#4a4f6a", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "11px", color: "#9fa5b8", fontWeight: 700 }}>{count} · {pct}%</span>
      </div>
      <div style={{ height: "6px", background: "#f0f2f8", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Status Badge — colors match the "Active"/"Restored" vs "Deactivated" tones already used across the ERP ─
export function StatusBadge({ active, activeText = "Active", inactiveText = "Inactive" }) {
  return (
    <span style={{
      background: active ? "#e8f5e9" : "#ffebee",
      color: active ? "#2e7d32" : "#c62828",
      padding: "3px 10px", borderRadius: "12px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.2px", whiteSpace: "nowrap",
    }}>
      {active ? `✓ ${activeText}` : `⏸ ${inactiveText}`}
    </span>
  );
}

// ─── Analytics Panel wrapper (matches the white bordered card used throughout) ─
export function AnalyticsPanel({ title, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "18px" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Search Box (matches AdminDashboard's Recent Activities search input) ────
export function SearchBox({ value, onChange, placeholder, width = "320px" }) {
  return (
    <div style={{ position: "relative", width, maxWidth: "100%" }}>
      <span style={{
        position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)",
        color: "#9fa5b8", fontSize: "15px", pointerEvents: "none",
      }}>⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 12px 8px 30px", fontSize: "13px",
          border: "1px solid #d0d4e0", borderRadius: "6px", background: "#fff",
          color: "#1a1f36", fontFamily: "inherit", boxSizing: "border-box",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#9fa5b8", fontSize: "14px",
          }}
        >✕</button>
      )}
    </div>
  );
}

// ─── Filter Select (matches the Analytics Dashboard's filter dropdown style) ─
export function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "150px" }}>
      <label style={{ fontSize: "11px", fontWeight: 600, color: "#4a4f6a", letterSpacing: "0.3px" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px", fontSize: "12px", color: "#1a1f36",
          border: "1px solid #d0d4e0", borderRadius: "6px", background: "#fff",
          fontFamily: "inherit", outline: "none", cursor: "pointer",
        }}
      >
        {options.map(([val, optLabel]) => <option key={val} value={val}>{optLabel}</option>)}
      </select>
    </div>
  );
}

// ─── Sortable Table Header Cell ───────────────────────────────────────────────
export function SortableTh({ label, sortKey, activeKey, direction, onSort }) {
  const isActive = sortKey === activeKey;
  return (
    <th
      style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
      onClick={() => onSort(sortKey)}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        {label}
        <span style={{ fontSize: "9px", color: isActive ? ACCENT : "#c0c4d0" }}>
          {isActive ? (direction === "asc" ? "▲" : "▼") : "▲▼"}
        </span>
      </span>
    </th>
  );
}

// ─── Pagination Bar (same behavior/style as AdminDashboard.jsx's PaginationBar) ─
export function PaginationBar({ currentPage, totalPages, totalRecords, perPage, onPageChange, noun = "record" }) {
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
        background: isActive ? ACCENT : disabled ? "#f7f8fc" : "#fff",
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
          ? `No ${noun}s found`
          : `Showing ${start}–${end} of ${totalRecords} ${noun}${totalRecords !== 1 ? "s" : ""}`}
      </span>
      <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
        {pageBtn(currentPage - 1, "← Prev", currentPage === 1, false)}
        {pages.map((p) => pageBtn(p, null, false, p === currentPage))}
        {pageBtn(currentPage + 1, "Next →", currentPage === totalPages || totalPages === 0, false)}
      </div>
    </div>
  );
}

// ─── Empty State (matches the dashed empty-state card used in Parent/Analytics Dashboards) ─
export function EmptyState({ icon = "📋", title, message }) {
  return (
    <div style={{
      background: "#fff", border: "1px dashed #d0d4e0", borderRadius: "10px",
      padding: "48px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: "34px", opacity: 0.35, marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#4a4f6a" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#9fa5b8", marginTop: "6px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
        {message}
      </div>
    </div>
  );
}

// ─── Export Buttons (PDF / Excel) — sits beside the existing filter controls.
//     Matches FilterSelect's label+control column so it lines up in the same
//     flex-end filter bar without any layout changes to existing reports. ──
const EXCEL_GREEN = "#1e7145";

function exportButtonStyle(color) {
  return {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", fontSize: "12px", fontWeight: 700,
    border: `1px solid ${color}`, borderRadius: "6px",
    background: "#fff", color, cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap", height: "34px",
  };
}

export function ExportButtons({ onExportPDF, onExportExcel, disabled = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "11px", fontWeight: 600, color: "transparent", userSelect: "none" }}>Export</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={onExportPDF}
          disabled={disabled}
          style={{ ...exportButtonStyle(ACCENT), opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
          title="Export the currently filtered data as a PDF"
        >
          📄 Export PDF
        </button>
        <button
          type="button"
          onClick={onExportExcel}
          disabled={disabled}
          style={{ ...exportButtonStyle(EXCEL_GREEN), opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
          title="Export the currently filtered data as an Excel workbook"
        >
          📊 Export Excel
        </button>
      </div>
    </div>
  );
}

// ─── Small monospace ID chip (matches the ID styling used in every table across the ERP) ─
export function IdChip({ value, bg = "#e8eaf6", color = "#2e4fa3" }) {
  return (
    <span style={{
      fontFamily: "monospace", fontWeight: 700, fontSize: "12px",
      background: bg, color, padding: "3px 8px", borderRadius: "4px",
    }}>{value}</span>
  );
}
