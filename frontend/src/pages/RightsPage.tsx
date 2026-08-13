import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { type Lang } from '../lib/i18n';
import { ageGuide } from '../lib/ageGuide';
import { CHILD_RIGHTS, rightText } from '../lib/rightsGlossary';
import { speak } from '../lib/voice';
import { CHAR_ART } from '../lib/characters';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function RightsPage() {
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [activeId, setActiveId] = useState(CHILD_RIGHTS[0]?.id);
  const active = CHILD_RIGHTS.find((r) => r.id === activeId) || CHILD_RIGHTS[0];

  if (!active) return null;

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
            src={CHAR_ART.kabir}
            alt="Rights Guide"
            className="h-20 w-20 rounded-2xl object-cover char-frame animate-float"
          />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/80">
              {L(lang, 'Know Your Rights', 'अपने अधिकार जानो', 'మీ హక్కులు తెలుసుకోండి')}
            </p>
            <h1 className={`mt-2 font-display font-bold text-white ${guide.titleScale}`}>
              {L(lang, 'Every child in India has rights', 'भारत के हर बच्चे के अधिकार हैं', 'భారతదేశంలో ప్రతి పిల్లవాడికి హక్కులు ఉన్నాయి')}
            </h1>
            <p className={`mt-2 max-w-xl font-semibold text-white/90 ${guide.textScale}`}>
              {L(
                lang,
                'Tap a right to learn what it means — in simple words.',
                'अधिकार पर टैप करो — सरल शब्दों में समझो।',
                'హక్కుపై ట్యాప్ చేసి సరళంగా నేర్చుకోండి.'
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <aside className="rights-pick-grid">
          {CHILD_RIGHTS.map((r) => {
            const selected = r.id === active.id;
            return (
              <button
                key={r.id}
                type="button"
                className={`rights-pick ${selected ? 'active' : ''}`}
                onClick={() => setActiveId(r.id)}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="font-display text-sm font-bold text-[#0f2a26]">
                  {rightText(lang, r.title)}
                </span>
              </button>
            );
          })}
        </aside>

        <section className="game-board p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef6f3] text-4xl">
              {active.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold text-[#0f2a26]">
                {rightText(lang, active.title)}
              </h2>
              {active.law && (
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#0d6b63]">
                  {rightText(lang, active.law)}
                </p>
              )}
            </div>
          </div>

          <p className="mt-5 text-base font-semibold leading-relaxed text-[#12352f]">
            {rightText(lang, active.summary)}
          </p>

          <div className="message-glow mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#b45309]">
              {L(lang, 'Example', 'उदाहरण', 'ఉదాహరణ')}
            </p>
            <p className="mt-1 font-extrabold text-[#0c2e2a]">{rightText(lang, active.example)}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => speak(rightText(lang, active.summary), lang)}
            >
              🔊 {L(lang, 'Hear this', 'सुनो', 'వినండి')}
            </button>
            <Link className="btn-secondary" to="/learn">
              {L(lang, 'Learn more in lessons', 'पाठों में और सीखो', 'పాఠాలలో మరింత నేర్చుకోండి')}
            </Link>
            <Link className="btn-secondary" to="/help">
              {L(lang, 'Get help', 'मदद लो', 'సహాయం పొందండి')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
