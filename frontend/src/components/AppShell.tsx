import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { AppFooter } from './AppFooter';

const childLinks = [
  { to: '/', key: 'home' as const, icon: '🏠' },
  { to: '/games', key: 'games' as const, icon: '🎮' },
  { to: '/videos', key: 'videos' as const, icon: '🎬' },
  { to: '/learn', key: 'learn' as const, icon: '📚' },
  { to: '/stories', key: 'stories' as const, icon: '📖' },
  { to: '/rights', key: 'rights' as const, icon: '⚖️' },
  { to: '/help', key: 'help' as const, icon: '🆘' },
  { to: '/tutor', key: 'tutor' as const, icon: '🤖' },
  { to: '/badges', key: 'badges' as const, icon: '🏅' },
  { to: '/progress', key: 'progress' as const, icon: '📈' },
];

export function AppShell() {
  const { user, lang, setLang, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CONTENT_REVIEWER';

  const links = isAdmin
    ? [
        { to: '/admin', key: 'admin' as const, icon: '⚙️' },
        { to: '/admin/modules', key: 'modules' as const, icon: '📦' },
      ]
    : childLinks;

  return (
    <div className="national-shell">
      <header className="nav-glass sticky top-0 z-20">
        <div className="nav-tricolor" aria-hidden />
        <div className="site-header">
          <button
            type="button"
            className="brand-lockup"
            onClick={() => navigate(isAdmin ? '/admin' : '/')}
          >
            <span className="brand-flag" aria-hidden>
              <span className="saffron" />
              <span className="white" />
              <span className="green" />
            </span>
            <span className="miracle-title font-display text-lg font-bold sm:text-xl">
              {t(lang, 'brand')}
            </span>
          </button>

          <nav className="site-nav" aria-label="Main">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/' || l.to === '/admin'}
                className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="site-nav-icon" aria-hidden>
                  {l.icon}
                </span>
                <span>{t(lang, l.key)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="site-header-actions">
            {!isAdmin && (
              <div className="lang-switch" aria-label="Language">
                <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                  EN
                </button>
                <button type="button" className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>
                  हिन्दी
                </button>
                <button type="button" className={lang === 'te' ? 'active' : ''} onClick={() => setLang('te')}>
                  తెలుగు
                </button>
              </div>
            )}
            {user && !isAdmin && (
              <div className="xp-pill">
                <span className="xp-pill-star">⭐</span>
                <span>{user.xp}</span>
              </div>
            )}
            <button
              type="button"
              className="btn-secondary !px-3 !py-2 text-sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              {t(lang, 'logout')}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
