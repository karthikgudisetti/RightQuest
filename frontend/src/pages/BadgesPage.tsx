import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { ageGuide } from '../lib/ageGuide';

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
};

export function BadgesPage() {
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    api<{ badges: Badge[] }>('/gamification/badges').then((d) => setBadges(d.badges));
  }, []);

  return (
    <div className="animate-rise">
      <section className="hero-banner mb-6 px-6 py-7">
        <p className="eyebrow">Achievements</p>
        <h1 className={`mt-2 font-display font-bold text-[#12352f] ${guide.titleScale}`}>
          {t(lang, 'badges')}
        </h1>
        <p className="mt-2 muted">Unlock badges as you complete quests and quizzes.</p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`panel p-5 ${b.earned ? 'border-[#fbbf24]' : 'opacity-75'}`}
          >
            <div className="text-4xl">{b.icon}</div>
            <p className="mt-2 text-lg font-extrabold text-[#12352f]">{b.name}</p>
            <p className="mt-1 text-sm muted">{b.description}</p>
            <p className="mt-3 text-xs font-bold uppercase text-[#0d6b63]">
              {b.earned ? 'Unlocked' : 'Locked'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
