import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserRound,
  Menu,
  X,
  School,
} from "lucide-react";
import "./Sidebar.css";

// Single source of truth for nav items.
// Add a new module by adding one entry here — Sidebar and routing stay in sync.
const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Students", path: "/students", icon: GraduationCap },
  { label: "Teachers", path: "/teachers", icon: Users },
  { label: "Parents", path: "/parents", icon: UserRound },
];

function Sidebar() {
  // Controls the slide-in drawer on small screens. Desktop sidebar is always visible.
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile top bar trigger — only rendered visually on small screens via CSS */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop closes the drawer when tapped outside it */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__brand-icon">
              <School size={20} />
            </span>
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">Brightwood ERP</span>
              <span className="sidebar__brand-sub">Admin Console</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          <span className="sidebar__nav-label">Menu</span>
          <ul className="sidebar__list">
            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                  }
                >
                  <span className="sidebar__link-indicator" />
                  <Icon size={19} className="sidebar__link-icon" />
                  <span className="sidebar__link-text">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="sidebar__user-avatar">A</span>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">Admin User</span>
              <span className="sidebar__user-role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
