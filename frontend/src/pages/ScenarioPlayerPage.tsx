import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Choice = { id: string; choiceText: string; nextScenarioId?: string | null };
type Scenario = {
  id: string;
  title: string;
  story: string;
  choices: Choice[];
  module?: { id: string; title: string };
};

export function ScenarioPlayerPage() {
  const { id } = useParams();
  const { lang, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    nextScenarioId?: string | null;
    xpAwarded: number;
    badges: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFeedback(null);
    api<{ scenario: Scenario }>(`/scenarios/${id}?lang=${lang}`).then((d) => setScenario(d.scenario));
  }, [id, lang]);

  async function answer(choiceId: string) {
    setBusy(true);
    try {
      const res = await api<{
        isCorrect: boolean;
        explanation: string;
        nextScenarioId?: string | null;
        reward: { xpAwarded: number; unlockedBadges: { icon: string; name: string }[] };
      }>(`/scenarios/${id}/answer`, {
        method: 'POST',
        body: JSON.stringify({ choiceId }),
      });
      await refreshMe();
      setFeedback({
        isCorrect: res.isCorrect,
        explanation: res.explanation,
        nextScenarioId: res.nextScenarioId,
        xpAwarded: res.reward.xpAwarded,
        badges: res.reward.unlockedBadges.map((b) => `${b.icon} ${b.name}`).join(', '),
      });
    } finally {
      setBusy(false);
    }
  }

  if (!scenario) return <p>Loading story...</p>;

  return (
    <div className="animate-rise mx-auto max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Interactive Story</p>
      <h1 className="font-display mt-2 text-3xl font-bold md:text-4xl">{scenario.title}</h1>
      <div className="panel mt-6 p-6 md:p-8">
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{scenario.story}</p>
      </div>

      {!feedback ? (
        <div className="mt-6 space-y-3">
          <p className="font-bold text-teal-900">What would you do?</p>
          {scenario.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={busy}
              className="btn-secondary w-full !justify-start text-left"
              onClick={() => answer(c.id)}
            >
              {c.choiceText}
            </button>
          ))}
        </div>
      ) : (
        <div className="panel mt-6 animate-pop border-l-4 border-l-teal-600 p-6">
          <p className="text-xl font-extrabold text-teal-900">
            {feedback.isCorrect ? t(lang, 'correct') : t(lang, 'learnMore')}
          </p>
          <p className="mt-3 leading-relaxed">{feedback.explanation}</p>
          <p className="mt-3 font-bold text-orange-600">
            +{feedback.xpAwarded} XP
            {feedback.badges ? ` · ${feedback.badges}` : ''}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {feedback.nextScenarioId && (
              <button
                className="btn-primary"
                type="button"
                onClick={() => navigate(`/stories/${feedback.nextScenarioId}`)}
              >
                {t(lang, 'next')}
              </button>
            )}
            {scenario.module && (
              <Link className="btn-secondary" to={`/learn/${scenario.module.id}`}>
                {t(lang, 'takeQuiz')}
              </Link>
            )}
            <Link className="btn-secondary" to="/stories">
              {t(lang, 'stories')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
