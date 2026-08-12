import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Lesson = { id: string; title: string; content: string; sequenceNumber: number };
type ModuleDetail = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quizzes: { id: string; title: string }[];
  scenarios: { id: string; title: string; isDemoPath: boolean }[];
};

export function ModulePage() {
  const { id } = useParams();
  const { lang, refreshMe } = useAuth();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  async function load() {
    const data = await api<{
      module: ModuleDetail;
      progress: { completedLessonIds: string } | null;
    }>(`/modules/${id}?lang=${lang}`);
    setModule(data.module);
    setCompleted(JSON.parse(data.progress?.completedLessonIds || '[]'));
    setActiveLesson(data.module.lessons[0] ?? null);
    await api(`/modules/${id}/start`, { method: 'POST' });
  }

  useEffect(() => {
    load().catch(console.error);
  }, [id, lang]);

  async function completeLesson() {
    if (!activeLesson) return;
    const res = await api<{
      reward: { xpAwarded: number; unlockedBadges: { name: string; icon: string }[] } | null;
      alreadyCompleted?: boolean;
    }>(`/lessons/${activeLesson.id}/complete`, { method: 'POST' });
    await load();
    await refreshMe();
    if (res.alreadyCompleted) {
      setToast('Already completed');
    } else {
      const badges = res.reward?.unlockedBadges?.map((b) => `${b.icon} ${b.name}`).join(', ');
      setToast(`+${res.reward?.xpAwarded ?? 0} XP${badges ? ` · Badge: ${badges}` : ''}`);
    }
  }

  if (!module) return <p className="animate-rise">Loading...</p>;

  const demoScenario = module.scenarios.find((s) => s.isDemoPath) || module.scenarios[0];

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <aside className="panel p-5 h-fit">
        <p className="font-display text-2xl font-bold">{module.title}</p>
        <p className="mt-2 text-sm text-teal-900/70">{module.description}</p>
        <ul className="mt-4 space-y-2">
          {module.lessons.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold ${
                  activeLesson?.id === l.id ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-900'
                }`}
                onClick={() => setActiveLesson(l)}
              >
                {completed.includes(l.id) ? '✓ ' : ''}
                {l.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          {demoScenario && (
            <Link className="btn-secondary w-full" to={`/stories/${demoScenario.id}`}>
              {t(lang, 'playStory')}
            </Link>
          )}
          {module.quizzes[0] && (
            <Link className="btn-primary w-full" to={`/quizzes/${module.quizzes[0].id}`}>
              {t(lang, 'takeQuiz')}
            </Link>
          )}
        </div>
      </aside>

      <section className="panel p-6 md:p-8">
        {activeLesson ? (
          <>
            <h1 className="font-display text-3xl font-bold">{activeLesson.title}</h1>
            <div className="mt-4 whitespace-pre-wrap leading-relaxed text-teal-950/90">
              {activeLesson.content}
            </div>
            <button className="btn-primary mt-8" type="button" onClick={completeLesson}>
              {t(lang, 'completeLesson')}
            </button>
            {toast && <p className="mt-3 font-bold text-orange-600 animate-pop">{toast}</p>}
          </>
        ) : (
          <p>No lessons yet.</p>
        )}
      </section>
    </div>
  );
}
