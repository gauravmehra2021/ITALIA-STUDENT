import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './layout.css';

// Crisp modern SVG Icons
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Courses: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="14" y2="10" />
    </svg>
  ),
  LiveClasses: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  AiTutor: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  Progress: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Notifications: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Support: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S';

  return (
    <div className="app-shell">
      {/* Desktop Luxury Sidebar */}
      <aside className="app-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-container">
          <Link to="/" className="sidebar-brand-card">
            <div className="brand-logo-frame">
              <img
                src="/images/updated-logo.png"
                alt="SS Europa"
                className="brand-logo-img"
              />
            </div>
            <div className="brand-meta-badge">
              <span className="brand-tag">STUDENT PORTAL</span>
              <span className="brand-live-pulse" title="System Online">
                <span className="pulse-dot" />
                Online
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className="sidebar-nav-container">
          {/* Main Navigation */}
          <div className="nav-group">
            <div className="nav-group-label">OVERVIEW</div>
            <NavLink to="/" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.Dashboard /></span>
              <span className="item-title">Dashboard</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">ACADEMIC & LEARNING</div>
            <NavLink to="/courses" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.Courses /></span>
              <span className="item-title">Courses & Lessons</span>
            </NavLink>

            <NavLink to="/classes" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.LiveClasses /></span>
              <span className="item-title">Live Classes</span>
              <span className="badge-live-tag">Meet</span>
            </NavLink>

            <NavLink to="/ai" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.AiTutor /></span>
              <span className="item-title">AI Italian Tutor</span>
              <span className="badge-ai-tag">Gemini</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">STUDENT DASHBOARD</div>
            <NavLink to="/progress" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.Progress /></span>
              <span className="item-title">My Progress & Grades</span>
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.Notifications /></span>
              <span className="item-title">Notifications</span>
            </NavLink>

            <NavLink to="/support" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <span className="item-icon"><Icons.Support /></span>
              <span className="item-title">Support & FAQ</span>
            </NavLink>
          </div>
        </div>

        {/* User Profile Card Footer */}
        <div className="sidebar-footer-card">
          <div className="user-profile-row">
            <div className="user-avatar-glow">{initial}</div>
            <div className="user-info-text">
              <div className="user-name-title">{user?.fullName || user?.email || 'Student'}</div>
              <div className="user-membership-pill">💎 All-Access Pass</div>
            </div>
          </div>

          <button
            className="sidebar-logout-btn"
            type="button"
            onClick={handleLogout}
            title="Sign out from Student Portal"
          >
            <Icons.Logout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Area */}
      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-gold" style={{ boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)' }}>
              💎 All-Access Single Membership
            </span>
            <span className="topbar-academy-label">
              SS Europa • Accademia di Lingua Italiana
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/ai"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.88rem',
                borderRadius: '8px',
              }}
            >
              <Icons.AiTutor />
              <span>Ask AI Tutor</span>
            </Link>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span className="mobile-tab-icon"><Icons.Dashboard /></span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span className="mobile-tab-icon"><Icons.Courses /></span>
          <span>Courses</span>
        </NavLink>
        <NavLink to="/classes" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span className="mobile-tab-icon"><Icons.LiveClasses /></span>
          <span>Meet</span>
        </NavLink>
        <NavLink to="/ai" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span className="mobile-tab-icon"><Icons.AiTutor /></span>
          <span>AI Tutor</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span className="mobile-tab-icon"><Icons.Progress /></span>
          <span>Progress</span>
        </NavLink>
      </nav>
    </div>
  );
}
export default StudentLayout;
