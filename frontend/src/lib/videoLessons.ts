import type { Lang } from './i18n';

export type VideoLesson = {
  id: string;
  youtubeId: string;
  youtubeByLang?: Partial<Record<Lang, string>>;
  minutes: number;
  category: { en: string; hi: string; te: string };
  title: { en: string; hi: string; te: string };
  summary: { en: string; hi: string; te: string };
  takeaway: { en: string; hi: string; te: string };
  ages: string;
};

/** Curated educational videos (verified YouTube embeds). Awareness only. */
export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'rights-all',
    youtubeId: '6F7ie1Z07aM',
    minutes: 4,
    ages: '8–16',
    category: { en: 'Basic Rights', hi: 'मूल अधिकार', te: 'ప్రాథమిక హక్కులు' },
    title: {
      en: 'We all have rights',
      hi: 'हम सबके पास अधिकार हैं',
      te: 'మనందరికీ హక్కులు ఉన్నాయి',
    },
    summary: {
      en: 'A friendly UNICEF film: every child has rights — to be safe, learn, and be heard.',
      hi: 'यूनिसेफ की फिल्म: हर बच्चे को सुरक्षा, शिक्षा और सुने जाने का अधिकार है।',
      te: 'యూనిసెఫ్ చిత్రం: ప్రతి పిల్లవాడికి భద్రత, విద్య, వినిపించుకునే హక్కు ఉంది.',
    },
    takeaway: {
      en: 'Rights belong to you — they are not rewards. Tell a trusted adult if something feels wrong.',
      hi: 'अधिकार तुम्हारे हैं — इनाम नहीं। गलत लगे तो भरोसेमंद वयस्क को बताओ।',
      te: 'హక్కులు మీవి — బహుమతులు కావు. తప్పుగా అనిపిస్తే నమ్మకమైన పెద్దవారికి చెప్పండి.',
    },
  },
  {
    id: 'online-safe',
    youtubeId: '25G4tLVH1JE',
    minutes: 4,
    ages: '10–16',
    category: { en: 'Online Safety', hi: 'ऑनलाइन सुरक्षा', te: 'ఆన్‌లైన్ భద్రత' },
    title: {
      en: 'Internet safety & privacy',
      hi: 'इंटरनेट सुरक्षा और निजता',
      te: 'ఇంటర్నెట్ భద్రత & గోప్యత',
    },
    summary: {
      en: 'Learn strong passwords, privacy settings, and how to keep accounts safe.',
      hi: 'मज़बूत पासवर्ड, प्राइवेसी सेटिंग और खाते सुरक्षित रखना सीखो।',
      te: 'బలమైన పాస్‌వర్డ్‌లు, ప్రైవసీ సెట్టింగ్‌లు నేర్చుకోండి.',
    },
    takeaway: {
      en: 'Never share OTP, address, or school details with online strangers. Block and tell an adult.',
      hi: 'ऑनलाइन अजनबी को OTP, पता या स्कूल न बताओ। ब्लॉक करो और वयस्क को बताओ।',
      te: 'ఆన్‌లైన్ అపరిచితులకు OTP, చిరునామా చెప్పవద్దు. బ్లాక్ చేసి పెద్దవారికి చెప్పండి.',
    },
  },
  {
    id: 'passwords',
    youtubeId: 'qLMIK5YVgfA',
    minutes: 2,
    ages: '10–16',
    category: { en: 'Online Safety', hi: 'ऑनलाइन सुरक्षा', te: 'ఆన్‌లైన్ భద్రత' },
    title: {
      en: 'Strong passwords',
      hi: 'मज़बूत पासवर्ड',
      te: 'బలమైన పాస్‌వర్డ్‌లు',
    },
    summary: {
      en: 'Code.org tip: long, unique passwords protect your games and accounts.',
      hi: 'लंबे, अलग-अलग पासवर्ड तुम्हारे अकाउंट बचाते हैं।',
      te: 'పొడవైన, ప్రత్యేక పాస్‌వర్డ్‌లు మీ ఖాతాలను కాపాడతాయి.',
    },
    takeaway: {
      en: 'Use a different password for each important account. Share only with a parent if needed.',
      hi: 'हर महत्वपूर्ण अकाउंट के लिए अलग पासवर्ड। ज़रूरत हो तो सिर्फ़ अभिभावक से साझा करो।',
      te: 'ప్రతి ముఖ్య ఖాతాకు వేరే పాస్‌వర్డ్. అవసరమైతే తల్లిదండ్రులతో మాత్రమే పంచుకోండి.',
    },
  },
  {
    id: 'komal-safe',
    youtubeId: '3WyHuHspbjk',
    minutes: 10,
    ages: '8–16',
    category: { en: 'Protection', hi: 'सुरक्षा', te: 'రక్షణ' },
    title: {
      en: 'Komal — safe & unsafe touch',
      hi: 'कोमल — सुरक्षित और असुरक्षित स्पर्श',
      te: 'కోమల్ — సురక్షిత & అసురక్షిత స్పర్శ',
    },
    summary: {
      en: 'Award-winning Childline / MWCD film: your body belongs to you. Ask for help.',
      hi: 'राष्ट्रीय पुरस्कार फिल्म: शरीर तुम्हारा है। मदद माँगो। भारत में 1098।',
      te: 'జాతీయ అవార్డు చిత్రం: మీ శరీరం మీది. సహాయం అడగండి. భారత్‌లో 1098.',
    },
    takeaway: {
      en: 'Say NO, get away if you can, and tell a trusted adult. In India call Childline 1098.',
      hi: 'ना कहो, दूर हो, भरोसेमंद वयस्क को बताओ। भारत में 1098 कॉल करो।',
      te: 'నో చెప్పండి, దూరంగా ఉండండి, పెద్దవారికి చెప్పండి. భారత్‌లో 1098కి కాల్ చేయండి.',
    },
  },
  {
    id: 'your-voice',
    youtubeId: '4z7gDsSKUmU',
    minutes: 4,
    ages: '8–13',
    category: { en: 'My Voice', hi: 'मेरी आवाज़', te: 'నా స్వరం' },
    title: {
      en: 'Your ideas can help',
      hi: 'तुम्हारे विचार मदद कर सकते हैं',
      te: 'మీ ఆలోచనలు సహాయపడతాయి',
    },
    summary: {
      en: 'A fun reminder: children have a voice — speak kindly and ask adults to listen.',
      hi: 'बच्चों की आवाज़ मायने रखती है — दया से बोलो और वयस्कों से सुनने को कहो।',
      te: 'పిల్లల స్వరం ముఖ్యం — దయగా మాట్లాడండి, పెద్దవారు వినాలని అడగండి.',
    },
    takeaway: {
      en: 'You have the right to be heard. Share ideas with a teacher or trusted adult.',
      hi: 'सुने जाने का अधिकार तुम्हारा है। शिक्षक या भरोसेमंद वयस्क से साझा करो।',
      te: 'వినిపించుకునే హక్కు మీది. టీచర్ లేదా నమ్మకమైన పెద్దవారితో పంచుకోండి.',
    },
  },
];

export function videoYoutubeId(v: VideoLesson, lang: Lang) {
  return v.youtubeByLang?.[lang] || v.youtubeId;
}

export function videoTitle(v: VideoLesson, lang: Lang) {
  return v.title[lang] || v.title.en;
}

export function videoSummary(v: VideoLesson, lang: Lang) {
  return v.summary[lang] || v.summary.en;
}

export function videoTakeaway(v: VideoLesson, lang: Lang) {
  return v.takeaway[lang] || v.takeaway.en;
}

export function videoCategory(v: VideoLesson, lang: Lang) {
  return v.category[lang] || v.category.en;
}

export function embedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;
}

const WATCHED_KEY = 'rq_videos_watched';

export function loadWatched(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WATCHED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveWatched(ids: string[]) {
  localStorage.setItem(WATCHED_KEY, JSON.stringify(ids));
}
