import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

const childLinks = [
  { to: '/', key: 'home' as const },
  { to: '/learn', key: 'learn' as const },
  { to: '/stories', key: 'stories' as const },
  { to: '/badges', key: 'badges' as const },
  { to: '/progress', key: 'progress' as const },
  { to: '/tutor', key: 'tutor' as const },
];

export function AppShell() {
  const { user, lang, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CONTENT_REVIEWER';

  return (
    <div className="pattern-dots min-h-screen">
      <header className="sticky top-0 z-20 border-b border-teal-900/10 bg-[#ecfdf5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            className="font-display text-xl font-bold text-teal-900 md:text-2xl"
            onClick={() => navigate(isAdmin ? '/admin' : '/')}
          >
            {t(lang, 'brand')}
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {(isAdmin
              ? [{ to: '/admin', key: 'admin' as const }, { to: '/admin/modules', key: 'modules' as const }]
              : childLinks
            ).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/' || l.to === '/admin'}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-teal-700 text-white' : 'text-teal-900/80 hover:bg-white/70'
                  }`
                }
              >
                {t(lang, l.key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user && !isAdmin && (
              <div className="hidden rounded-xl bg-white/80 px-3 py-1.5 text-sm font-bold text-teal-900 sm:block">
                ⭐ {user.xp} {t(lang, 'xp')}
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
        {!isAdmin && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            {childLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                    isActive ? 'bg-teal-700 text-white' : 'bg-white/70 text-teal-900'
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
