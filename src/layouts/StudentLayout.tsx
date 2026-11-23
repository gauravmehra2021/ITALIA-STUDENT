import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LearnerProvider, useLearner } from '../hooks/useLearner';
import { useI18n } from '../i18n';
import { LanguageSelect } from '../i18n/LanguagePicker';
import { Icon } from '../components/Icons';
import { Logo } from '../components/ui';
import './layout.css';

const NAV = [
  { to: '/', key: 'nav.home', short: 'nav.home', icon: Icon.Home, end: true },
  { to: '/courses', key: 'nav.courses', short: 'nav.courses', icon: Icon.Book },
  { to: '/live-classes', key: 'nav.live', short: 'nav.liveShort', icon: Icon.Video },
  { to: '/progress', key: 'nav.progress', short: 'nav.progress', icon: Icon.Chart },
  { to: '/tutor', key: 'nav.tutor', short: 'nav.tutor', icon: Icon.Sparkles },
  { to: '/notifications', key: 'nav.notifications', short: 'nav.notificationsShort', icon: Icon.Bell },
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
  const { t } = useI18n();
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
      <aside className="sidebar" aria-label={t('nav.mainNav')}>
        <div className="sidebar-brand">
          <Logo size={42} />
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, key, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <I size={20} />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <div className="sidebar-card-flag" aria-hidden>
            <span /><span /><span />
          </div>
          <strong>{t('nav.learnEveryDay')}</strong>
          <p>{t('nav.learnEveryDayText')}</p>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-meta">
            <strong>{user?.fullName || t('common.student')}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="icon-btn" onClick={onLogout} title={t('nav.signOut')} aria-label={t('nav.signOut')}>
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
            <span className="stat-chip streak" title={t('home.statStreak')}>
              <Icon.Flame size={18} /> {summary?.streakDays ?? 0}
              <span className="stat-chip-label">{t('nav.dayStreak')}</span>
            </span>
            <span className="stat-chip xp" title={t('nav.totalXp')}>
              <Icon.Bolt size={18} /> {summary?.totalXp ?? 0}
              <span className="stat-chip-label">{t('nav.xp')}</span>
            </span>
            <span className="stat-chip stars-chip" title={t('nav.starsEarned')}>
              <Icon.Star size={18} /> {summary?.starsEarned ?? 0}
            </span>
          </div>
          <div className="topbar-user">
            <LanguageSelect className="topbar-lang" />
            <button className="avatar avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label={t('nav.accountMenu')}>
              {initials}
            </button>
            {menuOpen && (
              <div className="user-menu" role="menu">
                <div className="user-menu-head">
                  <strong>{user?.fullName}</strong>
                  <span>{user?.email}</span>
                </div>
                <LanguageSelect className="in-menu" />
                <NavLink to="/tutor" className="user-menu-item" role="menuitem"><Icon.Sparkles size={18} /> {t('nav.tutor')}</NavLink>
                <NavLink to="/progress" className="user-menu-item" role="menuitem"><Icon.Chart size={18} /> {t('nav.myProgress')}</NavLink>
                <button className="user-menu-item danger" role="menuitem" onClick={onLogout}><Icon.Logout size={18} /> {t('nav.signOut')}</button>
              </div>
            )}
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <nav className="tabbar" aria-label={t('nav.mainNav')}>
        {MOBILE_NAV.map(({ to, short, icon: I, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <I size={22} />
            <span>{t(short)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
