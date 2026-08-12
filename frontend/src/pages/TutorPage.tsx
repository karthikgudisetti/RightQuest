import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Msg = {
  role: 'user' | 'assistant';
  text: string;
  topic?: string;
  sources?: { title?: string; ref?: string | null }[];
  safety?: boolean;
};

export function TutorPage() {
  const { lang } = useAuth();
  const [question, setQuestion] = useState('What does my right to education mean?');
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      text:
        lang === 'hi'
          ? 'नमस्ते! मैं आपका शैक्षिक सहायकल हूँ। बच्चों के अधिकारों के बारे में पूछें।'
          : 'Hi! I am your educational tutor. Ask about children\'s rights. I only use approved knowledge.',
    },
  ]);
  const [busy, setBusy] = useState(false);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setQuestion('');
    setBusy(true);
    try {
      const res = await api<{
        answer: string;
        topic: string;
        sources: { title?: string; ref?: string | null }[];
        safety_notice: boolean;
        disclaimer: string;
      }>('/ai/tutor', {
        method: 'POST',
        body: JSON.stringify({ question: q, language: lang }),
      });
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          text: res.answer,
          topic: res.topic,
          sources: res.sources,
          safety: res.safety_notice,
        },
      ]);
    } catch (err) {
      setMsgs((m) => [
        ...m,
        { role: 'assistant', text: err instanceof Error ? err.message : 'Something went wrong' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-rise mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'tutor')}</h1>
      <p className="mt-2 text-sm text-teal-900/70">{t(lang, 'disclaimer')}</p>
      <div className="panel mt-5 flex min-h-[420px] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'ml-auto bg-teal-700 text-white'
                  : m.safety
                    ? 'bg-orange-100 text-orange-950'
                    : 'bg-teal-50 text-teal-950'
              }`}
            >
              <p>{m.text}</p>
              {m.topic && m.topic !== 'Unknown' && (
                <p className="mt-2 text-xs font-bold opacity-70">Topic: {m.topic}</p>
              )}
              {m.sources && m.sources.length > 0 && (
                <p className="mt-1 text-xs opacity-70">
                  Sources: {m.sources.map((s) => s.title || s.ref).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={ask}>
          <input
            className="flex-1 rounded-xl border border-teal-900/15 bg-white px-4 py-3"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={lang === 'hi' ? 'अपना सवाल लिखें...' : 'Ask a learning question...'}
          />
          <button className="btn-primary" disabled={busy} type="submit">
            {t(lang, 'ask')}
          </button>
        </form>
      </div>
    </div>
  );
}
