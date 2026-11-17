import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './layout.css';

// SVG Icons matching the reference design
const Icons = {
  MyClasses: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 3 6 3 6 3s6 0 6-3v-5" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Practice: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Assignments: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
  Translator: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  ChikooAi: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" />
      <line x1="16" y1="16" x2="16.01" y2="16" />
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

  const studentName = user?.fullName || 'Gaurav Mehra';

  return (
    <div className="sse-shell">
      {/* ── Left Sidebar ── */}
      <aside className="sse-sidebar">
        {/* Brand Header */}
        <div className="sse-brand-box">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span className="brand-mark" aria-hidden />
            <div>
              <div className="sse-brand-title">SS Europa</div>
              <div className="sse-brand-sub">by AMEI</div>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sse-nav-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sse-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sse-item-icon"><Icons.MyClasses /></span>
            <span>My Classes</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sse-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sse-item-icon"><Icons.Dashboard /></span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/practice"
            className={({ isActive }) => `sse-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sse-item-icon"><Icons.Practice /></span>
            <span>Practice Exercises</span>
          </NavLink>

          <NavLink
            to="/assignments"
            className={({ isActive }) => `sse-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sse-item-icon"><Icons.Assignments /></span>
            <span>Tests & Assignments</span>
          </NavLink>

          <NavLink
            to="/translator"
            className={({ isActive }) => `sse-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sse-item-icon"><Icons.Translator /></span>
            <span>Smart Translator</span>
          </NavLink>

          <NavLink
            to="/ai-tutor"
            className={({ isActive }) => `sse-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sse-item-icon"><Icons.ChikooAi /></span>
            <span>Chikoo AI Assistant</span>
          </NavLink>

          <div className="sse-nav-divider" />

          <button
            type="button"
            onClick={handleLogout}
            className="sse-nav-item sse-logout-item"
            title="Sign out from student portal"
          >
            <span className="sse-item-icon"><Icons.Logout /></span>
            <span>Logout</span>
          </button>
        </nav>

        {/* Bottom Mascot Card */}
        <div className="sse-mascot-card">
          <img
            src="/images/ui/chikoo-card.png"
            alt="Chikoo - Learn Italian with SS Europa"
            className="sse-mascot-img"
          />
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="sse-main">
        {/* Top Header Bar */}
        <header className="sse-topbar">
          <div>
            <div className="sse-title-row">
              <span style={{ fontSize: '1.6rem', marginRight: '6px' }}>🎓</span>
              <h1 className="sse-header-title">My Classes</h1>
            </div>
            {/* Italian Tricolor Underline */}
            <div className="sse-tricolor-line">
              <span className="tri-green" />
              <span className="tri-white" />
              <span className="tri-red" />
            </div>
            <p className="sse-header-sub">
              Explore your learning journey with SS Europa
            </p>
          </div>

          {/* User Profile Bar */}
          <div className="sse-user-actions">
            {/* Bell Notification */}
            <Link to="/notifications" className="sse-bell-btn" title="Notifications">
              <Icons.Bell />
              <span className="sse-bell-badge">2</span>
            </Link>

            {/* Student Profile Chip */}
            <div className="sse-profile-chip">
              <img
                src="/images/ui/chikoo-card.png"
                alt={studentName}
                className="sse-avatar-img"
              />
              <div className="sse-profile-text">
                <span className="sse-name-label">{studentName}</span>
                <span className="sse-role-label">Student</span>
              </div>
              <span className="sse-arrow-down">▾</span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="sse-page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sse-mobile-nav">
        <NavLink to="/" end className={({ isActive }) => `sse-mob-tab ${isActive ? 'active' : ''}`}>
          <Icons.MyClasses />
          <span>Classes</span>
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `sse-mob-tab ${isActive ? 'active' : ''}`}>
          <Icons.Dashboard />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/ai-tutor" className={({ isActive }) => `sse-mob-tab ${isActive ? 'active' : ''}`}>
          <Icons.ChikooAi />
          <span>Chikoo AI</span>
        </NavLink>
        <NavLink to="/practice" className={({ isActive }) => `sse-mob-tab ${isActive ? 'active' : ''}`}>
          <Icons.Practice />
          <span>Practice</span>
        </NavLink>
        <NavLink to="/assignments" className={({ isActive }) => `sse-mob-tab ${isActive ? 'active' : ''}`}>
          <Icons.Assignments />
          <span>Tests</span>
        </NavLink>
      </nav>
    </div>
  );
}
export default StudentLayout;
