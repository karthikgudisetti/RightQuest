import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Module = {
  id: string;
  title: string;
  description: string;
  category: string;
  progress?: { completionPercentage: number } | null;
  scenarios?: { id: string; isDemoPath: boolean }[];
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  moduleId?: string | null;
};

type BadgeRow = {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
};

export function HomePage() {
  const { user, lang, refreshMe } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [badges, setBadges] = useState<BadgeRow[]>([]);

  useEffect(() => {
    refreshMe().catch(() => undefined);
    api<{ modules: Module[] }>(`/modules?lang=${lang}`).then((d) => setModules(d.modules));
    api<{ challenge: Challenge | null }>('/gamification/challenges').then((d) =>
      setChallenge(d.challenge)
    );
    api<{ badges: BadgeRow[] }>('/gamification/badges').then((d) =>
      setBadges(d.badges.filter((b) => b.earned).slice(0, 4))
    );
  }, [lang, refreshMe]);

  const continueMod =
    modules.find((m) => (m.progress?.completionPercentage ?? 0) > 0 && (m.progress?.completionPercentage ?? 0) < 100) ||
    modules.find((m) => m.category === 'Online Safety') ||
    modules[0];

  return (
    <div className="animate-rise space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 px-6 py-10 text-white md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-8 top-4 h-40 w-40 rounded-full bg-amber-300/30 blur-2xl animate-float" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-orange-400/25 blur-xl" />
        <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {t(lang, 'brand')}
        </p>
        <p className="mt-3 max-w-xl text-lg text-teal-50/90">
          {t(lang, 'hi')}, {user?.name || t(lang, 'explorer')}! {t(lang, 'welcomeBack')}
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold">
          <span className="rounded-xl bg-white/15 px-4 py-2">⭐ {user?.xp ?? 0} {t(lang, 'xp')}</span>
          <span className="rounded-xl bg-white/15 px-4 py-2">
            🏆 {t(lang, 'level')} {user?.level} · {user?.levelName}
          </span>
        </div>
      </section>

      {continueMod && (
        <section>
          <h2 className="font-display text-2xl font-bold text-teal-900">{t(lang, 'continueLearning')}</h2>
          <Link
            to={`/learn/${continueMod.id}`}
            className="panel mt-3 block p-5 transition hover:scale-[1.01] animate-pop"
          >
            <p className="text-sm font-bold text-orange-600">{continueMod.category}</p>
            <p className="mt-1 text-xl font-extrabold text-teal-900">{continueMod.title}</p>
            <p className="mt-1 text-teal-900/70">{continueMod.description}</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-teal-900/10">
              <div
                className="h-full rounded-full bg-teal-600 transition-all"
                style={{ width: `${continueMod.progress?.completionPercentage ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-bold text-teal-800">
              {Math.round(continueMod.progress?.completionPercentage ?? 0)}% complete
            </p>
          </Link>
        </section>
      )}

      {challenge && (
        <section>
          <h2 className="font-display text-2xl font-bold text-teal-900">{t(lang, 'todaysMission')}</h2>
          <div className="panel mt-3 p-5">
            <p className="text-lg font-extrabold">{challenge.title}</p>
            <p className="mt-1 text-teal-900/70">{challenge.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="btn-primary" to={challenge.moduleId ? `/learn/${challenge.moduleId}` : '/stories'}>
                {t(lang, 'playStory')}
              </Link>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  await api(`/gamification/challenges/${challenge.id}/complete`, { method: 'POST' });
                  await refreshMe();
                  alert(t(lang, 'missionComplete') + ` +${challenge.xpReward} XP`);
                }}
              >
                +{challenge.xpReward} XP
              </button>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-teal-900">{t(lang, 'yourBadges')}</h2>
          <Link className="font-bold text-teal-700" to="/badges">
            {t(lang, 'badges')} →
          </Link>
        </div>
        {badges.length === 0 ? (
          <p className="mt-3 text-teal-900/70">{t(lang, 'noBadges')}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            {badges.map((b) => (
              <div key={b.id} className="panel px-4 py-3 text-center">
                <div className="text-2xl">{b.icon}</div>
                <div className="mt-1 text-sm font-bold">{b.name}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
