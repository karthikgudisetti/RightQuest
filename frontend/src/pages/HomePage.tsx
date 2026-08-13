import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t, type Lang } from '../lib/i18n';
import { ageGuide, sceneThemeFromTitle } from '../lib/ageGuide';
import { ageTheme } from '../lib/ageTheme';
import { CHAR_ART } from '../lib/characters';
import { todayTip, tipText } from '../lib/dailyTips';
import { speak } from '../lib/voice';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

type Module = {
  id: string;
  title: string;
  description: string;
  category: string;
  progress?: { completionPercentage: number } | null;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
};

export function HomePage() {
  const { user, lang, ageGroup, refreshMe } = useAuth();
  const band = user?.ageGroup || ageGroup;
  const guide = ageGuide(band, lang);
  const theme = ageTheme(band);
  const [modules, setModules] = useState<Module[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    refreshMe().catch(() => undefined);
    api<{ modules: Module[] }>(`/modules?lang=${lang}`).then((d) => setModules(d.modules));
    api<{ challenge: Challenge | null }>('/gamification/challenges').then((d) => setChallenge(d.challenge));
  }, [lang, refreshMe]);

  const continueMod =
    modules.find(
      (m) =>
        (m.progress?.completionPercentage ?? 0) > 0 && (m.progress?.completionPercentage ?? 0) < 100
    ) ||
    modules.find((m) => m.category === 'Online Safety') ||
    modules[0];

  const tip = todayTip();

  const actions = [
    {
      n: '1',
      to: '/games',
      icon: '🎮',
      title: L(lang, 'Play games', 'गेम खेलो', 'గేమ్స్ ఆడండి'),
      sub: L(
        lang,
        'Word Hunt, Safe Trail, Stars & more — learn rights by playing.',
        'वर्ड हंट, ट्रेल, स्टार — खेलकर अधिकार सीखो।',
        'వర్డ్ హంట్, ట్రైల్, స్టార్స్ — ఆడుతూ హక్కులు నేర్చుకోండి.'
      ),
      cta: L(lang, 'Start playing', 'खेल शुरू करो', 'ఆడటం మొదలుపెట్టండి'),
    },
    {
      n: '2',
      to: '/videos',
      icon: '🎬',
      title: L(lang, 'Watch videos', 'वीडियो देखो', 'వీడియోలు చూడండి'),
      sub: L(
        lang,
        'UNICEF, Childline & safety films — watch and learn.',
        'यूनिसेफ, चाइल्डलाइन और सुरक्षा फिल्में — देखो और सीखो।',
        'యూనిసెఫ్, చైల్డ్‌లైన్ & భద్రత చిత్రాలు — చూసి నేర్చుకోండి.'
      ),
      cta: L(lang, 'Open videos', 'वीडियो खोलो', 'వీడియోలు తెరవండి'),
    },
    {
      n: '3',
      to: '/stories',
      icon: '📖',
      title: L(lang, 'Listen to stories', 'कहानियाँ सुनो', 'కథలు వినండి'),
      sub: L(
        lang,
        'Characters speak. You choose the safe path.',
        'किरदार बोलते हैं। तुम सुरक्षित रास्ता चुनते हो।',
        'పాత్రలు మాట్లాడతాయి. మీరు సురక్షిత మార్గం ఎంచుకుంటారు.'
      ),
      cta: L(lang, 'Open stories', 'कहानियाँ खोलो', 'కథలు తెరవండి'),
    },
    {
      n: '4',
      to: '/learn',
      icon: '📚',
      title: L(lang, 'Learn lessons', 'पाठ सीखो', 'పాఠాలు నేర్చుకోండి'),
      sub: L(
        lang,
        'Short modules + quizzes. Earn XP and badges.',
        'छोटे पाठ + क्विज़। XP और बैज पाओ।',
        'చిన్న పాఠాలు + క్విజ్. XP మరియు బ్యాడ్జ్‌లు.'
      ),
      cta: L(lang, 'Go to learn', 'लर्निंग पर जाओ', 'లెర్న్‌కి వెళ్లండి'),
    },
    {
      n: '5',
      to: '/rights',
      icon: '⚖️',
      title: L(lang, 'Know your rights', 'अपने अधिकार जानो', 'మీ హక్కులు తెలుసుకోండి'),
      sub: L(
        lang,
        '8 key rights every child in India has — simple words.',
        'भारत के हर बच्चे के 8 मुख्य अधिकार — सरल भाषा में।',
        'భారతదేశంలో ప్రతి పిల్లవాడికి 8 ముఖ్య హక్కులు — సరళ భాషలో.'
      ),
      cta: L(lang, 'Explore rights', 'अधिकार देखो', 'హక్కులు చూడండి'),
    },
    {
      n: '6',
      to: '/help',
      icon: '🆘',
      title: L(lang, 'Get help', 'मदद लो', 'సహాయం పొందండి'),
      sub: L(
        lang,
        'Childline 1098, NCPCR, and safety steps — national helplines.',
        'चाइल्डलाइन 1098, एनसीपीसीआर — राष्ट्रीय हेल्पलाइन।',
        'చైల్డ్‌లైన్ 1098, NCPCR — జాతీయ హెల్ప్‌లైన్‌లు.'
      ),
      cta: L(lang, 'Open help', 'मदद खोलो', 'సహాయం తెరవండి'),
    },
  ];

  return (
    <div className="animate-rise space-y-7">
      {/* Clear hero — one message */}
      <section className={`${theme.heroClass} px-6 py-9 md:px-10`}>
        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <img
            src={CHAR_ART.fox}
            alt="Quest Fox"
            className="h-24 w-24 rounded-2xl object-cover char-frame animate-float md:h-28 md:w-28"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white/85">
              {L(lang, 'Hi', 'नमस्ते', 'హాయ్')} {user?.name || 'friend'} · RightsQuest India
            </p>
            <h1 className={`mt-2 font-display font-bold text-white ${guide.titleScale}`}>
              {L(lang, 'Learn your rights — safely', 'अपने अधिकार सुरक्षित सीखो', 'మీ హక్కులు సురక్షితంగా నేర్చుకోండి')}
            </h1>
            <p className="mt-2 max-w-lg font-semibold text-white/90">{guide.tip}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip chip-light">⭐ {user?.xp ?? 0} XP</span>
              <span className="chip chip-light">
                {t(lang, 'level')} {user?.level}
              </span>
              {(user?.currentStreak ?? 0) > 0 && (
                <span className="chip streak-chip">
                  🔥 {user?.currentStreak} {L(lang, 'day streak', 'दिन स्ट्रीक', 'రోజుల స్ట్రీక్')}
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link className="btn-primary inline-flex" to="/games">
                🎮 {L(lang, 'Play games now', 'अभी गेम खेलो', 'ఇప్పుడు గేమ్స్ ఆడండి')}
              </Link>
              <Link
                className="btn-secondary inline-flex !border-white/40 !bg-white/15 !text-white"
                to="/videos"
              >
                🎬 {L(lang, 'Watch videos', 'वीडियो देखो', 'వీడియోలు చూడండి')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="daily-tip-card panel p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="text-3xl">{tip.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">
              {L(lang, "Today's rights tip", 'आज की अधिकार टिप', 'నేటి హక్కుల చిట్కా')}
            </p>
            <p className="mt-1 font-display text-lg font-bold text-[#0f2a26]">{tipText(lang, tip)}</p>
            <button
              type="button"
              className="btn-secondary mt-3 !py-2 text-sm"
              onClick={() => speak(tipText(lang, tip), lang)}
            >
              🔊 {L(lang, 'Hear tip', 'टिप सुनो', 'చిట్కా వినండి')}
            </button>
          </div>
        </div>
      </section>

      {/* Clear choices */}
      <section>
        <h2 className="section-title">
          {L(lang, 'What do you want to do?', 'तुम क्या करना चाहते हो?', 'మీరు ఏమి చేయాలనుకుంటున్నారు?')}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <Link key={a.to} to={a.to} className="home-action">
              <span className="home-action-n">{a.n}</span>
              <span className="text-3xl">{a.icon}</span>
              <p className="mt-3 font-display text-xl font-bold text-[#0f2a26]">{a.title}</p>
              <p className="mt-2 text-sm font-semibold text-[#3d5c56]">{a.sub}</p>
              <p className="mt-4 text-sm font-extrabold text-[#0d6b63]">{a.cta} →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Continue + help — short */}
      {continueMod && (
        <section className="panel p-5">
          <p className="eyebrow">{theme.learnLabel[lang] || theme.learnLabel.en}</p>
          <Link to={`/learn/${continueMod.id}`} className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef6f3] text-2xl">
              {sceneThemeFromTitle(continueMod.title, continueMod.category).emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold text-[#0f2a26]">{continueMod.title}</p>
              <p className="text-sm muted">{continueMod.category}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef6f3]">
                <div
                  className="h-full rounded-full bg-[#0d6b63]"
                  style={{ width: `${continueMod.progress?.completionPercentage ?? 0}%` }}
                />
              </div>
            </div>
            <span className="font-extrabold text-[#0d6b63]">{L(lang, 'Continue →', 'जारी रखो →', 'కొనసాగించండి →')}</span>
          </Link>
        </section>
      )}

      {challenge && (
        <section className="panel border-l-4 border-l-[#e07a2f] p-5">
          <p className="eyebrow">{t(lang, 'todaysMission')}</p>
          <p className="mt-1 font-display text-lg font-bold text-[#0f2a26]">{challenge.title}</p>
          <p className="mt-1 text-sm muted">{challenge.description}</p>
          <Link className="btn-primary mt-4 inline-flex" to="/games">
            {L(lang, 'Play mission', 'मिशन खेलो', 'మిషన్ ఆడండి')}
          </Link>
        </section>
      )}

      <p className="text-center text-sm font-bold text-[#3d5c56]">
        {L(
          lang,
          'Need help? ',
          'मदद चाहिए? ',
          'సహాయం కావాలా? '
        )}
        <Link to="/help" className="text-[#0d6b63] underline">
          {L(lang, 'Childline 1098', 'चाइल्डलाइन 1098', 'చైల్డ్‌లైన్ 1098')}
        </Link>
        {L(lang, ' — free, 24/7.', ' — मुफ़्त, 24/7।', ' — ఉచిత, 24/7.')}
      </p>
    </div>
  );
}
