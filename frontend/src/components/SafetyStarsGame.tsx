import { useState } from 'react';
import { speak } from '../lib/voice';
import type { Lang } from '../lib/i18n';

type StarLevel = {
  size: number;
  label: { en: string; hi: string; te: string };
  blocked: string[];
  /** One known valid solution (for hint button) */
  solution: string[];
  message: { en: string; hi: string; te: string };
};

function key(r: number, c: number) {
  return `${r},${c}`;
}

/** Rook-style: one star per row & column. Always solvable. */
const LEVELS: StarLevel[] = [
  {
    size: 4,
    label: { en: 'Level 1 · Easy', hi: 'लेवल 1 · आसान', te: 'లెవల్ 1 · సులభం' },
    blocked: ['0,1', '1,2', '2,3', '3,0'],
    solution: ['0,0', '1,1', '2,2', '3,3'],
    message: {
      en: 'One safe helper in each space — like one trusted adult you can talk to.',
      hi: 'हर जगह एक सुरक्षित मददगार — जैसे एक भरोसेमंद वयस्क।',
      te: 'ప్రతి స్థలంలో ఒక సురక్షిత సహాయకుడు — నమ్మకమైన పెద్దవారు లాగా.',
    },
  },
  {
    size: 4,
    label: { en: 'Level 2 · Medium', hi: 'लेवल 2 · मध्यम', te: 'లెవల్ 2 · మధ్యస్థం' },
    blocked: ['0,0', '1,1', '2,2', '3,3'],
    solution: ['0,1', '1,0', '2,3', '3,2'],
    message: {
      en: 'Boundaries protect you. Say no when someone crosses your line.',
      hi: 'सीमाएँ तुम्हारी रक्षा करती हैं। ज़रूरत हो तो ना कहो।',
      te: 'హద్దులు మిమ్మల్ని కాపాడతాయి. అవసరమైతే నో చెప్పండి.',
    },
  },
  {
    size: 5,
    label: { en: 'Level 3 · Hard', hi: 'लेवल 3 · कठिन', te: 'లెవల్ 3 · కష్టం' },
    blocked: ['0,2', '1,4', '2,0', '3,1', '4,3'],
    solution: ['0,0', '1,2', '2,4', '3,3', '4,1'],
    message: {
      en: 'You deserve protection everywhere. Tell a teacher or call 1098 if needed.',
      hi: 'हर जगह सुरक्षा तुम्हारा अधिकार है। ज़रूरत हो तो शिक्षक या 1098।',
      te: 'ఎక్కడైనా రక్షణ మీ హక్కు. అవసరమైతే టీచర్ లేదా 1098.',
    },
  },
];

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

function isSafe(stars: Set<string>, r: number, c: number) {
  for (const s of stars) {
    const [sr, sc] = s.split(',').map(Number);
    if (sr === r || sc === c) return false;
  }
  return true;
}

export function SafetyStarsGame({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [stars, setStars] = useState<Set<string>>(() => new Set());
  const [hint, setHint] = useState('');
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const level = LEVELS[levelIdx];
  const blocked = new Set(level.blocked);
  const need = level.size;

  function reset() {
    setStars(new Set());
    setHint('');
    setDone(false);
  }

  function toggle(r: number, c: number) {
    if (done || blocked.has(key(r, c))) return;
    const k = key(r, c);

    if (stars.has(k)) {
      const next = new Set(stars);
      next.delete(k);
      setStars(next);
      setHint('');
      return;
    }

    if (!isSafe(stars, r, c)) {
      setHint(
        L(
          lang,
          'Same row or column already has a star. Try another cell.',
          'उसी पंक्ति/स्तंभ में स्टार है। दूसरा घर चुनो।',
          'అదే అడ్డు/నిలువులో స్టార్ ఉంది. మరో సెల్ ఎంచుకోండి.'
        )
      );
      return;
    }

    const next = new Set(stars);
    next.add(k);
    setStars(next);
    setHint('');

    if (next.size === need) {
      setDone(true);
      const msg = level.message[lang] || level.message.en;
      queueMicrotask(() => {
        speak(msg, lang);
        onWin(20 + levelIdx * 10);
      });
      if (levelIdx >= LEVELS.length - 1) setAllDone(true);
    }
  }

  function showHint() {
    const missing = level.solution.find((s) => !stars.has(s) && !blocked.has(s));
    if (!missing) {
      setHint(L(lang, 'You are close — keep going!', 'लगभग हो गया — जारी रखो!', 'దగ్గరలో ఉన్నారు — కొనసాగించండి!'));
      return;
    }
    const [r, c] = missing.split(',').map(Number);
    setHint(
      L(lang, `Hint: try row ${r + 1}, column ${c + 1}`, `संकेत: पंक्ति ${r + 1}, स्तंभ ${c + 1}`, `సూచన: అడ్డు ${r + 1}, నిలువు ${c + 1}`)
    );
  }

  function goNext() {
    if (levelIdx >= LEVELS.length - 1) return;
    setLevelIdx((i) => i + 1);
    reset();
    speak(L(lang, 'Next star puzzle!', 'अगला स्टार पज़ल!', 'తదుపరి స్టార్ పజిల్!'), lang);
  }

  return (
    <div className="game-board">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-[#0a4f49]">{level.label[lang] || level.label.en}</p>
          <p className="text-xs font-semibold text-[#3d5c56]">
            {L(
              lang,
              `Tap to place ${need} stars — one in every row and column. Grey = blocked.`,
              `${need} स्टार लगाओ — हर पंक्ति व स्तंभ में एक। धूसर = बंद।`,
              `${need} స్టార్స్ — ప్రతి అడ్డు/నిలువులో ఒకటి. బూడిద = బ్లాక్.`
            )}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-[#92400e]">
          {stars.size}/{need}
        </span>
      </div>

      <div
        className="stars-grid mx-auto"
        style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`, maxWidth: 56 * level.size }}
      >
        {Array.from({ length: level.size }, (_, r) =>
          Array.from({ length: level.size }, (_, c) => {
            const k = key(r, c);
            const isBlock = blocked.has(k);
            const has = stars.has(k);
            return (
              <button
                key={k}
                type="button"
                disabled={isBlock || done}
                className={`stars-cell ${isBlock ? 'blocked' : ''} ${has ? 'star' : ''}`}
                onClick={() => toggle(r, c)}
                aria-label={isBlock ? 'blocked' : has ? 'star' : `row ${r + 1} col ${c + 1}`}
              >
                {isBlock ? '' : has ? '⭐' : ''}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary !py-2 text-sm" onClick={reset}>
          {L(lang, 'Clear', 'साफ़', 'క్లియర్')}
        </button>
        <button type="button" className="btn-secondary !py-2 text-sm" onClick={showHint} disabled={done}>
          {L(lang, 'Hint', 'संकेत', 'సూచన')}
        </button>
        {hint && <p className="self-center text-sm font-bold text-[#b45309]">{hint}</p>}
      </div>

      {done && (
        <div className="message-glow mt-4 animate-pop">
          <p className="text-xs font-bold text-[#b45309]">{L(lang, 'Protection message', 'सुरक्षा संदेश', 'రక్షణ సందేశం')}</p>
          <p className="mt-1 font-extrabold text-[#0c2e2a]">{level.message[lang] || level.message.en}</p>
          {!allDone && (
            <button type="button" className="btn-primary mt-3" onClick={goNext}>
              {L(lang, 'Next puzzle →', 'अगला पज़ल →', 'తదుపరి పజిల్ →')}
            </button>
          )}
          {allDone && (
            <p className="mt-3 font-extrabold text-[#0b7a6f]">
              {L(lang, 'All star puzzles cleared!', 'सभी स्टार पज़ल पूरे!', 'అన్ని స్టార్ పజిల్స్ పూర్తి!')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
