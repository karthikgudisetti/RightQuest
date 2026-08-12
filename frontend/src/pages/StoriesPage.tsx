import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { ageGuide, sceneThemeFromTitle } from '../lib/ageGuide';

type Scenario = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  isDemoPath: boolean;
};

export function StoriesPage() {
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    api<{ scenarios: Scenario[] }>(`/scenarios?lang=${lang}`).then((d) => setScenarios(d.scenarios));
  }, [lang]);

  return (
    <div className="animate-rise space-y-6">
      <section className="realm-hero compact px-6 py-10 md:px-10">
        <span className="spark" style={{ top: '20%', left: '12%' }} />
        <span className="spark" style={{ top: '55%', left: '80%', animationDelay: '0.6s' }} />
        <div className="portal-ring right-6 top-6 hidden md:block" />
        <div className="relative z-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-200">Story Theater</p>
          <h1 className={`mt-2 font-display font-bold text-white ${guide.titleScale}`}>
            {t(lang, 'stories')}
          </h1>
          <p className="mt-2 max-w-lg text-teal-50/95">Learn → Decide → Understand → Apply</p>
          <p className="mt-2 text-sm font-semibold text-amber-100">{guide.storyHint}</p>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 stagger">
        {scenarios.map((s) => {
          const theme = sceneThemeFromTitle(s.title, s.description);
          return (
            <Link key={s.id} to={`/stories/${s.id}`} className="surface-card block p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-amber-100 text-2xl animate-float">
                  {theme.emoji}
                </div>
                {s.isDemoPath && <span className="chip chip-amber">Demo</span>}
              </div>
              <p className="mt-3 text-lg font-extrabold text-[#0c2e2a]">{s.title}</p>
              <p className="mt-1 text-sm muted">{s.description}</p>
              <p className="mt-3 text-sm font-bold text-[#0b7a6f]">Enter story →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
