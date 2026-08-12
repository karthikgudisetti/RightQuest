import { useMemo, useState } from 'react';
import { speak } from '../lib/voice';
import type { Lang } from '../lib/i18n';

type Pos = { r: number; c: number };

type TrailLevel = {
  size: number;
  /** Fixed numbered checkpoints (1..n). Player fills a path visiting every cell, hitting numbers in order. */
  marks: Record<string, number>;
  message: { en: string; hi: string; te: string };
  label: { en: string; hi: string; te: string };
};

function key(r: number, c: number) {
  return `${r},${c}`;
}

const LEVELS: TrailLevel[] = [
  {
    size: 3,
    label: { en: 'Level 1 · Easy', hi: 'लेवल 1 · आसान', te: 'లెవల్ 1 · సులభం' },
    marks: { '0,0': 1, '2,2': 9 },
    message: {
      en: 'A safe path is step by step. When unsure, pause and ask a trusted adult.',
      hi: 'सुरक्षित रास्ता कदम-दर-कदम होता है। शक हो तो रुककर भरोसेमंद वयस्क से पूछो।',
      te: 'సురక్షిత మార్గం అడుగడుగునా. సందేహం ఉంటే ఆగి నమ్మకమైన పెద్దవారిని అడగండి.',
    },
  },
  {
    size: 4,
    label: { en: 'Level 2 · Medium', hi: 'लेवल 2 · मध्यम', te: 'లెవల్ 2 · మధ్యస్థం' },
    // Solvable snake-style: 1 → 8 → 16 (checkerboard-valid end)
    marks: { '0,0': 1, '1,0': 8, '3,0': 16 },
    message: {
      en: 'Online, choose the safe route: block, report, and never share OTP or location.',
      hi: 'ऑनलाइन सुरक्षित रास्ता चुनो: ब्लॉक/रिपोर्ट करो, OTP या लोकेशन न बाँटो।',
      te: 'ఆన్‌లైన్‌లో సురక్షిత మార్గం: బ్లాక్/రిపోర్ట్ చేయండి, OTP లేదా లొకేషన్ ఇవ్వవద్దు.',
    },
  },
  {
    size: 5,
    label: { en: 'Level 3 · Hard', hi: 'लेवल 3 · कठिन', te: 'లెవల్ 3 · కష్టం' },
    marks: { '0,0': 1, '2,2': 13, '4,4': 25 },
    message: {
      en: 'Your safety trail matters. Childline 1098 can help if you feel stuck or scared.',
      hi: 'तुम्हारी सुरक्षा मायने रखती है। अटक या डर लगे तो चाइल्डलाइन 1098 मदद कर सकती है।',
      te: 'మీ భద్రత ముఖ్యం. చిక్కుకున్నట్టు లేదా భయంగా ఉంటే చైల్డ్‌లైన్ 1098 సహాయం చేస్తుంది.',
    },
  },
];

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

function adj(a: Pos, b: Pos) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function SafeTrailGame({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [path, setPath] = useState<Pos[]>([]);
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [hint, setHint] = useState('');

  const level = LEVELS[levelIdx];
  const total = level.size * level.size;
  const markEntries = useMemo(
    () =>
      Object.entries(level.marks)
        .map(([k, v]) => {
          const [r, c] = k.split(',').map(Number);
          return { r, c, n: v };
        })
        .sort((a, b) => a.n - b.n),
    [level]
  );

  function reset() {
    setPath([]);
    setDone(false);
    setHint('');
  }

  function pathValidSoFar(next: Pos[]): boolean {
    if (next.length === 0) return true;
    // must start at mark 1
    const start = markEntries[0];
    if (next[0].r !== start.r || next[0].c !== start.c) return false;
    for (let i = 1; i < next.length; i++) {
      if (!adj(next[i - 1], next[i])) return false;
      // no revisit
      for (let j = 0; j < i; j++) {
        if (next[j].r === next[i].r && next[j].c === next[i].c) return false;
      }
    }
    // if cell has a mark, path length must equal that mark number
    for (let i = 0; i < next.length; i++) {
      const m = level.marks[key(next[i].r, next[i].c)];
      if (m != null && m !== i + 1) return false;
    }
    return true;
  }

  function onTap(r: number, c: number) {
    if (done) return;
    const pos = { r, c };
    const prev = path;

    // undo last
    if (prev.length && prev[prev.length - 1].r === r && prev[prev.length - 1].c === c) {
      return;
    }
    if (prev.length >= 2 && prev[prev.length - 2].r === r && prev[prev.length - 2].c === c) {
      setHint('');
      setPath(prev.slice(0, -1));
      return;
    }
    if (prev.some((p) => p.r === r && p.c === c)) {
      setHint(L(lang, 'Already on path — Clear to restart', 'पहले से पथ पर — साफ़ करो', 'ఇప్పటికే పాత్‌లో ఉంది — క్లియర్ చేయండి'));
      return;
    }

    let next: Pos[];
    if (prev.length === 0) {
      next = [pos];
    } else if (!adj(prev[prev.length - 1], pos)) {
      setHint(L(lang, 'Tap a neighbour cell', 'पड़ोसी घर टैप करो', 'పక్క సెల్ ట్యాప్ చేయండి'));
      return;
    } else {
      next = [...prev, pos];
    }

    if (!pathValidSoFar(next)) {
      setHint(L(lang, 'Wrong step — try another cell', 'गलत कदम — दूसरा घर आज़माओ', 'తప్పు అడుగు — మరో సెల్ ప్రయత్నించండి'));
      return;
    }

    setHint('');
    setPath(next);
    if (next.length === total) {
      setDone(true);
      const msg = level.message[lang] || level.message.en;
      queueMicrotask(() => {
        speak(msg, lang);
        onWin(18 + levelIdx * 10);
      });
      if (levelIdx >= LEVELS.length - 1) setAllDone(true);
    }
  }

  function goNext() {
    if (levelIdx >= LEVELS.length - 1) return;
    setLevelIdx((i) => i + 1);
    reset();
    speak(L(lang, 'Next trail unlocked!', 'अगला ट्रेल खुला!', 'తదుపరి ట్రైల్ అన్‌లాక్!'), lang);
  }

  const order = new Map(path.map((p, i) => [key(p.r, p.c), i + 1]));

  return (
    <div className="game-board">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-[#065f56]">{level.label[lang] || level.label.en}</p>
          <p className="text-xs font-semibold text-[#3a5f58]">
            {L(
              lang,
              'Tap cells to draw a path from 1 → last number. Fill every square.',
              '1 से आख़िरी नंबर तक पथ बनाओ। हर घर भरो।',
              '1 నుండి చివరి నంబర్ వరకు పాత్ గీయండి. ప్రతి సెల్ నింపండి.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {LEVELS.map((_, i) => (
              <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < levelIdx ? 'bg-emerald-500' : i === levelIdx ? 'bg-amber-400' : 'bg-slate-300'}`} />
            ))}
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-[#065f56]">
            {path.length}/{total}
          </span>
        </div>
      </div>

      <div
        className="trail-grid mx-auto"
        style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`, maxWidth: 56 * level.size }}
      >
        {Array.from({ length: level.size }, (_, r) =>
          Array.from({ length: level.size }, (_, c) => {
            const mk = level.marks[key(r, c)];
            const n = order.get(key(r, c));
            const on = n != null;
            return (
              <button
                key={key(r, c)}
                type="button"
                className={`trail-cell ${on ? 'on' : ''} ${mk ? 'marked' : ''}`}
                onClick={() => onTap(r, c)}
              >
                {mk ?? n ?? ''}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary !py-2 text-sm" onClick={reset}>
          {L(lang, 'Clear path', 'पथ साफ़', 'పాత్ క్లియర్')}
        </button>
        {hint && <p className="self-center text-sm font-bold text-[#b45309]">{hint}</p>}
      </div>

      {done && (
        <div className="message-glow mt-4 animate-pop">
          <p className="text-xs font-bold text-[#b45309]">{L(lang, 'Trail message', 'ट्रेल संदेश', 'ట్రైల్ సందేశం')}</p>
          <p className="mt-1 font-extrabold text-[#0c2e2a]">{level.message[lang] || level.message.en}</p>
          {!allDone && (
            <button type="button" className="btn-primary mt-3" onClick={goNext}>
              {L(lang, 'Next puzzle →', 'अगला पज़ल →', 'తదుపరి పజిల్ →')}
            </button>
          )}
          {allDone && (
            <p className="mt-3 font-extrabold text-[#0b7a6f]">
              {L(lang, 'All trails cleared!', 'सभी ट्रेल पूरे!', 'అన్ని ట్రైల్స్ పూర్తి!')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
