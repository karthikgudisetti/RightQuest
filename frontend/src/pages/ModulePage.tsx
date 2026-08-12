import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { ageGuide, sceneThemeFromTitle } from '../lib/ageGuide';
import { Mascot, XpBurst } from '../components/GameEffects';

type Lesson = { id: string; title: string; content: string; sequenceNumber: number; videoUrl?: string | null };
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
  const { lang, ageGroup, refreshMe } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [burstXp, setBurstXp] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  async function load() {
    const data = await api<{
      module: ModuleDetail;
      progress: { completedLessonIds: string } | null;
    }>(`/modules/${id}?lang=${lang}`);
    setModule(data.module);
    setCompleted(JSON.parse(data.progress?.completedLessonIds || '[]'));
    setActiveLesson((prev) => prev ?? data.module.lessons[0] ?? null);
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
      setToast(`+${res.reward?.xpAwarded ?? 0} XP${badges ? ` · ${badges}` : ''}`);
      setBurstXp(res.reward?.xpAwarded ?? 10);
      setShowBurst(true);
    }
  }

  if (!module) return <div className="panel p-8 text-center font-bold text-[#12352f]">Loading...</div>;

  const demoScenario = module.scenarios.find((s) => s.isDemoPath) || module.scenarios[0];
  const theme = sceneThemeFromTitle(module.title, module.description);

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-[1fr_1.45fr]">
      <XpBurst show={showBurst} xp={burstXp} label={guide.feedbackGood} onDone={() => setShowBurst(false)} />
      <aside className="panel h-fit overflow-hidden">
        <div className="border-b border-[#d7e8e3] px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f6f2] text-2xl">
              {theme.emoji}
            </span>
            {guide.showMascot && <Mascot mood="happy" />}
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-[#12352f]">{module.title}</p>
          <p className="mt-2 text-sm muted">{module.description}</p>
        </div>
        <ul className="space-y-2 p-4">
          {module.lessons.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                  activeLesson?.id === l.id
                    ? 'bg-[#0d6b63] text-white'
                    : 'bg-[#f3faf7] text-[#12352f] hover:bg-[#e8f6f2]'
                }`}
                onClick={() => setActiveLesson(l)}
              >
                {completed.includes(l.id) ? '✓ ' : ''}
                {l.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-2 px-4 pb-4">
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
          <Link className="btn-secondary w-full" to="/games">
            Mini-Games
          </Link>
        </div>
      </aside>

      <section className="panel p-6 md:p-8">
        {activeLesson ? (
          <>
            <p className="text-sm font-bold text-[#0d6b63]">Lesson</p>
            <h1 className={`mt-2 font-display font-bold text-[#12352f] ${guide.titleScale}`}>
              {activeLesson.title}
            </h1>
            {activeLesson.videoUrl && (
              <div className="video-stage mt-4 overflow-hidden rounded-2xl border border-[#d7e8e3]">
                <iframe
                  title={activeLesson.title}
                  src={
                    activeLesson.videoUrl.includes('embed')
                      ? activeLesson.videoUrl
                      : activeLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}
            <div className={`mt-4 whitespace-pre-wrap leading-relaxed text-[#12352f] ${guide.textScale}`}>
              {activeLesson.content}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary" type="button" onClick={completeLesson}>
                {t(lang, 'completeLesson')}
              </button>
              <Link className="btn-secondary" to="/videos">
                🎬 {lang === 'hi' ? 'और वीडियो' : lang === 'te' ? 'మరిన్ని వీడియోలు' : 'More videos'}
              </Link>
            </div>
            {toast && <p className="mt-3 font-bold text-[#b45309] animate-pop">{toast}</p>}
          </>
        ) : (
          <p className="muted">No lessons yet.</p>
        )}
      </section>
    </div>
  );
}
