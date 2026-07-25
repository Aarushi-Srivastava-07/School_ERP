// Shared primitives for the Parent Portal — mirrors the visual language
// already used across the ERP.

export const ACCENT = "#1565c0";

export function ParentSection({ title, subtitle, children }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "#1a1f36",
            letterSpacing: "-0.3px",
            margin: 0,
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              fontSize: "12px",
              color: "#9fa5b8",
              fontWeight: 500,
              margin: "4px 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

export function CardGrid({ children, minWidth = "220px" }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth},1fr))`,
        gap: "16px",
      }}
    >
      {children}
    </div>
  );
}

export function ParentCard({ children, accent = ACCENT }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8eaf0",
        borderRadius: "10px",
        padding: "22px 24px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        borderTop: `4px solid ${accent}`,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ icon, title, accent = ACCENT }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: `${accent}14`,
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <h3
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#1a1f36",
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  compact = false,
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: compact ? "18px 8px 6px" : "32px 16px",
        color: "#9fa5b8",
      }}
    >
      <div
        style={{
          fontSize: compact ? "22px" : "30px",
          marginBottom: "8px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: compact ? "12px" : "13.5px",
          fontWeight: 700,
          color: "#5a5f72",
        }}
      >
        {title}
      </div>

      {message && (
        <div
          style={{
            fontSize: compact ? "10.5px" : "12px",
            marginTop: "4px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  Active: {
    bg: "#e8f5e9",
    fg: "#2e7d32",
  },
  Inactive: {
    bg: "#fff3e0",
    fg: "#ef6c00",
  },
  Alumni: {
    bg: "#eceff1",
    fg: "#546e7a",
  },
};

export function StatusBadge({ status }) {
  const s =
    STATUS_STYLES[status] || {
      bg: "#f0f2f8",
      fg: "#9fa5b8",
    };

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        color: s.fg,
        background: s.bg,
        padding: "3px 10px",
        borderRadius: "12px",
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
      }}
    >
      {status || "Unknown"}
    </span>
  );
}