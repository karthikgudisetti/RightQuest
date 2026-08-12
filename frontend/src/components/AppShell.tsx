import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

const childLinks = [
  { to: '/', key: 'home' as const },
  { to: '/games', key: 'games' as const },
  { to: '/videos', key: 'videos' as const },
  { to: '/learn', key: 'learn' as const },
  { to: '/stories', key: 'stories' as const },
  { to: '/badges', key: 'badges' as const },
  { to: '/progress', key: 'progress' as const },
  { to: '/tutor', key: 'tutor' as const },
];

export function AppShell() {
  const { user, lang, setLang, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CONTENT_REVIEWER';

  return (
    <div className="national-shell">
      <header className="nav-glass sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            className="font-display text-xl font-bold md:text-2xl"
            onClick={() => navigate(isAdmin ? '/admin' : '/')}
          >
            <span className="miracle-title">{t(lang, 'brand')}</span>
          </button>
          <nav className="hidden items-center gap-1 rounded-full bg-[#f3faf7] p-1 md:flex">
            {(isAdmin
              ? [
                  { to: '/admin', key: 'admin' as const },
                  { to: '/admin/modules', key: 'modules' as const },
                ]
              : childLinks
            ).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/' || l.to === '/admin'}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-[#0d6b63] text-white shadow-sm'
                      : 'text-[#3d5c56] hover:bg-white hover:text-[#0a4f49]'
                  }`
                }
              >
                {t(lang, l.key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
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
              <div className="chip hidden sm:inline-flex">⭐ {user.xp} XP</div>
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
        {!isAdmin && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            {childLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                    isActive ? 'bg-[#0d6b63] text-white' : 'bg-white text-[#0a4f49]'
                  }`
                }
              >
                {t(lang, l.key)}
              </NavLink>
            ))}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
