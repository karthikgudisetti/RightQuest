import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { ageGuide, CHOICE_ICONS, sceneThemeFromTitle } from '../lib/ageGuide';
import { XpBurst } from '../components/GameEffects';
import { StoryTheater, pickStoryCharacter } from '../components/StoryTheater';
import { gameGuide, speak, stopSpeech } from '../lib/voice';

type Choice = { id: string; choiceText: string; nextScenarioId?: string | null };
type Scenario = {
  id: string;
  title: string;
  description?: string;
  story: string;
  choices: Choice[];
  module?: { id: string; title: string };
};

export function ScenarioPlayerPage() {
  const { id } = useParams();
  const { lang, ageGroup, refreshMe } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const guides = gameGuide(lang);
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [phase, setPhase] = useState<'intro' | 'choose' | 'result'>('intro');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    nextScenarioId?: string | null;
    xpAwarded: number;
    badges: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setFeedback(null);
    setPhase('intro');
    stopSpeech();
    api<{ scenario: Scenario }>(`/scenarios/${id}?lang=${lang}`).then((d) => setScenario(d.scenario));
    return () => stopSpeech();
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
      setPhase('result');
      speak(
        `${res.isCorrect ? guide.feedbackGood : guide.feedbackLearn}. ${res.explanation}`,
        lang
      );
      if (res.isCorrect && guide.confetti) setBurst(true);
    } finally {
      setBusy(false);
    }
  }

  if (!scenario) {
    return <div className="panel p-10 text-center font-bold text-[#12352f]">Loading story theater...</div>;
  }

  const theme = sceneThemeFromTitle(scenario.title, scenario.description || scenario.story);
  const characterKey = pickStoryCharacter(scenario.title);

  return (
    <div className="animate-rise mx-auto max-w-3xl space-y-4">
      <XpBurst show={burst} xp={feedback?.xpAwarded} label={guide.feedbackGood} onDone={() => setBurst(false)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0d6b63]">🎬 {guides.story.title}</p>
          <h1 className={`font-display font-bold text-[#12352f] ${guide.titleScale}`}>{scenario.title}</h1>
        </div>
      </div>

      <div className="guide-box">
        <h3>{lang === 'hi' ? 'सीधी समझ' : 'Simple guide'}</h3>
        <p>{guides.story.how}</p>
        <p className="!mt-2 font-bold text-[#0d6b63]">{guides.story.tip}</p>
      </div>

      <div className="panel p-4 md:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{theme.emoji}</span>
          <span className="chip">{lang === 'hi' ? 'किरदार दृश्य' : 'Character scene'}</span>
        </div>
        <StoryTheater
          title={scenario.title}
          story={scenario.story}
          lang={lang}
          characterKey={characterKey}
        />
      </div>

      {phase === 'intro' && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setPhase('choose');
            speak(guide.choicePrompt, lang);
          }}
        >
          {guide.choicePrompt} →
        </button>
      )}

      {phase === 'choose' && (
        <div className="panel p-5">
          <p className="font-extrabold text-[#12352f]">{guide.choicePrompt}</p>
          <div className="mt-4 grid gap-3 stagger">
            {scenario.choices.map((c, i) => (
              <button
                key={c.id}
                type="button"
                disabled={busy}
                className="choice-door"
                onClick={() => answer(c.id)}
              >
                <span className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f2] text-xl">
                    {CHOICE_ICONS[i % CHOICE_ICONS.length]}
                  </span>
                  <span className="pt-1.5 text-[#12352f]">{c.choiceText}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && feedback && (
        <div
          className={`panel animate-pop p-5 ${
            feedback.isCorrect ? 'border-emerald-300' : 'border-amber-300'
          }`}
        >
          <p className="text-xl font-extrabold text-[#12352f]">
            {feedback.isCorrect ? `✨ ${guide.feedbackGood}` : `💡 ${guide.feedbackLearn}`}
          </p>
          <p className={`mt-3 text-[#12352f] ${guide.textScale}`}>{feedback.explanation}</p>
          <p className="mt-3 font-bold text-[#b45309]">
            +{feedback.xpAwarded} XP{feedback.badges ? ` · ${feedback.badges}` : ''}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {feedback.nextScenarioId && (
              <button className="btn-primary" type="button" onClick={() => navigate(`/stories/${feedback.nextScenarioId}`)}>
                {t(lang, 'next')}
              </button>
            )}
            {scenario.module && (
              <Link className="btn-secondary" to={`/learn/${scenario.module.id}`}>
                {t(lang, 'takeQuiz')}
              </Link>
            )}
            <Link className="btn-secondary" to="/games">
              More Games
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
