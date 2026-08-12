import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Scenario = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  isDemoPath: boolean;
};

export function StoriesPage() {
  const { lang } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    api<{ scenarios: Scenario[] }>(`/scenarios?lang=${lang}`).then((d) => setScenarios(d.scenarios));
  }, [lang]);

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'stories')}</h1>
      <p className="mt-2 text-teal-900/70">Learn → Decide → Understand → Apply</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {scenarios.map((s) => (
          <Link key={s.id} to={`/stories/${s.id}`} className="panel block p-5 hover:-translate-y-0.5 transition">
            {s.isDemoPath && (
              <span className="rounded-lg bg-orange-500 px-2 py-1 text-xs font-bold text-white">Demo path</span>
            )}
            <p className="mt-2 text-xl font-extrabold">{s.title}</p>
            <p className="mt-1 text-sm text-teal-900/70">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
