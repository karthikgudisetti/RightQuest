import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Answer = { id: string; answerText: string };
type Question = { id: string; question: string; answers: Answer[] };
type Quiz = {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
  module?: { id: string; title: string };
};

export function QuizPage() {
  const { id } = useParams();
  const { lang, refreshMe } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
    api<{ quiz: Quiz }>(`/quizzes/${id}`).then((d) => setQuiz(d.quiz));
  }, [id]);

  async function submit() {
    if (!quiz) return;
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      answerId: answers[q.id],
    }));
    if (payload.some((p) => !p.answerId)) {
      alert('Please answer all questions');
      return;
    }
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
  }

  if (!quiz) return <p>Loading quiz...</p>;

  if (result) {
    return (
      <div className="animate-pop mx-auto max-w-2xl panel p-8">
        <h1 className="font-display text-3xl font-bold">
          {result.passed ? 'You passed!' : 'Keep learning!'}
        </h1>
        <p className="mt-3 text-xl font-bold text-teal-800">
          Score: {result.score}/{result.total} ({result.percentage}%)
        </p>
        <p className="mt-2 font-bold text-orange-600">
          +{result.xp} XP
          {result.badges ? ` · ${result.badges}` : ''}
        </p>
        <ul className="mt-6 space-y-3">
          {result.breakdown.map((b, i) => (
            <li key={i} className="rounded-xl bg-teal-50 p-3 text-sm">
              <p className="font-bold">
                {b.isCorrect ? '✓' : '○'} {b.question}
              </p>
              {b.explanation && <p className="mt-1 text-teal-900/70">{b.explanation}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-3">
          <Link className="btn-primary" to="/progress">
            {t(lang, 'progress')}
          </Link>
          <Link className="btn-secondary" to="/badges">
            {t(lang, 'badges')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">{quiz.title}</h1>
      <p className="mt-2 text-sm text-teal-900/70">Passing score: {quiz.passingScore}%</p>
      <div className="mt-6 space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="panel p-5">
            <p className="font-extrabold">
              {idx + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.answers.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${
                    answers[q.id] === a.id ? 'bg-teal-700 text-white' : 'bg-teal-50'
                  }`}
                >
                  <input
                    type="radio"
                    className="accent-teal-700"
                    name={q.id}
                    checked={answers[q.id] === a.id}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: a.id }))}
                  />
                  <span className="font-semibold">{a.answerText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6" type="button" onClick={submit}>
        {t(lang, 'submit')}
      </button>
    </div>
  );
}
