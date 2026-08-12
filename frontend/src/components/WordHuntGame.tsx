import { useMemo, useState } from 'react';
import { speak } from '../lib/voice';
import type { Lang } from '../lib/i18n';

type Cell = string | null;
type Pos = { r: number; c: number };

type TargetWord = {
  word: string;
  msg: { en: string; hi: string; te: string };
};

type PuzzleLevel = {
  id: number;
  label: { en: string; hi: string; te: string };
  size: number;
  grid: Cell[][];
  words: TargetWord[];
  hideWords: boolean;
};

const LEVELS: PuzzleLevel[] = [
  {
    id: 1,
    label: { en: 'Level 1 · Easy', hi: 'लेवल 1 · आसान', te: 'లెవల్ 1 · సులభం' },
    size: 5,
    hideWords: false,
    grid: [
      ['S', 'A', 'F', 'E', 'Q'],
      ['H', 'E', 'L', 'P', 'M'],
      ['A', 'S', 'K', 'R', 'T'],
      ['C', 'A', 'R', 'E', 'N'],
      [null, 'V', 'O', 'I', 'X'],
    ],
    words: [
      {
        word: 'SAFE',
        msg: {
          en: 'You have the right to feel safe — at home, school, and online.',
          hi: 'तुम्हें घर, स्कूल और ऑनलाइन सुरक्षित महसूस करने का अधिकार है।',
          te: 'ఇంట్లో, స్కూల్‌లో, ఆన్‌లైన్‌లో సురక్షితంగా ఉండే హక్కు మీది.',
        },
      },
      {
        word: 'HELP',
        msg: {
          en: 'Asking for help is brave. Tell a trusted adult or call Childline 1098.',
          hi: 'मदद माँगना साहस है। भरोसेमंद वयस्क को बताओ या 1098 कॉल करो।',
          te: 'సహాయం అడగడం ధైర్యం. నమ్మకమైన పెద్దవారికి చెప్పండి లేదా 1098కి కాల్ చేయండి.',
        },
      },
      {
        word: 'CARE',
        msg: {
          en: 'Be kind to yourself and others. Kindness is a superpower.',
          hi: 'खुद और दूसरों के प्रति दयालु रहो। दया एक सुपरपावर है।',
          te: 'మీకు మరియు ఇతరులకు దయగా ఉండండి. దయ ఒక సూపర్‌పవర్.',
        },
      },
    ],
  },
  {
    id: 2,
    label: { en: 'Level 2 · Medium', hi: 'लेवल 2 · मध्यम', te: 'లెవల్ 2 · మధ్యస్థం' },
    size: 6,
    hideWords: false,
    grid: [
      ['R', 'I', 'G', 'H', 'T', 'K'],
      ['X', 'A', 'P', 'Q', 'U', 'I'],
      ['Z', 'L', 'M', 'N', 'S', 'N'],
      ['Y', 'E', 'O', 'B', 'F', 'D'],
      ['S', 'C', 'H', 'O', 'O', 'L'],
      ['W', 'T', 'R', 'U', 'S', 'T'],
    ],
    words: [
      {
        word: 'RIGHT',
        msg: {
          en: 'Every child has rights — to learn, play, and be protected.',
          hi: 'हर बच्चे के अधिकार हैं — सीखना, खेलना और सुरक्षा।',
          te: 'ప్రతి పిల్లవాడికి హక్కులు ఉన్నాయి — నేర్చుకోవడం, ఆడటం, రక్షణ.',
        },
      },
      {
        word: 'TRUST',
        msg: {
          en: 'Talk to people you trust. Scary secrets should be shared with a safe adult.',
          hi: 'जिन पर भरोसा हो उनसे बात करो। डरावने राज़ सुरक्षित वयस्क को बताओ।',
          te: 'మీరు నమ్మే వారితో మాట్లాడండి. భయపెట్టే రహస్యాలు సురక్షిత పెద్దవారికి చెప్పండి.',
        },
      },
      {
        word: 'SCHOOL',
        msg: {
          en: 'Education is your right. You belong in school and can ask questions.',
          hi: 'शिक्षा तुम्हारा अधिकार है। तुम स्कूल में हो और सवाल पूछ सकते हो।',
          te: 'విద్య మీ హక్కు. మీరు స్కూల్‌కి చెందినవారు — ప్రశ్నలు అడగవచ్చు.',
        },
      },
      {
        word: 'KIND',
        msg: {
          en: 'Choose kindness. Standing up for others keeps everyone safer.',
          hi: 'दया चुनो। दूसरों के लिए खड़े होना सबको सुरक्षित रखता है।',
          te: 'దయను ఎంచుకోండి. ఇతరులకు అండగా నిలవడం అందరినీ సురక్షితంగా ఉంచుతుంది.',
        },
      },
    ],
  },
  {
    id: 3,
    label: { en: 'Level 3 · Hard', hi: 'लेवल 3 · कठिन', te: 'లెవల్ 3 · కష్టం' },
    size: 7,
    hideWords: true,
    grid: [
      ['P', 'R', 'I', 'V', 'A', 'C', 'Y'],
      ['A', 'E', 'L', 'P', 'N', 'O', 'X'],
      ['R', 'E', 'S', 'P', 'E', 'C', 'T'],
      ['S', 'P', 'E', 'A', 'K', 'S', 'D'],
      ['W', 'E', 'L', 'F', 'A', 'R', 'E'],
      ['O', 'C', 'T', 'U', 'Q', 'E', 'F'],
      ['B', 'F', 'A', 'M', 'I', 'L', 'Y'],
    ],
    words: [
      {
        word: 'PRIVACY',
        msg: {
          en: 'Your photos, password, and personal details are private. Never share them with strangers.',
          hi: 'फ़ोटो, पासवर्ड और निजी जानकारी गुप्त रखो। अजनबियों से कभी न बाँटो।',
          te: 'మీ ఫోటోలు, పాస్‌వర్డ్, వ్యక్తిగత వివరాలు రహస్యం. అపరిచితులతో ఎప్పుడూ పంచుకోవద్దు.',
        },
      },
      {
        word: 'RESPECT',
        msg: {
          en: 'Respect yourself and others. No one should hurt, bully, or shame you.',
          hi: 'खुद और दूसरों का सम्मान करो। कोई तुम्हें चोट या शर्म नहीं दे सकता।',
          te: 'మిమ్మల్ని మరియు ఇతరులను గౌరవించండి. ఎవరూ మిమ్మల్ని బాధించకూడదు.',
        },
      },
      {
        word: 'SPEAK',
        msg: {
          en: 'Your voice matters. Speak up if something feels wrong — you will be believed.',
          hi: 'तुम्हारी आवाज़ मायने रखती है। गलत लगे तो बोलो — तुम्हें माना जाएगा।',
          te: 'మీ గొంతు ముఖ్యం. తప్పుగా అనిపిస్తే మాట్లాడండి — మీ మాట నమ్మబడుతుంది.',
        },
      },
      {
        word: 'WELFARE',
        msg: {
          en: 'Adults and laws exist for your welfare. Childline 1098 is always there to help.',
          hi: 'वयस्क और क़ानून तुम्हारी भलाई के लिए हैं। चाइल्डलाइन 1098 हमेशा मदद के लिए है।',
          te: 'పెద్దవారు, చట్టాలు మీ సంక్షేమం కోసం. చైల్డ్‌లైన్ 1098 ఎల్లప్పుడూ సహాయం చేస్తుంది.',
        },
      },
      {
        word: 'FAMILY',
        msg: {
          en: 'A safe family protects you. If home feels unsafe, tell a teacher or call 1098.',
          hi: 'सुरक्षित परिवार तुम्हारी रक्षा करता है। घर असुरक्षित लगे तो शिक्षक को बताओ या 1098 कॉल करो।',
          te: 'సురక్షిత కుటుంబం మిమ్మల్ని కాపాడుతుంది. ఇల్లు అసురక్షితంగా ఉంటే టీచర్‌కి చెప్పండి లేదా 1098కి కాల్ చేయండి.',
        },
      },
    ],
  },
];

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

function msgFor(lang: Lang, t: TargetWord) {
  return t.msg[lang] || t.msg.en;
}

function isAdjacent(a: Pos, b: Pos) {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c)) === 1;
}

function findPlacements(grid: Cell[][], word: string): Pos[][] {
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const rows = grid.length;
  const cols = grid[0].length;
  const out: Pos[][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of dirs) {
        const path: Pos[] = [];
        let ok = true;
        for (let i = 0; i < word.length; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== word[i]) {
            ok = false;
            break;
          }
          path.push({ r: nr, c: nc });
        }
        if (ok) out.push(path);
      }
    }
  }
  return out;
}

export function WordHuntGame({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [path, setPath] = useState<Pos[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ word: string; text: string }[]>([]);
  const [hint, setHint] = useState('');
  const [levelClear, setLevelClear] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const level = LEVELS[levelIdx];
  const grid = level.grid;
  const targets = level.words;

  const foundLetters = useMemo(() => {
    const set = new Set<string>();
    for (const w of found) {
      for (const placement of findPlacements(grid, w)) {
        for (const p of placement) set.add(`${p.r}-${p.c}`);
      }
    }
    return set;
  }, [found, grid]);

  const selectedWord = path.map((p) => grid[p.r][p.c] || '').join('');

  function resetLevelState() {
    setPath([]);
    setFound([]);
    setMessages([]);
    setHint('');
    setLevelClear(false);
  }

  function goNextLevel() {
    if (levelIdx >= LEVELS.length - 1) return;
    setLevelIdx((i) => i + 1);
    resetLevelState();
    speak(L(lang, 'Next puzzle unlocked!', 'अगला पज़ल खुला!', 'తదుపరి పజిల్ అన్‌లాక్ అయింది!'), lang);
  }

  function commit(nextPath: Pos[]) {
    const word = nextPath.map((p) => grid[p.r][p.c] || '').join('');
    const target = targets.find((t) => t.word === word);
    if (!target) return;

    setFound((prevFound) => {
      if (prevFound.includes(word)) {
        setHint(L(lang, 'Already found!', 'पहले मिल चुका!', 'ఇప్పటికే కనుగొన్నారు!'));
        setPath([]);
        return prevFound;
      }
      const text = msgFor(lang, target);
      const nextFound = [...prevFound, word];
      setMessages((m) => [...m, { word, text }]);
      setPath([]);
      setHint(L(lang, `Found ${word}!`, `${word} मिला!`, `${word} కనుగొన్నారు!`));
      speak(`${word}. ${text}`, lang);

      if (nextFound.length >= targets.length) {
        setLevelClear(true);
        onWin(20 + levelIdx * 12);
        if (levelIdx >= LEVELS.length - 1) setAllDone(true);
      }
      return nextFound;
    });
  }

  function onTapCell(r: number, c: number) {
    if (grid[r][c] == null || levelClear) return;
    setHint('');
    const pos = { r, c };

    setPath((prev) => {
      if (prev.length === 0) return [pos];
      const last = prev[prev.length - 1];
      if (last.r === r && last.c === c) return prev;
      if (prev.length >= 2 && prev[prev.length - 2].r === r && prev[prev.length - 2].c === c) {
        return prev.slice(0, -1);
      }
      if (prev.some((p) => p.r === r && p.c === c)) return [pos];
      if (!isAdjacent(last, pos)) return [pos];

      const next = [...prev, pos];
      const word = next.map((p) => grid[p.r][p.c] || '').join('');
      if (targets.some((t) => t.word === word)) {
        queueMicrotask(() => commit(next));
      }
      return next;
    });
  }

  function cellInPath(r: number, c: number) {
    return path.findIndex((p) => p.r === r && p.c === c);
  }

  const label = level.label[lang] || level.label.en;

  return (
    <div className="wordhunt game-board">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-[#065f56]">{label}</p>
          <p className="text-xs font-semibold text-[#3a5f58]">
            {L(lang, 'Tap letters next to each other — no dragging', 'पास-पास अक्षर टैप करो — खींचना नहीं', 'పక్కపక్కన అక్షరాలు ట్యాప్ చేయండి — డ్రాగ్ వద్దు')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {LEVELS.map((lv, i) => (
              <span
                key={lv.id}
                className={`h-2.5 w-2.5 rounded-full ${i < levelIdx ? 'bg-emerald-500' : i === levelIdx ? 'bg-amber-400' : 'bg-slate-300'}`}
              />
            ))}
          </div>
          <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-[#065f56]">
            {found.length}/{targets.length}
          </p>
        </div>
      </div>

      <div className="wordhunt-preview mb-3 min-h-[44px]">
        {path.length === 0 ? (
          <span className="muted text-sm">
            {level.hideWords
              ? L(lang, 'Find the hidden rights words…', 'छिपे अधिकार शब्द ढूँढो…', 'దాగి ఉన్న హక్కు పదాలు కనుగొనండి…')
              : L(
                  lang,
                  `Find: ${targets.map((t) => t.word).join(' · ')}`,
                  `ढूँढो: ${targets.map((t) => t.word).join(' · ')}`,
                  `కనుగొనండి: ${targets.map((t) => t.word).join(' · ')}`
                )}
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {path.map((p, i) => (
              <span key={`${p.r}-${p.c}`} className="inline-flex items-center gap-1">
                <span className={`wordhunt-chip ${i === 0 ? 'start' : ''}`}>{grid[p.r][p.c]}</span>
                {i < path.length - 1 && <span className="wordhunt-chevron">›</span>}
              </span>
            ))}
            <span className="ml-2 text-base font-extrabold tracking-wide text-[#0c2e2a]">{selectedWord}</span>
          </div>
        )}
      </div>

      <div
        className="wordhunt-grid select-none"
        style={{
          gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`,
          maxWidth: level.size > 5 ? 400 : 360,
          touchAction: 'manipulation',
        }}
        role="grid"
        aria-label="Word hunt"
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            if (letter == null) {
              return <div key={`${r}-${c}`} className="wordhunt-cell blocked" aria-hidden />;
            }
            const idx = cellInPath(r, c);
            const selected = idx >= 0;
            const isStart = idx === 0;
            const isFound = foundLetters.has(`${r}-${c}`);
            const showChevron = idx >= 0 && idx < path.length - 1;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={['wordhunt-cell', selected ? 'selected' : '', isStart ? 'start' : '', isFound && !selected ? 'found' : ''].join(' ')}
                onClick={() => onTapCell(r, c)}
              >
                <span className="letter">{letter}</span>
                {showChevron && <span className="path-chevron">›</span>}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary !py-2 text-sm"
          onClick={() => {
            setPath([]);
            setHint('');
          }}
        >
          {L(lang, 'Clear path', 'पथ साफ़', 'పాత్ క్లియర్')}
        </button>
        {hint && <p className="font-bold text-[#0b7a6f]">{hint}</p>}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#065f56]">
          {L(lang, 'Words you found', 'मिले हुए शब्द', 'కనుగొన్న పదాలు')}
        </p>
        <div className="flex flex-col gap-2">
          {targets.map((t) => {
            const ok = found.includes(t.word);
            return (
              <div key={t.word} className="flex flex-wrap items-center gap-1.5">
                {t.word.split('').map((ch, i) => (
                  <span key={`${t.word}-${i}`} className={`wordhunt-tile ${ok ? 'lit' : 'empty'}`}>
                    {ok ? ch : ''}
                  </span>
                ))}
                {!ok && (
                  <span className="ml-1 text-xs font-bold text-[#64748b]">
                    {t.word.length} {L(lang, 'letters', 'अक्षर', 'అక్షరాలు')}
                    {!level.hideWords ? ` · ${t.word}` : ''}
                  </span>
                )}
                {ok && (
                  <button type="button" className="ml-1 text-sm font-bold text-[#0b7a6f]" onClick={() => speak(msgFor(lang, t), lang)}>
                    🔊
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#b45309]">
          {L(lang, 'Messages for you', 'तुम्हारे लिए संदेश', 'మీ కోసం సందేశాలు')}
        </p>
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#cfe8e1] bg-white/80 px-3 py-3 text-sm muted">
            {L(lang, 'Each word unlocks a rights message.', 'हर शब्द एक अधिकार संदेश खोलता है।', 'ప్రతి పదం ఒక హక్కు సందేశం తెరుస్తుంది.')}
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.word} className="message-glow !py-3 animate-pop">
              <p className="text-xs font-bold text-[#b45309]">
                {m.word} · {L(lang, 'Message', 'संदेश', 'సందేశం')}
              </p>
              <p className="mt-1 font-extrabold text-[#0c2e2a]">{m.text}</p>
            </div>
          ))
        )}
      </div>

      {levelClear && !allDone && (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center">
          <p className="font-extrabold text-[#065f56]">{L(lang, 'Puzzle complete!', 'पज़ल पूरा!', 'పజిల్ పూర్తి!')}</p>
          <button type="button" className="btn-primary mt-3" onClick={goNextLevel}>
            {L(lang, 'Next puzzle →', 'अगला पज़ल →', 'తదుపరి పజిల్ →')}
          </button>
        </div>
      )}

      {allDone && (
        <p className="mt-4 font-extrabold text-[#0b7a6f] animate-pop">
          {L(lang, 'All levels cleared — you are a Rights Champion!', 'सभी लेवल पूरे — तुम राइट्स चैंपियन हो!', 'అన్ని లెవల్స్ పూర్తి — మీరు రైట్స్ ఛాంపియన్!')}
        </p>
      )}
    </div>
  );
}
