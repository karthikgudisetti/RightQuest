import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { ageGuide } from '../lib/ageGuide';
import { XpBurst } from '../components/GameEffects';
import { VoiceButton } from '../components/StoryTheater';
import { WordHuntGame } from '../components/WordHuntGame';
import { SafeTrailGame } from '../components/SafeTrailGame';
import { SafetyStarsGame } from '../components/SafetyStarsGame';
import { gameGuide, speak, stopSpeech, type GameGuideKey } from '../lib/voice';
import { t as tr, type Lang } from '../lib/i18n';
import { CHAR_ART } from '../lib/characters';

type GameId = 'hub' | 'words' | 'trail' | 'stars' | 'spotter' | 'match' | 'path' | 'links' | 'message' | 'clues';

type HubCard = {
  id: GameId;
  key: GameGuideKey;
  icon: string;
  learn: { en: string; hi: string; te: string };
  levels: string;
  tag: { en: string; hi: string; te: string };
  color: string;
};

/** Kid toy-box puzzle suite */
const PUZZLE_LAB: HubCard[] = [
  {
    id: 'words',
    key: 'words',
    icon: '🔤',
    color: 'logo-teal',
    levels: '3 levels',
    tag: { en: 'Word path', hi: 'शब्द पथ', te: 'పద మార్గం' },
    learn: {
      en: 'Find SAFE, HELP, RIGHT… unlock child messages',
      hi: 'SAFE, HELP… ढूँढो — संदेश खुलते हैं',
      te: 'SAFE, HELP… కనుగొని సందేశాలు అన్‌లాక్',
    },
  },
  {
    id: 'trail',
    key: 'trail',
    icon: '🛤️',
    color: 'logo-saffron',
    levels: '3 levels',
    tag: { en: 'Number trail', hi: 'नंबर ट्रेल', te: 'నంబర్ ట్రైల్' },
    learn: {
      en: 'Draw a safe path 1→N — learn step-by-step choices',
      hi: '1→N सुरक्षित पथ — कदम-दर-कदम चुनाव',
      te: '1→N సురక్షిత పాత్ — అడుగడుగునా ఎంపిక',
    },
  },
  {
    id: 'stars',
    key: 'stars',
    icon: '⭐',
    color: 'logo-gold',
    levels: '3 levels',
    tag: { en: 'Logic stars', hi: 'लॉजिक स्टार', te: 'లాజిక్ స్టార్స్' },
    learn: {
      en: 'Place stars with boundaries — learn personal space',
      hi: 'सीमाओं के साथ स्टार — निजी स्थान सीखो',
      te: 'హద్దులతో స్టార్స్ — వ్యక్తిగత స్థలం నేర్చుకోండి',
    },
  },
  {
    id: 'links',
    key: 'links',
    icon: '🔗',
    color: 'logo-green',
    levels: '1 board',
    tag: { en: 'Connections', hi: 'कनेक्शन', te: 'కనెక్షన్స్' },
    learn: {
      en: 'Group rights words — safety, help, kindness',
      hi: 'अधिकार शब्द समूह — सुरक्षा, मदद, दया',
      te: 'హక్కు పదాల గ్రూప్ — భద్రత, సహాయం, దయ',
    },
  },
  {
    id: 'message',
    key: 'message',
    icon: '🧩',
    color: 'logo-sky',
    levels: '1 board',
    tag: { en: 'Build message', hi: 'संदेश बनाओ', te: 'సందేశం తయారు' },
    learn: {
      en: 'Arrange tiles → “You are never alone”',
      hi: 'टाइल्स लगाओ → “तुम अकेले नहीं हो”',
      te: 'టైల్స్ అమర్చండి → “మీరు ఒంటరిగా లేరు”',
    },
  },
  {
    id: 'clues',
    key: 'clues',
    icon: '💡',
    color: 'logo-amber',
    levels: '2 rounds',
    tag: { en: 'Pinpoint', hi: 'संकेत', te: 'క్లూలు' },
    learn: {
      en: 'Read clues → guess the rights theme',
      hi: 'संकेत पढ़ो → अधिकार विषय अनुमान',
      te: 'క్లూలు చదివి హక్కు అంశం ఊహించండి',
    },
  },
];

const SKILL_GAMES: HubCard[] = [
  {
    id: 'spotter',
    key: 'spotter',
    icon: '🔍',
    color: 'logo-teal',
    levels: 'Quick',
    tag: { en: 'Spot safe', hi: 'सुरक्षित पहचान', te: 'సురక్షితం గుర్తు' },
    learn: {
      en: 'Tap only safe online actions',
      hi: 'सिर्फ़ सुरक्षित ऑनलाइन काम टैप करो',
      te: 'సురక్షిత ఆన్‌లైన్ చర్యలు మాత్రమే',
    },
  },
  {
    id: 'match',
    key: 'match',
    icon: '🃏',
    color: 'logo-saffron',
    levels: 'Quick',
    tag: { en: 'Memory', hi: 'मेमोरी', te: 'మెమరీ' },
    learn: {
      en: 'Match a right with the right action',
      hi: 'अधिकार को सही काम से मिलाओ',
      te: 'హక్కును సరైన చర్యతో కలపండి',
    },
  },
  {
    id: 'path',
    key: 'path',
    icon: '🚪',
    color: 'logo-green',
    levels: '2 steps',
    tag: { en: 'Choose door', hi: 'दरवाज़ा चुनो', te: 'ద్వారం ఎంచుకోండి' },
    learn: {
      en: 'Pick the safest choice in scenarios',
      hi: 'परिस्थिति में सबसे सुरक्षित चुनाव',
      te: 'పరిస్థితిలో సురక్షిత ఎంపిక',
    },
  },
];

const SPOTTER_ITEMS = [
  { id: '1', label: 'Share password', labelHi: 'पासवर्ड बाँटना', labelTe: 'పాస్‌వర్డ్ ఇవ్వడం', emoji: '🔑', safe: false },
  { id: '2', label: 'Tell a teacher', labelHi: 'शिक्षक को बताना', labelTe: 'టీచర్‌కి చెప్పడం', emoji: '👩‍🏫', safe: true },
  { id: '3', label: 'Send address to stranger', labelHi: 'अजनबी को पता', labelTe: 'అపరిచితునికి చిరునామా', emoji: '📍', safe: false },
  { id: '4', label: 'Block creepy chat', labelHi: 'ब्लॉक/रिपोर्ट', labelTe: 'బ్లాక్/రిపోర్ట్', emoji: '🛡️', safe: true },
  { id: '5', label: 'Keep scary secret', labelHi: 'डरावना राज़', labelTe: 'భయపెట్టే రహస్యం', emoji: '🤐', safe: false },
  { id: '6', label: 'Call 1098 with adult', labelHi: '1098 कॉल', labelTe: '1098 కాల్', emoji: '📞', safe: true },
];

const MATCH_PAIRS = [
  { id: 'a', left: 'Education', right: 'Go to school', emoji: '📚' },
  { id: 'b', left: 'Online Safety', right: 'Keep password private', emoji: '🔐' },
  { id: 'c', left: 'Ask for Help', right: 'Trusted adult / 1098', emoji: '🛟' },
  { id: 'd', left: 'Kindness', right: 'Stop bullying', emoji: '💛' },
];

const PATH_STEPS = [
  {
    en: 'Stranger asks for your photo online.',
    hi: 'अजनबी ऑनलाइन फ़ोटो माँगता है।',
    te: 'ఆన్‌లైన్‌లో అపరిచితుడు ఫోటో అడుగుతున్నాడు.',
    options: [
      { en: 'Send photo', hi: 'फ़ोटो भेजो', te: 'ఫోటో పంపు', safe: false },
      { en: 'Refuse & tell adult', hi: 'मना करो, वयस्क को बताओ', te: 'నిరాకరించి పెద్దవారికి చెప్పు', safe: true },
    ],
  },
  {
    en: 'Someone wants a scary secret kept.',
    hi: 'कोई डरावना राज़ छुपाने को कहता है।',
    te: 'ఎవరైనా భయపెట్టే రహస్యం దాచమంటున్నారు.',
    options: [
      { en: 'Keep quiet forever', hi: 'हमेशा चुप रहो', te: 'ఎప్పటికీ చెప్పవద్దు', safe: false },
      { en: 'Tell trusted adult', hi: 'भरोसेमंद वयस्क को बताओ', te: 'నమ్మకమైన పెద్దవారికి చెప్పు', safe: true },
    ],
  },
];

/** LinkedIn Connections-style groups */
const LINK_GROUPS = [
  {
    name: { en: 'Online Safety', hi: 'ऑनलाइन सुरक्षा', te: 'ఆన్‌లైన్ భద్రత' },
    words: ['Password', 'OTP', 'Block', 'Stranger'],
  },
  {
    name: { en: 'Ask for Help', hi: 'मदद माँगना', te: 'సహాయం అడగడం' },
    words: ['Teacher', 'Parent', '1098', 'Counsellor'],
  },
  {
    name: { en: 'Kind Choices', hi: 'दयालु चुनाव', te: 'దయగల ఎంపికలు' },
    words: ['Share', 'Include', 'Respect', 'Listen'],
  },
  {
    name: { en: 'My Rights', hi: 'मेरे अधिकार', te: 'నా హక్కులు' },
    words: ['School', 'Safety', 'Voice', 'Play'],
  },
];

const MESSAGE_WORDS = {
  en: ['You', 'are', 'never', 'alone', 'Ask', 'for', 'help'],
  hi: ['तुम', 'अकेले', 'नहीं', 'हो', 'मदद', 'माँगो'],
  te: ['మీరు', 'ఒంటరిగా', 'లేరు', 'సహాయం', 'అడగండి'],
};

const CLUE_ROUNDS = [
  {
    clues: {
      en: ['Keep passwords private', 'Do not share OTP', 'Block creepy chats'],
      hi: ['पासवर्ड निजी रखो', 'OTP न बाँटो', 'अजीब चैट ब्लॉक करो'],
      te: ['పాస్‌వర్డ్ రహస్యంగా ఉంచండి', 'OTP ఇవ్వవద్దు', 'బాధించే చాట్ బ్లాక్ చేయండి'],
    },
    answer: { en: 'Online Safety', hi: 'ऑनलाइन सुरक्षा', te: 'ఆన్‌లైన్ భద్రత' },
    options: {
      en: ['Online Safety', 'Sports', 'Cooking'],
      hi: ['ऑनलाइन सुरक्षा', 'खेल', 'खाना'],
      te: ['ఆన్‌లైన్ భద్రత', 'క్రీడలు', 'వంట'],
    },
  },
  {
    clues: {
      en: ['Go to school', 'Learn and grow', 'Ask teachers questions'],
      hi: ['स्कूल जाओ', 'सीखो और बढ़ो', 'शिक्षक से पूछो'],
      te: ['స్కూల్‌కి వెళ్లండి', 'నేర్చుకోండి', 'టీచర్‌ని అడగండి'],
    },
    answer: { en: 'Right to Education', hi: 'शिक्षा का अधिकार', te: 'విద్యా హక్కు' },
    options: {
      en: ['Right to Education', 'Shopping', 'Gaming only'],
      hi: ['शिक्षा का अधिकार', 'खरीदारी', 'सिर्फ़ गेम'],
      te: ['విద్యా హక్కు', 'షాపింగ్', 'కేవలం గేమ్'],
    },
  },
];

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function GamesPage() {
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const guides = gameGuide(lang);
  const [game, setGame] = useState<GameId>('hub');
  const [burst, setBurst] = useState({ show: false, xp: 0, label: '' });

  function celebrate(xp: number, key: GameGuideKey) {
    const msg = guides[key].message;
    setBurst({ show: true, xp, label: msg });
    speak(msg, lang);
  }

  function openGame(id: GameId, key: GameGuideKey) {
    stopSpeech();
    setGame(id);
    const g = guides[key];
    speak(`${g.title}. ${g.how}`, lang);
  }

  return (
    <div className="animate-rise space-y-8">
      <XpBurst show={burst.show} xp={burst.xp} label={burst.label} onDone={() => setBurst((b) => ({ ...b, show: false }))} />

      {game === 'hub' && (
        <>
          <section className="realm-hero compact mb-2 px-6 py-7 md:px-10">
            <div className="relative z-10 flex flex-wrap items-center gap-4">
              <img
                src={CHAR_ART.fox}
                alt="Quest Fox"
                className="h-16 w-16 rounded-2xl object-cover char-frame md:h-20 md:w-20"
              />
              <div>
                <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
                  {L(lang, 'Tap a game logo', 'गेम लोगो पर टैप करो', 'గేమ్ లోగోపై ట్యాప్ చేయండి')}
                </h1>
                <p className="mt-2 max-w-lg text-sm font-semibold text-white/90 md:text-base">
                  {L(
                    lang,
                    'Big pictures — easy for children. Tap any logo to play.',
                    'बड़ी तस्वीरें — बच्चों के लिए आसान। लोगो टैप करो और खेलो।',
                    'పెద్ద చిత్రాలు — పిల్లలకు సులభం. లోగో ట్యాప్ చేసి ఆడండి.'
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-2">
            <div className="game-logo-grid">
              {PUZZLE_LAB.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`game-logo ${g.color}`}
                  onClick={() => openGame(g.id, g.key)}
                  aria-label={guides[g.key].title}
                >
                  <span className="game-logo-art" aria-hidden>
                    {g.icon}
                  </span>
                  <span className="game-logo-name">{guides[g.key].short}</span>
                  <span className="game-logo-play">▶</span>
                </button>
              ))}
              {SKILL_GAMES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`game-logo ${g.color}`}
                  onClick={() => openGame(g.id, g.key)}
                  aria-label={guides[g.key].title}
                >
                  <span className="game-logo-art" aria-hidden>
                    {g.icon}
                  </span>
                  <span className="game-logo-name">{guides[g.key].short}</span>
                  <span className="game-logo-play">▶</span>
                </button>
              ))}
              <Link to="/stories" className="game-logo logo-story" aria-label={guides.story.title}>
                <span className="game-logo-art" aria-hidden>
                  📖
                </span>
                <span className="game-logo-name">{guides.story.short}</span>
                <span className="game-logo-play">▶</span>
              </Link>
            </div>
          </section>

          <p className="text-center text-sm font-bold text-[#3d5c56]">
            {L(
              lang,
              'Each game teaches a child-rights message. Have fun!',
              'हर गेम एक बाल-अधिकार संदेश सिखाता है। मज़े करो!',
              'ప్రతి గేమ్ బాల-హక్కు సందేశం నేర్పుతుంది. సరదాగా ఆడండి!'
            )}
          </p>
        </>
      )}

      {game !== 'hub' && (
        <GameFrame
          lang={lang}
          guideKey={game as GameGuideKey}
          onBack={() => { stopSpeech(); setGame('hub'); }}
        >
          {game === 'words' && <WordHuntGame lang={lang} onWin={(xp) => celebrate(xp, 'words')} />}
          {game === 'trail' && <SafeTrailGame lang={lang} onWin={(xp) => celebrate(xp, 'trail')} />}
          {game === 'stars' && <SafetyStarsGame lang={lang} onWin={(xp) => celebrate(xp, 'stars')} />}
          {game === 'links' && <LinksPuzzle lang={lang} onWin={(xp) => celebrate(xp, 'links')} />}
          {game === 'message' && <MessagePuzzle lang={lang} onWin={(xp) => celebrate(xp, 'message')} />}
          {game === 'clues' && <CluesPuzzle lang={lang} onWin={(xp) => celebrate(xp, 'clues')} />}
          {game === 'spotter' && <SafetySpotter lang={lang} onWin={(xp) => celebrate(xp, 'spotter')} />}
          {game === 'match' && <RightsMatch lang={lang} onWin={(xp) => celebrate(xp, 'match')} />}
          {game === 'path' && <SafePath lang={lang} guide={guide} onWin={(xp) => celebrate(xp, 'path')} />}
        </GameFrame>
      )}
    </div>
  );
}

function GameFrame({
  lang,
  guideKey,
  onBack,
  children,
}: {
  lang: Lang;
  guideKey: GameGuideKey;
  onBack: () => void;
  children: ReactNode;
}) {
  const g = gameGuide(lang)[guideKey];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {tr(lang, 'back')}
        </button>
        <VoiceButton text={`${g.title}. ${g.how}. ${g.message}`} lang={lang} />
      </div>

      <div className="game-header">
        <img src={CHAR_ART.fox} alt="" className="h-12 w-12 rounded-xl object-cover char-frame" />
        <div>
          <h2 className="font-display text-2xl font-bold text-[#0f2a26]">{g.title}</h2>
          <p className="text-sm font-semibold text-[#3d5c56]">{g.how}</p>
        </div>
      </div>

      <div className="guide-box !py-3">
        <p className="m-0 text-sm font-bold text-[#0a4f49]">
          💡 {g.tip}
        </p>
      </div>

      {children}

      <div className="message-glow">
        <p className="text-xs font-bold uppercase tracking-wide text-[#b45309]">{tr(lang, 'valuableMsg')}</p>
        <p className="mt-1 font-extrabold text-[#0c2e2a]">{g.message}</p>
        <button type="button" className="btn-secondary mt-3 !py-2 text-sm" onClick={() => speak(g.message, lang)}>
          🔊 {L(lang, 'Hear message', 'संदेश सुनें', 'సందేశం వినండి')}
        </button>
      </div>
    </div>
  );
}

/** LinkedIn Connections-style */
function LinksPuzzle({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const words = useMemo(() => LINK_GROUPS.flatMap((g) => g.words).sort(() => Math.random() - 0.5), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  const [msg, setMsg] = useState('');

  function toggle(w: string) {
    if (solved.includes(w)) return;
    setSelected((prev) => {
      if (prev.includes(w)) return prev.filter((x) => x !== w);
      if (prev.length >= 4) return prev;
      return [...prev, w];
    });
  }

  function submitGroup() {
    if (selected.length !== 4) {
      setMsg(L(lang, 'Pick exactly 4 cards', 'ठीक 4 कार्ड चुनो', 'ఖచ్చితంగా 4 కార్డులు ఎంచండి'));
      return;
    }
    const group = LINK_GROUPS.find((g) => selected.every((w) => g.words.includes(w)) && selected.length === 4);
    if (!group) {
      setMsg(L(lang, 'Not a group — try again', 'समूह नहीं — फिर कोशिश', 'గ్రూప్ కాదు — మళ్లీ ప్రయత్నించండి'));
      speak(L(lang, 'Try again', 'फिर कोशिश करो', 'మళ్లీ ప్రయత్నించండి'), lang);
      setSelected([]);
      return;
    }
    const name = group.name[lang];
    const next = [...solved, ...selected];
    setSolved(next);
    setSelected([]);
    setMsg(L(lang, `Found: ${name}`, `मिला: ${name}`, `కనుగొన్నారు: ${name}`));
    speak(name, lang);
    if (next.length >= 16) onWin(40);
  }

  return (
    <div className="game-board">
      <p className="mb-3 text-sm font-semibold text-[#3d5c56]">
        {L(
          lang,
          'Pick 4 words that belong together, then Submit.',
          'एक साथ के 4 शब्द चुनो, फिर जमा करो।',
          'కలిసి ఉండే 4 పదాలు ఎంచి సబ్మిట్ చేయండి.'
        )}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {words.map((w) => (
          <button
            key={w}
            type="button"
            disabled={solved.includes(w)}
            className={`rounded-xl border px-1 py-3 text-center text-xs font-extrabold sm:text-sm ${
              solved.includes(w)
                ? 'border-emerald-300 bg-emerald-50 text-[#12352f] opacity-70'
                : selected.includes(w)
                  ? 'border-[#0d6b63] bg-[#0d6b63] text-white'
                  : 'border-[#d7e8e3] bg-white text-[#12352f]'
            }`}
            onClick={() => toggle(w)}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={submitGroup}>
          {L(lang, 'Submit Group', 'समूह जमा करें', 'గ్రూప్ సబ్మిట్')}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setSelected([])}>
          {L(lang, 'Clear', 'साफ़', 'క్లియర్')}
        </button>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-[#065f56]">
          {solved.length / 4}/4
        </span>
      </div>
      {msg && <p className="mt-3 font-bold text-[#12352f]">{msg}</p>}
      {solved.length >= 16 && (
        <p className="mt-3 font-extrabold text-[#0d6b63] animate-pop">
          {L(lang, 'Puzzle complete!', 'पज़ल पूरा!', 'పజిల్ పూర్తి!')}
        </p>
      )}
    </div>
  );
}

/** Arrange tiles to reveal valuable message */
function MessagePuzzle({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const target = MESSAGE_WORDS[lang];
  const [pool, setPool] = useState(() => [...target].sort(() => Math.random() - 0.5));
  const [built, setBuilt] = useState<string[]>([]);
  const won = useRef(false);
  const done = built.length === target.length && built.every((w, i) => w === target[i]);

  useEffect(() => {
    if (!done || won.current) return;
    won.current = true;
    speak(target.join(' '), lang);
    onWin(35);
  }, [done, lang, onWin, target]);

  function pick(word: string, fromPool: boolean, index: number) {
    if (done) return;
    if (fromPool) {
      setPool((p) => p.filter((_, i) => i !== index));
      setBuilt((b) => [...b, word]);
    } else {
      setBuilt((b) => b.filter((_, i) => i !== index));
      setPool((p) => [...p, word]);
    }
  }

  function check() {
    if (built.join(' ') === target.join(' ')) {
      if (!won.current) {
        won.current = true;
        speak(target.join(' '), lang);
        onWin(35);
      }
    } else {
      speak(L(lang, 'Not yet — keep arranging', 'अभी नहीं — क्रम ठीक करो', 'ఇంకా కాదు — క్రమం సరిచేయండి'), lang);
    }
  }

  return (
    <div className="game-board">
      <p className="mb-3 text-sm font-semibold text-[#3d5c56]">
        {L(lang, 'Tap words in order to build the message.', 'संदेश बनाने के लिए शब्द क्रम से टैप करो।', 'సందేశం కోసం పదాలను క్రమంగా ట్యాప్ చేయండి.')}
      </p>
      <div className="mb-4 flex min-h-[56px] flex-wrap gap-2 rounded-xl border border-dashed border-[#0d6b63] bg-[#f3faf7] p-3">
        {built.length === 0 && <span className="muted text-sm">{L(lang, 'Tap words below…', 'नीचे शब्दों पर टैप करो…', 'కింది పదాలపై ట్యాప్ చేయండి…')}</span>}
        {built.map((w, i) => (
          <button key={`${w}-${i}`} type="button" className="rounded-lg bg-[#0d6b63] px-3 py-2 text-sm font-bold text-white" onClick={() => pick(w, false, i)}>
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((w, i) => (
          <button key={`${w}-${i}`} type="button" className="rounded-lg border border-[#d7e8e3] bg-white px-3 py-2 text-sm font-bold text-[#12352f]" onClick={() => pick(w, true, i)}>
            {w}
          </button>
        ))}
      </div>
      <button type="button" className="btn-primary mt-4" onClick={check} disabled={done}>
        {L(lang, 'Check message', 'संदेश जाँचें', 'సందేశం చెక్ చేయండి')}
      </button>
      {done && (
        <p className="mt-3 font-extrabold text-[#0d6b63] animate-pop">{target.join(' ')}</p>
      )}
    </div>
  );
}

/** LinkedIn Pinpoint-style */
function CluesPuzzle({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const won = useRef(false);
  const round = CLUE_ROUNDS[idx];

  if (!round) {
    return <div className="game-board font-extrabold text-[#0d6b63]">{L(lang, 'All clues solved!', 'सभी संकेत हल!', 'అన్ని క్లూలు పరిష్కారం!')}</div>;
  }

  function guess(opt: string) {
    const correct = round.answer[lang];
    if (opt === correct) {
      const s = score + 1;
      setScore(s);
      speak(correct, lang);
      if (idx >= CLUE_ROUNDS.length - 1) {
        if (!won.current) {
          won.current = true;
          onWin(20 + s * 10);
        }
        setIdx(CLUE_ROUNDS.length);
      } else {
        setTimeout(() => setIdx((i) => i + 1), 700);
      }
    } else {
      speak(L(lang, 'Try another option', 'दूसरा विकल्प आज़माओ', 'మరో ఎంపిక ప్రయత్నించండి'), lang);
    }
  }

  return (
    <div className="game-board">
      <p className="text-sm font-extrabold text-[#0d6b63]">
        {L(lang, 'Round', 'राउंड', 'రౌండ్')} {idx + 1}/{CLUE_ROUNDS.length}
      </p>
      <ul className="mt-3 space-y-2">
        {round.clues[lang].map((c) => (
          <li key={c} className="rounded-xl bg-[#f3faf7] px-3 py-2 font-semibold text-[#12352f]">💡 {c}</li>
        ))}
      </ul>
      <div className="mt-3">
        <VoiceButton text={round.clues[lang].join('. ')} lang={lang} />
      </div>
      <div className="mt-4 grid gap-2">
        {round.options[lang].map((o) => (
          <button key={o} type="button" className="choice-door" onClick={() => guess(o)}>
            <span className="text-[#12352f]">{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SafetySpotter({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const items = useMemo(() => [...SPOTTER_ITEMS].sort(() => Math.random() - 0.5), []);
  const safeTotal = SPOTTER_ITEMS.filter((i) => i.safe).length;
  const [picked, setPicked] = useState<Record<string, 'ok' | 'bad'>>({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const won = useRef(false);

  function tap(item: (typeof SPOTTER_ITEMS)[0]) {
    if (picked[item.id] || won.current) return;
    const next: Record<string, 'ok' | 'bad'> = { ...picked, [item.id]: item.safe ? 'ok' : 'bad' };
    setPicked(next);
    const label = L(lang, item.label, item.labelHi, item.labelTe);
    speak(
      item.safe
        ? L(lang, `Safe: ${label}`, `सुरक्षित: ${label}`, `సురక్షితం: ${label}`)
        : L(lang, `Not safe: ${label}`, `असुरक्षित: ${label}`, `సురక్షితం కాదు: ${label}`),
      lang
    );
    const okCount = Object.values(next).filter((v) => v === 'ok').length;
    if (item.safe) setScore(okCount);
    if (okCount >= safeTotal && !won.current) {
      won.current = true;
      setFinished(true);
      onWin(15 + okCount * 5);
    }
  }

  return (
    <div className="game-board">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#3d5c56]">
          {L(lang, 'Tap only the safe actions.', 'सिर्फ़ सुरक्षित काम टैप करो।', 'సురక్షిత చర్యలు మాత్రమే ట్యాప్ చేయండి.')}
        </p>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-[#065f56]">
          {score}/{safeTotal}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`safe-tile !aspect-auto min-h-[100px] ${picked[item.id] === 'ok' ? 'correct-flash' : ''} ${picked[item.id] === 'bad' ? 'wrong-flash' : ''}`}
            onClick={() => tap(item)}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="mt-1 text-[11px] font-bold text-[#12352f]">
              {L(lang, item.label, item.labelHi, item.labelTe)}
            </span>
          </button>
        ))}
      </div>
      {finished && (
        <p className="mt-3 font-extrabold text-[#0d6b63] animate-pop">
          {L(lang, 'All safe actions found!', 'सभी सुरक्षित काम मिले!', 'అన్ని సురక్షిత చర్యలు కనుగొన్నారు!')}
        </p>
      )}
    </div>
  );
}

function RightsMatch({ lang, onWin }: { lang: Lang; onWin: (xp: number) => void }) {
  const cards = useMemo(() => {
    const all = MATCH_PAIRS.flatMap((p) => [
      { key: `${p.id}-l`, pair: p.id, text: p.left, emoji: p.emoji },
      { key: `${p.id}-r`, pair: p.id, text: p.right, emoji: p.emoji },
    ]);
    return all.sort(() => Math.random() - 0.5);
  }, []);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const won = useRef(false);

  function flip(key: string) {
    if (lock || flipped.includes(key) || matched.includes(cards.find((c) => c.key === key)!.pair)) return;
    const next = [...flipped, key];
    setFlipped(next);
    if (next.length === 2) {
      setLock(true);
      const ca = cards.find((c) => c.key === next[0])!;
      const cb = cards.find((c) => c.key === next[1])!;
      setTimeout(() => {
        if (ca.pair === cb.pair) {
          const m = [...matched, ca.pair];
          setMatched(m);
          speak(L(lang, 'Match!', 'जोड़ा!', 'మ్యాచ్!'), lang);
          if (m.length === MATCH_PAIRS.length && !won.current) {
            won.current = true;
            onWin(25);
          }
        }
        setFlipped([]);
        setLock(false);
      }, 550);
    }
  }

  return (
    <div className="game-board">
      <p className="mb-3 text-sm font-semibold text-[#3d5c56]">
        {L(lang, 'Flip two cards — match a right with its action.', 'दो कार्ड पलटो — अधिकार को सही काम से मिलाओ।', 'రెండు కార్డులు తిప్పండి — హక్కును చర్యతో మ్యాచ్ చేయండి.')}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c) => {
          const up = flipped.includes(c.key) || matched.includes(c.pair);
          return (
            <button
              key={c.key}
              type="button"
              className={`match-card ${up ? 'flipped' : ''} ${matched.includes(c.pair) ? 'matched' : ''}`}
              onClick={() => flip(c.key)}
            >
              {up ? (
                <span className="text-[11px] font-bold text-[#12352f]">
                  <span className="block text-xl">{c.emoji}</span>
                  {c.text}
                </span>
              ) : (
                <span className="text-lg font-extrabold text-[#0d6b63]">?</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm font-bold text-[#065f56]">
        {matched.length}/{MATCH_PAIRS.length} {L(lang, 'matched', 'जोड़े', 'మ్యాచ్‌లు')}
      </p>
    </div>
  );
}

function SafePath({
  lang,
  guide,
  onWin,
}: {
  lang: Lang;
  guide: ReturnType<typeof ageGuide>;
  onWin: (xp: number) => void;
}) {
  const [step, setStep] = useState(0);
  const won = useRef(false);
  const current = PATH_STEPS[step];
  if (!current) {
    return (
      <div className="game-board font-extrabold text-[#0d6b63]">{guide.feedbackGood}</div>
    );
  }

  function choose(safe: boolean) {
    if (!safe) {
      speak(guide.feedbackLearn, lang);
      return;
    }
    speak(guide.feedbackGood, lang);
    if (step >= PATH_STEPS.length - 1) {
      if (!won.current) {
        won.current = true;
        onWin(30);
      }
      setStep(PATH_STEPS.length);
    } else {
      setTimeout(() => setStep((s) => s + 1), 500);
    }
  }

  const prompt = L(lang, current.en, current.hi, current.te);

  return (
    <div className="game-board">
      <p className="text-sm font-extrabold text-[#0d6b63]">
        {L(lang, 'Step', 'कदम', 'అడుగు')} {step + 1}/{PATH_STEPS.length}
      </p>
      <VoiceButton text={prompt} lang={lang} />
      <h3 className="mt-3 font-display text-xl font-bold text-[#12352f]">{prompt}</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {current.options.map((o, i) => (
          <button key={i} type="button" className="choice-door" onClick={() => choose(o.safe)}>
            <span className="text-[#12352f]">{L(lang, o.en, o.hi, o.te)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
