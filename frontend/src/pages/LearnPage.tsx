import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { ageGuide, sceneThemeFromTitle } from '../lib/ageGuide';
import { ProgressRing } from '../components/GameEffects';

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
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    api<{ modules: Module[] }>(`/modules?lang=${lang}`).then((d) => setModules(d.modules));
  }, [lang]);

  return (
    <div className="animate-rise">
      <section className="hero-banner mb-6 px-6 py-7">
        <p className="eyebrow">Learning Path</p>
        <h1 className={`mt-2 font-display font-bold text-[#12352f] ${guide.titleScale}`}>Quest Map</h1>
        <p className="mt-2 muted">{guide.tip}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="btn-primary inline-flex" to="/videos">
            🎬 {lang === 'hi' ? 'वीडियो लर्निंग' : lang === 'te' ? 'వీడియో లెర్నింగ్' : 'Video learning'} →
          </Link>
          <Link className="btn-secondary inline-flex" to="/rights">
            ⚖️ {lang === 'hi' ? 'अपने अधिकार जानो' : lang === 'te' ? 'మీ హక్కులు' : 'Know your rights'} →
          </Link>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 stagger">
        {modules.map((m) => {
          const theme = sceneThemeFromTitle(m.title, m.category);
          return (
            <Link key={m.id} to={`/learn/${m.id}`} className="surface-card block overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#d7e8e3] px-5 py-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f6f2] text-2xl">
                  {theme.emoji}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0d6b63]">{m.category}</p>
                  <p className="text-lg font-extrabold text-[#12352f]">{m.title}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm muted">{m.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#12352f]">
                    {m.estimatedMinutes} min · {m.difficulty}
                  </span>
                  <ProgressRing value={m.progress?.completionPercentage ?? 0} size={56} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <Link className="btn-primary mt-6 inline-flex" to="/games">
        {t(lang, 'games')} →
      </Link>
    </div>
  );
}
