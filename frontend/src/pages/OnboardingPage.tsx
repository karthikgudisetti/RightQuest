import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import { t, type Lang } from '../lib/i18n';
import { CHAR_ART } from '../lib/characters';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function OnboardingPage() {
  const { lang, setLang, ageGroup, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  async function finish() {
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ preferredLanguage: lang, ageGroup: ageGroup || '10-13' }),
      });
    } catch {
      // continue
    }
    completeOnboarding();
    navigate('/');
  }

  return (
    <div className="min-h-screen">
      <header className="nav-glass px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="font-display text-xl font-bold text-[#0a4f49]">{t(lang, 'brand')}</span>
          <div className="lang-switch" aria-label="Language">
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
            <button type="button" className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>
              हिन्दी
            </button>
            <button type="button" className={lang === 'te' ? 'active' : ''} onClick={() => setLang('te')}>
              తెలుగు
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="india-ribbon mb-5">
          <span className="saffron" />
          <span className="white" />
          <span className="green" />
          {L(lang, 'For every child in India · Ages 8–16', 'भारत के हर बच्चे के लिए · उम्र 8–16', 'భారత్‌లోని ప్రతి పిల్లవాడికి · వయసు 8–16')}
        </div>
        <img
          src={CHAR_ART.fox}
          alt="Quest Fox"
          className="mb-5 h-24 w-24 rounded-2xl object-cover char-frame animate-float"
        />
        <h1 className="font-display text-3xl font-bold text-[#0f2a26] md:text-5xl">
          {L(lang, 'Welcome to RightsQuest India', 'राइट्सक्वेस्ट इंडिया में स्वागत है', 'రైట్స్‌క్వెస్ట్ ఇండియాకు స్వాగతం')}
        </h1>
        <p className="mt-4 max-w-2xl text-base font-semibold text-[#3d5c56] md:text-lg">
          {L(
            lang,
            'One clear national experience for every learner — games, videos, stories, and lessons on child rights.',
            'हर शिक्षार्थी के लिए एक साफ़ राष्ट्रीय अनुभव — बाल अधिकार पर गेम, वीडियो, कहानियाँ और पाठ।',
            'ప్రతి నేర్చుకునేవారికి ఒకే జాతీయ అనుభవం — బాల హక్కులపై గేమ్స్, వీడియోలు, కథలు, పాఠాలు.'
          )}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            L(lang, 'Play rights games', 'अधिकार गेम खेलो', 'హక్కుల గేమ్స్ ఆడండి'),
            L(lang, 'Watch learning videos', 'लर्निंग वीडियो देखो', 'లెర్నింగ్ వీడియోలు చూడండి'),
            L(lang, 'Choose safe story paths', 'सुरक्षित कहानी रास्ते चुनो', 'సురక్షిత కథ మార్గాలు ఎంచుకోండి'),
            L(lang, 'Earn XP & badges', 'XP और बैज पाओ', 'XP & బ్యాడ్జ్‌లు సంపాదించండి'),
          ].map((item) => (
            <li key={item} className="rounded-xl border border-[#d5e5e0] bg-white px-4 py-3 text-sm font-bold text-[#0f2a26]">
              ✓ {item}
            </li>
          ))}
        </ul>

        <button className="btn-primary mt-10 w-full md:w-auto md:min-w-[260px]" type="button" onClick={finish}>
          {L(lang, 'Enter RightsQuest →', 'राइट्सक्वेस्ट में प्रवेश →', 'రైట్స్‌క్వెస్ట్‌లోకి ప్రవేశించండి →')}
        </button>
      </div>
    </div>
  );
}
