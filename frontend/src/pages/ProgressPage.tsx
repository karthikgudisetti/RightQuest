import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

export function ProgressPage() {
  const { user, lang, refreshMe } = useAuth();
  const [stats, setStats] = useState({
    modulesCompleted: 0,
    badges: 0,
    avgQuizScore: 0,
    scenariosCompleted: 0,
  });
  const [progress, setProgress] = useState<
    { id: string; completionPercentage: number; module: { title: string; category: string } }[]
  >([]);
  const [milestones, setMilestones] = useState<{ name: string; reached: boolean }[]>([]);

  useEffect(() => {
    refreshMe();
    api<typeof stats>('/users/me/stats').then(setStats);
    api<{ progress: typeof progress }>('/users/me/progress').then((d) => setProgress(d.progress));
    api<{ milestones: typeof milestones }>('/gamification/leaderboard').then((d) =>
      setMilestones(d.milestones)
    );
  }, [refreshMe]);

  return (
    <div className="animate-rise space-y-6">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'progress')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['XP', user?.xp ?? 0],
          [t(lang, 'level'), `${user?.level} · ${user?.levelName}`],
          ['Modules', `${stats.modulesCompleted}`],
          ['Avg Quiz', `${stats.avgQuizScore}%`],
        ].map(([label, value]) => (
          <div key={label as string} className="panel p-4">
            <p className="text-sm font-bold text-teal-700">{label}</p>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl font-bold">My Learning</h2>
        <div className="mt-4 space-y-4">
          {progress.length === 0 && <p className="text-teal-900/70">Start a module to track progress.</p>}
          {progress.map((p) => (
            <div key={p.id}>
              <div className="flex justify-between text-sm font-bold">
                <span>
                  {p.module.title} <span className="text-orange-600">· {p.module.category}</span>
                </span>
                <span>{Math.round(p.completionPercentage)}%</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-teal-900/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-600 to-orange-400"
                  style={{ width: `${p.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-xl font-bold">Personal milestones</h2>
        <ul className="mt-3 space-y-2">
          {milestones.map((m) => (
            <li key={m.name} className="font-semibold">
              {m.reached ? '✅' : '○'} {m.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
