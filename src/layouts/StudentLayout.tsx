import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LearnerProvider, useLearner } from '../hooks/useLearner';
import { Icon } from '../components/Icons';
import { Logo } from '../components/ui';
import './layout.css';

const NAV = [
  { to: '/', label: 'Home', icon: Icon.Home, end: true },
  { to: '/courses', label: 'Courses', icon: Icon.Book },
  { to: '/live-classes', label: 'Live classes', icon: Icon.Video },
  { to: '/progress', label: 'Progress', icon: Icon.Chart },
  { to: '/tutor', label: 'AI tutor', icon: Icon.Sparkles },
  { to: '/notifications', label: 'Notifications', icon: Icon.Bell },
];

const MOBILE_NAV = NAV.filter((n) => n.to !== '/tutor');

export function StudentLayout() {
  return (
    <LearnerProvider>
      <Shell />
    </LearnerProvider>
  );
}

function Shell() {
  const { user, logout } = useAuth();
  const { summary } = useLearner();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // The lesson player uses the full screen.
  const immersive = location.pathname.startsWith('/lesson/');

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const initials = (user?.fullName || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  if (immersive) {
    return (
      <div className="immersive">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <Logo size={42} />
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <I size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <div className="sidebar-card-flag" aria-hidden>
            <span /><span /><span />
          </div>
          <strong>Learn every day</strong>
          <p>10 minutes a day is enough to keep your streak and remember new words.</p>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-meta">
            <strong>{user?.fullName || 'Student'}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="icon-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
            <Icon.Logout size={18} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-mobile-brand">
            <Logo size={34} withText={false} />
            <strong>SS Europa</strong>
          </div>
          <div className="topbar-stats">
            <span className="stat-chip streak" title="Day streak">
              <Icon.Flame size={18} /> {summary?.streakDays ?? 0}
              <span className="stat-chip-label">day streak</span>
            </span>
            <span className="stat-chip xp" title="Total XP">
              <Icon.Bolt size={18} /> {summary?.totalXp ?? 0}
              <span className="stat-chip-label">XP</span>
            </span>
            <span className="stat-chip stars-chip" title="Stars earned">
              <Icon.Star size={18} /> {summary?.starsEarned ?? 0}
            </span>
          </div>
          <div className="topbar-user">
            <button className="avatar avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Account menu">
              {initials}
            </button>
            {menuOpen && (
              <div className="user-menu" role="menu">
                <div className="user-menu-head">
                  <strong>{user?.fullName}</strong>
                  <span>{user?.email}</span>
                </div>
                <NavLink to="/tutor" className="user-menu-item" role="menuitem"><Icon.Sparkles size={18} /> AI tutor</NavLink>
                <NavLink to="/progress" className="user-menu-item" role="menuitem"><Icon.Chart size={18} /> My progress</NavLink>
                <button className="user-menu-item danger" role="menuitem" onClick={onLogout}><Icon.Logout size={18} /> Sign out</button>
              </div>
            )}
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <nav className="tabbar" aria-label="Main navigation">
        {MOBILE_NAV.map(({ to, label, icon: I, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <I size={22} />
            <span>{label === 'Live classes' ? 'Live' : label === 'Notifications' ? 'Alerts' : label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
