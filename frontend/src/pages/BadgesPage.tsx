import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string | null;
};

export function BadgesPage() {
  const { lang } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    api<{ badges: Badge[] }>('/gamification/badges').then((d) => setBadges(d.badges));
  }, []);

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'badges')}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`panel p-5 ${b.earned ? 'ring-2 ring-orange-400' : 'opacity-70'}`}
          >
            <div className="text-4xl">{b.icon}</div>
            <p className="mt-2 text-lg font-extrabold">{b.name}</p>
            <p className="mt-1 text-sm text-teal-900/70">{b.description}</p>
            <p className="mt-3 text-xs font-bold uppercase text-teal-700">
              {b.earned ? 'Unlocked' : 'Locked'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
