import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './layout.css';

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
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img
              src="/images/updated-logo.png"
              alt="SS EUROPA"
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>📚</span>
            <span>Courses & Lessons</span>
          </NavLink>

          <NavLink to="/classes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>🎥</span>
            <span>Live Classes (Meet)</span>
          </NavLink>

          <NavLink to="/ai" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>🤖</span>
            <span>AI Italian Tutor</span>
          </NavLink>

          <NavLink to="/progress" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>📊</span>
            <span>My Progress</span>
          </NavLink>

          <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>🔔</span>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/support" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>🎧</span>
            <span>Help & Support</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initial}</div>
            <div className="user-details">
              <div className="user-name">{user?.fullName || user?.email || 'Student'}</div>
              <div className="user-status">💎 All-Access Active</div>
            </div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={handleLogout} style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold">💎 App All-Access Member</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Official Italian Academy</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/ai" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              🤖 Practice with AI
            </Link>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem' }}>🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem' }}>📚</span>
          <span>Courses</span>
        </NavLink>
        <NavLink to="/classes" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem' }}>🎥</span>
          <span>Meet</span>
        </NavLink>
        <NavLink to="/ai" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
          <span>AI Tutor</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem' }}>📊</span>
          <span>Progress</span>
        </NavLink>
      </nav>
    </div>
  );
}

