import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t, type Lang } from '../lib/i18n';
import { CHAR_ART } from '../lib/characters';
import { speak } from '../lib/voice';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  topic?: string;
  sources?: { title?: string; ref?: string | null }[];
  safety?: boolean;
};

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const STARTERS = [
  {
    en: 'What are children’s rights?',
    hi: 'बच्चों के अधिकार क्या हैं?',
    te: 'బాల హక్కులు అంటే ఏమిటి?',
  },
  {
    en: 'Someone asked for my password online. What should I do?',
    hi: 'किसी ने ऑनलाइन पासवर्ड माँगा। मैं क्या करूँ?',
    te: 'ఎవరో ఆన్‌లైన్‌లో పాస్‌వర్డ్ అడిగారు. నేను ఏమి చేయాలి?',
  },
  {
    en: 'What is Childline 1098?',
    hi: 'चाइल्डलाइन 1098 क्या है?',
    te: 'చైల్డ్‌లైన్ 1098 అంటే ఏమిటి?',
  },
  {
    en: 'I feel left out at school. How can I ask for help?',
    hi: 'स्कूल में अकेला लगता है। मदद कैसे माँगूँ?',
    te: 'స్కూల్‌లో ఒంటరిగా ఉన్నట్టు ఉంది. సహాయం ఎలా అడగాలి?',
  },
];

export function TutorPage() {
  const { lang } = useAuth();
  const [question, setQuestion] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMsgs([
      {
        id: 'welcome',
        role: 'assistant',
        text: L(
          lang,
          'Hi! I’m RightsQuest Buddy 👋\n\nI chat like a friendly helper — only about children’s rights, safety, school, online care, and how to ask for help.\n\nAsk me anything in that area, or tap a suggestion below.',
          'नमस्ते! मैं राइट्सक्वेस्ट बडी हूँ 👋\n\nमैं दोस्ताना मददगार की तरह चैट करता हूँ — सिर्फ़ बच्चों के अधिकार, सुरक्षा, स्कूल, ऑनलाइन सावधानी और मदद माँगने पर।\n\nअपना सवाल पूछो, या नीचे सुझाव टैप करो।',
          'హాయ్! నేను రైట్స్‌క్వెస్ట్ బడీ 👋\n\nస్నేహపూర్వక సహాయకుడిలా చాట్ చేస్తాను — బాల హక్కులు, భద్రత, స్కూల్, ఆన్‌లైన్ జాగ్రత్త, సహాయం అడగడం గురించి మాత్రమే.\n\nఅడగండి, లేదా కింది సూచనను ట్యాప్ చేయండి.'
        ),
      },
    ]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;

    const history = msgs
      .filter((m) => m.id !== 'welcome')
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.text }));

    setMsgs((m) => [...m, { id: uid(), role: 'user', text: q }]);
    setQuestion('');
    setBusy(true);

    try {
      const res = await api<{
        answer: string;
        topic: string;
        sources: { title?: string; ref?: string | null }[];
        safety_notice: boolean;
        ai?: boolean;
      }>('/ai/tutor', {
        method: 'POST',
        body: JSON.stringify({ question: q, language: lang, history }),
      });

      setMsgs((m) => [
        ...m,
        {
          id: uid(),
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
        {
          id: uid(),
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Something went wrong. Try again.',
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(question);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(question);
    }
  }

  return (
    <div className="animate-rise mx-auto flex h-[calc(100vh-7.5rem)] max-w-3xl flex-col md:h-[calc(100vh-8.5rem)]">
      <header className="mb-3 flex items-center gap-3 rounded-2xl border border-[#d5e5e0] bg-white px-4 py-3 shadow-sm">
        <img
          src={CHAR_ART.fox}
          alt=""
          className="h-12 w-12 rounded-xl object-cover char-frame"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-[#0f2a26]">
            {L(lang, 'RightsQuest Buddy', 'राइट्सक्वेस्ट बडी', 'రైట్స్‌క్వెస్ట్ బడీ')}
          </h1>
          <p className="truncate text-xs font-semibold text-[#3d5c56]">
            {L(
              lang,
              'Friendly chat · children’s rights only',
              'दोस्ताना चैट · सिर्फ़ बाल अधिकार',
              'స్నేహపూర్వక చాట్ · బాల హక్కులు మాత్రమే'
            )}
          </p>
        </div>
        <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#065f56] sm:inline">
          AI Tutor
        </span>
      </header>

      <div className="tutor-chat flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#d5e5e0] bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-5">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <img
                  src={CHAR_ART.fox}
                  alt=""
                  className="mt-1 h-8 w-8 shrink-0 rounded-lg object-cover"
                />
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[78%] ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-[#0d6b63] text-white'
                    : m.safety
                      ? 'rounded-bl-md border border-amber-300 bg-amber-50 text-[#12352f]'
                      : 'rounded-bl-md border border-[#e2ece8] bg-[#f6faf8] text-[#12352f]'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.role === 'assistant' && m.topic && m.topic !== 'Unknown' && (
                  <p className="mt-2 text-[11px] font-bold text-[#0d6b63]">
                    {L(lang, 'Topic', 'विषय', 'అంశం')}: {m.topic}
                  </p>
                )}
                {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-[#5a736c]">
                    {L(lang, 'Source', 'स्रोत', 'మూలం')}:{' '}
                    {m.sources.map((s) => s.title || s.ref).filter(Boolean).join(', ')}
                  </p>
                )}
                {m.role === 'assistant' && (
                  <button
                    type="button"
                    className="mt-2 text-[11px] font-bold text-[#0a4f49] underline-offset-2 hover:underline"
                    onClick={() => speak(m.text, lang)}
                  >
                    🔊 {L(lang, 'Listen', 'सुनो', 'వినండి')}
                  </button>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-sm font-semibold text-[#3d5c56]">
              <img src={CHAR_ART.fox} alt="" className="h-8 w-8 rounded-lg object-cover opacity-80" />
              <span className="tutor-typing">
                {L(lang, 'Buddy is typing…', 'बडी लिख रहा है…', 'బడీ టైప్ చేస్తోంది…')}
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {msgs.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-[#eef4f1] px-3 py-3 md:px-5">
            {STARTERS.map((s) => {
              const label = s[lang] || s.en;
              return (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-[#d5e5e0] bg-[#f8fbfa] px-3 py-1.5 text-left text-xs font-bold text-[#0a4f49] transition hover:border-[#0d6b63] hover:bg-white"
                  onClick={() => void send(label)}
                  disabled={busy}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <form
          className="border-t border-[#eef4f1] bg-[#fbfdfc] px-3 py-3 md:px-4"
          onSubmit={onSubmit}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-[#d5e5e0] bg-white p-2 shadow-sm focus-within:border-[#0d6b63]">
            <textarea
              ref={inputRef}
              rows={1}
              className="max-h-28 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm font-semibold text-[#0f2a26] outline-none placeholder:text-[#8aa39c]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={L(
                lang,
                'Message RightsQuest Buddy…',
                'राइट्सक्वेस्ट बडी को संदेश…',
                'రైట్స్‌క్వెస్ట్ బడీకి సందేశం…'
              )}
              disabled={busy}
            />
            <button
              className="btn-primary !rounded-xl !px-4 !py-2.5 text-sm"
              disabled={busy || !question.trim()}
              type="submit"
            >
              {busy ? '…' : t(lang, 'ask')}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] font-semibold text-[#6b857e]">
            {t(lang, 'disclaimer')} · 1098
          </p>
        </form>
      </div>
    </div>
  );
}
