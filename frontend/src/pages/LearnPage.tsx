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
  difficulty: string;
  estimatedMinutes: number;
  progress?: { completionPercentage: number } | null;
};

export function LearnPage() {
  const { lang } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    api<{ modules: Module[] }>(`/modules?lang=${lang}`).then((d) => setModules(d.modules));
  }, [lang]);

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold text-teal-900">{t(lang, 'learn')}</h1>
      <p className="mt-2 text-teal-900/70">{t(lang, 'tagline')}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {modules.map((m, i) => (
          <Link
            key={m.id}
            to={`/learn/${m.id}`}
            className="panel block p-5 transition hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{m.category}</p>
            <p className="mt-1 text-xl font-extrabold">{m.title}</p>
            <p className="mt-2 text-sm text-teal-900/70">{m.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm font-bold text-teal-800">
              <span>{m.estimatedMinutes} min · {m.difficulty}</span>
              <span>{Math.round(m.progress?.completionPercentage ?? 0)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-900/10">
              <div
                className="h-full bg-teal-600"
                style={{ width: `${m.progress?.completionPercentage ?? 0}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
