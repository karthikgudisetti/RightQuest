/** Single national visual theme for RightsQuest India (all ages 8–16). */

import type { Lang } from './i18n';
import { ageGuide } from './ageGuide';

export function ageTheme(_age?: string | null) {
  return {
    band: '8-16' as const,
    shellClass: 'national-shell',
    heroClass: 'hero-national',
    cardClass: 'card-national',
    navTone: 'national' as const,
    homeCta: { en: 'Start playing', hi: 'खेल शुरू करो', te: 'ఆడటం మొదలుపెట్టండి' },
    storiesCta: { en: 'Open stories', hi: 'कहानियाँ खोलो', te: 'కథలు తెరవండి' },
    gamesLabel: { en: 'Quest games', hi: 'क्वेस्ट गेम्स', te: 'క్వెస్ట్ గేమ్స్' },
    badgeLabel: { en: 'Your badges', hi: 'तुम्हारे बैज', te: 'మీ బ్యాడ్జ్‌లు' },
    learnLabel: { en: 'Continue learning', hi: 'सीखना जारी रखो', te: 'నేర్చుకోవడం కొనసాగించండి' },
  };
}

export function ageCopy(age: string | null | undefined, lang: Lang) {
  return ageGuide(age, lang);
}
