import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t, type Lang } from '../lib/i18n';
import { ageGuide } from '../lib/ageGuide';
import { HELPLINES, PARENT_TIPS, SAFETY_STEPS, helpL } from '../lib/helpResources';
import { CHAR_ART } from '../lib/characters';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function HelpPage() {
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);

  return (
    <div className="animate-rise space-y-6">
      <section className="realm-hero compact px-6 py-9 md:px-10">
        <div className="india-ribbon mb-3">
          <span className="saffron" />
          <span className="white" />
          <span className="green" />
          RightsQuest India
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <img
            src={CHAR_ART.asha}
            alt="Safety Guide"
            className="h-20 w-20 rounded-2xl object-cover char-frame animate-float"
          />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/80">
              {L(lang, 'National Help', 'राष्ट्रीय सहायता', 'జాతీయ సహాయం')}
            </p>
            <h1 className={`mt-2 font-display font-bold text-white ${guide.titleScale}`}>
              {L(lang, 'You are not alone', 'तुम अकेले नहीं हो', 'మీరు ఒంటరిగా లేరు')}
            </h1>
            <p className={`mt-2 max-w-xl font-semibold text-white/90 ${guide.textScale}`}>
              {L(
                lang,
                'Free helplines across India. Tell a trusted adult first — then call if you need more help.',
                'भारत भर में मुफ़्त हेल्पलाइन। पहले भरोसेमंद वयस्क को बताओ — फिर ज़रूरत हो तो कॉल करो।',
                'భారతదేశం అంతటా ఉచిత హెల్ప్‌లైన్‌లు. ముందు నమ్మకమైన పెద్దవారికి చెప్పండి.'
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="help-urgent panel border-l-4 border-l-[#dc2626] p-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#dc2626]">
          {L(lang, 'In immediate danger?', 'तुरंत खतरे में?', 'తక్షణ ప్రమాదంలో?')}
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-[#0f2a26]">
          {L(lang, 'Call 112 or 1098 now', 'अभी 112 या 1098 कॉल करो', 'ఇప్పుడు 112 లేదా 1098కి కాల్ చేయండి')}
        </p>
        <p className="mt-1 text-sm font-semibold text-[#3d5c56]">
          {t(lang, 'disclaimer')}
        </p>
      </div>

      <section>
        <h2 className="section-title">
          {L(lang, 'National helplines', 'राष्ट्रीय हेल्पलाइन', 'జాతీయ హెల్ప్‌లైన్‌లు')}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {HELPLINES.map((h) => (
            <article
              key={h.id}
              className={`help-card panel p-5 ${h.urgent ? 'help-card-urgent' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="help-card-icon">{h.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-[#0f2a26]">
                    {helpL(lang, h.name)}
                  </h3>
                  <a
                    href={`tel:${h.number.replace(/\s/g, '')}`}
                    className="mt-1 inline-block font-display text-3xl font-extrabold text-[#0d6b63] hover:underline"
                  >
                    {h.number}
                  </a>
                  <p className="mt-1 text-xs font-bold text-[#0d6b63]">{helpL(lang, h.hours)}</p>
                  <p className="mt-2 text-sm font-semibold text-[#3d5c56]">{helpL(lang, h.about)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-xl font-bold text-[#0f2a26]">
          {L(lang, 'What to do if you feel unsafe', 'असुरक्षित लगे तो क्या करें', 'అసురక్షితంగా అనిపిస్తే ఏమి చేయాలి')}
        </h2>
        <ol className="mt-4 space-y-3">
          {SAFETY_STEPS.map((s) => (
            <li key={s.step} className="help-step">
              <span className="help-step-n">{s.step}</span>
              <p className="font-semibold text-[#12352f]">{helpL(lang, s.text)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="btn-primary" to="/tutor">
            {L(lang, 'Ask AI Tutor', 'एआई ट्यूटर से पूछो', 'AI ట్యూటర్‌ను అడగండి')}
          </Link>
          <Link className="btn-secondary" to="/rights">
            {L(lang, 'Know your rights', 'अपने अधिकार जानो', 'మీ హక్కులు తెలుసుకోండి')}
          </Link>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-xl font-bold text-[#0f2a26]">
          {L(lang, 'For parents & guardians', 'माता-पिता और अभिभावकों के लिए', 'తల్లిదండ్రులు & అభిభావకుల కోసం')}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PARENT_TIPS.map((tip, i) => (
            <div key={i} className="rounded-2xl bg-[#f3faf7] p-4">
              <p className="font-display font-bold text-[#0d6b63]">{helpL(lang, tip.title)}</p>
              <p className="mt-2 text-sm font-semibold text-[#3d5c56]">{helpL(lang, tip.body)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
