import type { Lang } from './i18n';

export type AgeBand = '8-10' | '10-13' | '13-16';

/** Kept for profile data only — UI is the same for all ages. */
export function normalizeAge(age?: string | null): AgeBand {
  if (age === '8-10' || age === '13-16') return age;
  return '10-13';
}

/** Single national UX copy (EN / HI / TE). Same UI for every learner. */
export function ageGuide(_age: string | null | undefined, lang: Lang = 'en') {
  const copy = {
    en: {
      greeting: 'Welcome to RightsQuest India!',
      tip: 'Learn your rights safely — through games, videos, stories, and lessons.',
      choicePrompt: 'What would you do?',
      quizPrompt: 'Choose the strongest rights-smart answer.',
      storyHint: 'Watch the scene, then pick the safest path.',
      feedbackGood: 'Great decision!',
      feedbackLearn: 'Learning moment — here is why.',
      gamesTitle: 'Rights Quest Games',
      gamesSub: 'Puzzles and challenges that teach child rights.',
    },
    hi: {
      greeting: 'राइट्सक्वेस्ट इंडिया में आपका स्वागत है!',
      tip: 'गेम, वीडियो, कहानियाँ और पाठ से अपने अधिकार सुरक्षित सीखो।',
      choicePrompt: 'तुम क्या करोगे?',
      quizPrompt: 'सबसे सही अधिकार-स्मार्ट जवाब चुनो।',
      storyHint: 'दृश्य देखो, फिर सबसे सुरक्षित रास्ता चुनो।',
      feedbackGood: 'शानदार फैसला!',
      feedbackLearn: 'सीखने का मौका — कारण यहाँ है।',
      gamesTitle: 'अधिकार क्वेस्ट गेम्स',
      gamesSub: 'पज़ल और चुनौतियाँ जो बाल अधिकार सिखाती हैं।',
    },
    te: {
      greeting: 'రైట్స్‌క్వెస్ట్ ఇండియాకు స్వాగతం!',
      tip: 'గేమ్స్, వీడియోలు, కథలు, పాఠాలతో మీ హక్కులు సురక్షితంగా నేర్చుకోండి.',
      choicePrompt: 'మీరు ఏమి చేస్తారు?',
      quizPrompt: 'ఉత్తమమైన సమాధానం ఎంచుకోండి.',
      storyHint: 'దృశ్యం చూసి సురక్షిత మార్గం ఎంచుకోండి.',
      feedbackGood: 'చాలా బాగుంది!',
      feedbackLearn: 'నేర్చుకునే అవకాశం — కారణం ఇక్కడ.',
      gamesTitle: 'హక్కుల క్వెస్ట్ గేమ్స్',
      gamesSub: 'బాల హక్కులు నేర్పే పజిల్స్ మరియు సవాళ్లు.',
    },
  } as const;

  const langKey = (lang in copy ? lang : 'en') as keyof typeof copy;
  return {
    band: '8-16' as const,
    ...copy[langKey],
    textScale: 'text-base md:text-lg',
    titleScale: 'text-3xl md:text-4xl',
    motion: 'national' as const,
    showMascot: true,
    choiceIcons: true,
    confetti: true,
  };
}

export const SCENE_THEMES: Record<string, { emoji: string; gradient: string; accent: string }> = {
  school: { emoji: '🏫', gradient: 'from-[#0d6b63] to-[#0f766e]', accent: 'bg-sky-100' },
  online: { emoji: '💻', gradient: 'from-[#0a4f49] to-[#0d6b63]', accent: 'bg-cyan-100' },
  home: { emoji: '🏠', gradient: 'from-[#b45309] to-[#d97706]', accent: 'bg-amber-100' },
  help: { emoji: '🛟', gradient: 'from-[#047857] to-[#059669]', accent: 'bg-emerald-100' },
  play: { emoji: '⚽', gradient: 'from-[#c2410c] to-[#ea580c]', accent: 'bg-orange-100' },
  default: { emoji: '🗺️', gradient: 'from-[#0a4f49] to-[#0d6b63]', accent: 'bg-teal-100' },
};

export function sceneThemeFromTitle(title: string, description = '') {
  const t = `${title} ${description}`.toLowerCase();
  if (t.includes('online') || t.includes('password') || t.includes('chat') || t.includes('otp') || t.includes('ऑनलाइन') || t.includes('पासवर्ड')) {
    return SCENE_THEMES.online;
  }
  if (t.includes('school') || t.includes('education') || t.includes('riya') || t.includes('स्कूल') || t.includes('शिक्षा')) {
    return SCENE_THEMES.school;
  }
  if (t.includes('help') || t.includes('childline') || t.includes('secret') || t.includes('मदद') || t.includes('राज़')) {
    return SCENE_THEMES.help;
  }
  if (t.includes('recess') || t.includes('play') || t.includes('football') || t.includes('खेल')) {
    return SCENE_THEMES.play;
  }
  if (t.includes('home') || t.includes('घर')) return SCENE_THEMES.home;
  return SCENE_THEMES.default;
}

export const CHOICE_ICONS = ['🛡️', '🌱', '⚡', '🧭', '💬', '🚪'];
