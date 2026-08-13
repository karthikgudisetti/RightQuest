import type { Lang } from './i18n';

export type DailyTip = {
  id: string;
  icon: string;
  text: { en: string; hi: string; te: string };
};

export const DAILY_TIPS: DailyTip[] = [
  {
    id: 't1',
    icon: '⭐',
    text: {
      en: 'Rights are yours from birth — not rewards you earn.',
      hi: 'अधिकार जन्म से तुम्हारे हैं — कमाए हुए इनाम नहीं।',
      te: 'హక్కులు జననం నుండే మీవి — సంపాదించిన బహుమతులు కావు.',
    },
  },
  {
    id: 't2',
    icon: '📞',
    text: {
      en: 'Childline 1098 is free, 24/7, and confidential for every child in India.',
      hi: 'चाइल्डलाइन 1098 भारत के हर बच्चे के लिए मुफ़्त, 24/7 और गोपनीय है।',
      te: 'చైల్డ్‌లైన్ 1098 భారతదేశంలో ప్రతి పిల్లవాడికి ఉచిత, 24/7, గోప్యం.',
    },
  },
  {
    id: 't3',
    icon: '🔐',
    text: {
      en: 'Never share OTP or passwords — even if someone says they are your friend.',
      hi: 'OTP या पासवर्ड कभी न साझा करो — चाहे कोई दोस्त कहे।',
      te: 'OTP లేదా పాస్‌వర్డ్‌లు ఎప్పుడూ షేర్ చేయవద్దు — స్నేహితుడని చెప్పినా.',
    },
  },
  {
    id: 't4',
    icon: '🗣️',
    text: {
      en: 'Speaking up kindly is a right. Trusted adults should listen to you.',
      hi: 'विनम्रता से बोलना अधिकार है। भरोसेमंद वयस्कों को सुनना चाहिए।',
      te: 'మర్యాదగా మాట్లాడటం హక్కు. నమ్మకమైన పెద్దవారు వినాలి.',
    },
  },
  {
    id: 't5',
    icon: '📚',
    text: {
      en: 'Education is free and compulsory for children aged 6–14 in India (RTE Act).',
      hi: 'भारत में 6–14 वर्ष के बच्चों के लिए शिक्षा मुफ़्त और अनिवार्य है।',
      te: 'భారతదేశంలో 6–14 సంవత్సరాల పిల్లలకు విద్య ఉచిత, తప్పనిసరి (RTE).',
    },
  },
  {
    id: 't6',
    icon: '🛡️',
    text: {
      en: 'If something feels wrong, it probably is. Tell someone you trust.',
      hi: 'अगर कुछ गलत लगे, शायद गलत ही है। किसी भरोसेमंद को बताओ।',
      te: 'ఏదైనా తప్పుగా అనిపిస్తే, బహుశా తప్పే. నమ్మకమైన వారికి చెప్పండి.',
    },
  },
  {
    id: 't7',
    icon: '🤝',
    text: {
      en: 'No one can treat you unfairly because of caste, religion, gender, or disability.',
      hi: 'कोई जाति, धर्म, लिंग या विकलांगता के कारण अन्याय नहीं कर सकता।',
      te: 'జాతి, మతం, లింగం, వికలాంగత కారణంగా అన్యాయం చేయరు.',
    },
  },
];

export function tipText(lang: Lang, tip: DailyTip) {
  if (lang === 'hi') return tip.text.hi;
  if (lang === 'te') return tip.text.te;
  return tip.text.en;
}

/** Same tip for everyone on a given calendar day. */
export function todayTip(): DailyTip {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_TIPS[day % DAILY_TIPS.length];
}
