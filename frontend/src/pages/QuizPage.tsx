import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { ageGuide } from '../lib/ageGuide';
import { Mascot, ProgressRing, XpBurst } from '../components/GameEffects';
import { VoiceButton } from '../components/StoryTheater';
import { speak } from '../lib/voice';
import { CHAR_ART } from '../lib/characters';

type Answer = { id: string; answerText: string };
type Question = { id: string; question: string; answers: Answer[] };
type Quiz = {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
};

export function QuizPage() {
  const { id } = useParams();
  const { lang, ageGroup, refreshMe } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [burst, setBurst] = useState(false);
  const [result, setResult] = useState<{
    percentage: number;
    passed: boolean;
    isPerfect: boolean;
    score: number;
    total: number;
    breakdown: { question: string; isCorrect: boolean; explanation: string }[];
    xp: number;
    badges: string;
  } | null>(null);

  useEffect(() => {
    api<{ quiz: Quiz }>(`/quizzes/${id}`).then((d) => {
      setQuiz(d.quiz);
      speak(`${d.quiz.title}. ${guide.quizPrompt}`, lang);
    });
  }, [id, lang]);

  async function submit(finalAnswers: Record<string, string>) {
    if (!quiz) return;
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      answerId: finalAnswers[q.id],
    }));
    const res = await api<{
      result: {
        percentage: number;
        passed: boolean;
        isPerfect: boolean;
        score: number;
        total: number;
        breakdown: { question: string; isCorrect: boolean; explanation: string }[];
      };
      reward: { xpAwarded: number; unlockedBadges: { icon: string; name: string }[] };
    }>(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: payload }),
    });
    await refreshMe();
    setResult({
      ...res.result,
      xp: res.reward.xpAwarded,
      badges: res.reward.unlockedBadges.map((b) => `${b.icon} ${b.name}`).join(', '),
    });
    if (res.result.passed) setBurst(true);
  }

  function pick(answerId: string) {
    if (!quiz) return;
    const q = quiz.questions[index];
    const next = { ...answers, [q.id]: answerId };
    setAnswers(next);
    setTimeout(() => {
      if (index < quiz.questions.length - 1) setIndex((i) => i + 1);
      else submit(next);
    }, 250);
  }

  if (!quiz) return <div className="panel p-8 text-center font-bold text-[#12352f]">Loading quiz...</div>;

  if (result) {
    return (
      <div className="animate-pop mx-auto max-w-2xl space-y-4">
        <XpBurst
          show={burst}
          xp={result.xp}
          label={result.passed ? guide.feedbackGood : guide.feedbackLearn}
          onDone={() => setBurst(false)}
        />
        <div className="panel p-6 md:p-8">
          <div className="flex items-center gap-4">
            {guide.showMascot && <Mascot mood={result.passed ? 'cheer' : 'think'} />}
            <div className="flex-1">
              <p className="eyebrow text-[#0d6b63]">Quiz Result</p>
              <h1 className={`mt-1 font-display font-bold text-[#12352f] ${guide.titleScale}`}>
                {result.passed ? 'Well done!' : 'Keep practicing'}
              </h1>
              <p className="mt-2 font-bold text-[#12352f]">
                {result.score}/{result.total} correct · {result.percentage}%
              </p>
              <p className="mt-1 font-bold text-[#b45309]">
                +{result.xp} XP{result.badges ? ` · ${result.badges}` : ''}
              </p>
            </div>
            <ProgressRing value={result.percentage} />
          </div>
        </div>
        <ul className="space-y-3">
          {result.breakdown.map((b, i) => (
            <li
              key={i}
              className={`panel p-4 text-sm ${
                b.isCorrect ? 'border-emerald-200' : 'border-amber-200'
              }`}
            >
              <p className="font-bold text-[#12352f]">
                {b.isCorrect ? '✓' : '○'} {b.question}
              </p>
              {b.explanation && <p className="mt-1 muted">{b.explanation}</p>}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" to="/games">
            Play Games
          </Link>
          <Link className="btn-secondary" to="/progress">
            {t(lang, 'progress')}
          </Link>
          <Link className="btn-secondary" to="/badges">
            {t(lang, 'badges')}
          </Link>
        </div>
      </div>
    );
  }

  const q = quiz.questions[index];
  const progress = (index / quiz.questions.length) * 100;

  return (
    <div className="animate-rise mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0d6b63]">Quiz Challenge</p>
          <h1 className={`font-display font-bold text-[#12352f] ${guide.titleScale}`}>{quiz.title}</h1>
        </div>
        <ProgressRing value={progress} />
      </div>
      <p className="mb-4 rounded-xl border border-[#d7e8e3] bg-white px-4 py-3 text-sm font-semibold text-[#12352f]">
        {guide.quizPrompt}
      </p>
      {q && (
        <div className="mb-3">
          <VoiceButton text={q.question} lang={lang} />
        </div>
      )}

      <div className="panel p-5 md:p-7">
        <div className="mb-3 flex items-center gap-3">
          <img src={CHAR_ART.fox} alt="" className="h-12 w-12 rounded-xl object-cover char-frame" />
          <p className="text-sm font-bold text-[#0d6b63]">
            Question {index + 1} / {quiz.questions.length}
          </p>
        </div>
        <p className={`mt-3 font-extrabold leading-snug text-[#12352f] ${guide.textScale}`}>{q.question}</p>
        <div className="mt-5 grid gap-3 stagger">
          {q.answers.map((a, i) => (
            <button
              key={a.id}
              type="button"
              className={`choice-door ${answers[q.id] === a.id ? '!border-[#0d6b63] !bg-[#e8f6f2]' : ''}`}
              onClick={() => pick(a.id)}
            >
              <span className="flex items-center gap-3 text-[#12352f]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d6b63] text-sm font-bold text-white">
                  {String.fromCharCode(65 + i)}
                </span>
                {a.answerText}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
