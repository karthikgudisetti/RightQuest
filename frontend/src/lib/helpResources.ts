import type { Lang } from './i18n';

export type Helpline = {
  id: string;
  name: { en: string; hi: string; te: string };
  number: string;
  hours: { en: string; hi: string; te: string };
  about: { en: string; hi: string; te: string };
  icon: string;
  urgent?: boolean;
};

export type SafetyStep = {
  step: number;
  text: { en: string; hi: string; te: string };
};

function L<T extends { en: string; hi: string; te: string }>(lang: Lang, obj: T) {
  if (lang === 'hi') return obj.hi;
  if (lang === 'te') return obj.te;
  return obj.en;
}

export { L as helpL };

/** Verified national helplines for children in India (awareness only). */
export const HELPLINES: Helpline[] = [
  {
    id: 'childline',
    name: { en: 'Childline India', hi: 'चाइल्डलाइन इंडिया', te: 'చైల్డ్‌లైన్ ఇండియా' },
    number: '1098',
    hours: { en: '24 hours, every day', hi: '24 घंटे, हर दिन', te: '24 గంటలు, ప్రతి రోజు' },
    about: {
      en: 'Free, confidential help for children in distress. Call if you feel unsafe, scared, or need someone to listen.',
      hi: 'संकट में बच्चों के लिए मुफ़्त, गोपनीय मदद। असुरक्षित लगे तो कॉल करो।',
      te: 'ఇబ్బందిలో ఉన్న పిల్లలకు ఉచిత, గోప్య సహాయం. అసురక్షితంగా అనిపిస్తే కాల్ చేయండి.',
    },
    icon: '📞',
    urgent: true,
  },
  {
    id: 'ncpcr',
    name: { en: 'NCPCR (Child Rights)', hi: 'एनसीपीसीआर (बाल अधिकार)', te: 'NCPCR (పిల్లల హక్కులు)' },
    number: '9868235077',
    hours: { en: 'Mon–Fri, working hours', hi: 'सोम–शुक्र, कार्य समय', te: 'సోమ–శుక్ర, పని గంటలు' },
    about: {
      en: 'National Commission for Protection of Child Rights — report violations of child rights.',
      hi: 'बाल अधिकारों के उल्लंघन की रिपोर्ट करें।',
      te: 'పిల్లల హక్కుల ఉల్లంఘనలను నివేదించండి.',
    },
    icon: '🛡️',
  },
  {
    id: 'women',
    name: { en: 'Women Helpline', hi: 'महिला हेल्पलाइन', te: 'మహిళా హెల్ప్‌లైన్' },
    number: '181',
    hours: { en: '24 hours in most states', hi: 'अधिकांश राज्यों में 24 घंटे', te: 'చాలా రాష్ట్రాల్లో 24 గంటలు' },
    about: {
      en: 'Support for women and girls facing violence or abuse. You can also tell a trusted adult.',
      hi: 'हिंसा या दुर्व्यवहार का सामना करने वाली महिलाओं/लड़कियों के लिए सहायता।',
      te: 'హింస లేదా దుర్వినియోగానికి గురైన మహిళలు/అమ్మాయిలకు మద్దతు.',
    },
    icon: '💜',
  },
  {
    id: 'cyber',
    name: { en: 'Cyber Crime Helpline', hi: 'साइबर अपराध हेल्पलाइन', te: 'సైబర్ క్రైమ్ హెల్ప్‌లైన్' },
    number: '1930',
    hours: { en: '24 hours', hi: '24 घंटे', te: '24 గంటలు' },
    about: {
      en: 'Report online bullying, blackmail, or harmful content. Save screenshots and tell an adult.',
      hi: 'ऑनलाइन बुलिंग, ब्लैकमेल रिपोर्ट करो। स्क्रीनशॉट सेव करो और वयस्क को बताओ।',
      te: 'ఆన్‌లైన్ బుల్లింగ్, బ్లాక్‌మెయిల్ నివేదించండి. స్క్రీన్‌షాట్‌లు సేవ్ చేసి పెద్దవారికి చెప్పండి.',
    },
    icon: '💻',
  },
  {
    id: 'police',
    name: { en: 'Police Emergency', hi: 'पुलिस आपातकाल', te: 'పోలీస్ అత్యవసరం' },
    number: '112',
    hours: { en: '24 hours', hi: '24 घंटे', te: '24 గంటలు' },
    about: {
      en: 'For immediate danger only. Tell a trusted adult first if you can.',
      hi: 'तुरंत खतरे के लिए। संभव हो तो पहले भरोसेमंद वयस्क को बताओ।',
      te: 'తక్షణ ప్రమాదానికి మాత్రమే. సాధ్యమైతే ముందు నమ్మకమైన పెద్దవారికి చెప్పండి.',
    },
    icon: '🚨',
    urgent: true,
  },
];

export const SAFETY_STEPS: SafetyStep[] = [
  {
    step: 1,
    text: {
      en: 'Stay calm. You are brave for noticing something is wrong.',
      hi: 'शांत रहो। गलत बात पहचानना बहादुरी है।',
      te: 'శాంతంగా ఉండండి. తప్పు గుర్తించడం ధైర్యం.',
    },
  },
  {
    step: 2,
    text: {
      en: 'Tell a trusted adult — parent, teacher, school counsellor, or relative.',
      hi: 'भरोसेमंद वयस्क को बताओ — माता-पिता, शिक्षक, या रिश्तेदार।',
      te: 'నమ్మకమైన పెద్దవారికి చెప్పండి — తల్లిదండ్రులు, టీచర్, లేదా బంధువు.',
    },
  },
  {
    step: 3,
    text: {
      en: 'If you cannot tell anyone nearby, call Childline 1098 — free and confidential.',
      hi: 'पास कोई न हो तो चाइल्डलाइन 1098 कॉल करो — मुफ़्त और गोपनीय।',
      te: 'దగ్గరలో ఎవరూ లేకపోతే చైల్డ్‌లైన్ 1098కి కాల్ చేయండి.',
    },
  },
  {
    step: 4,
    text: {
      en: 'Remember: abuse is never your fault. Adults must protect children.',
      hi: 'याद रखो: दुर्व्यवहार कभी तुम्हारी गलती नहीं। वयस्कों को बच्चों की रक्षा करनी चाहिए।',
      te: 'గుర్తుంచుకోండి: దుర్వినియోగం మీ తప్పు కాదు. పెద్దవారు పిల్లలను రక్షించాలి.',
    },
  },
];

export const PARENT_TIPS: { title: { en: string; hi: string; te: string }; body: { en: string; hi: string; te: string } }[] = [
  {
    title: { en: 'Listen without blame', hi: 'बिना दोष लगाए सुनें', te: 'దోషం లేకుండా వినండి' },
    body: {
      en: 'If a child shares something hard, thank them for telling you. Believe them and stay calm.',
      hi: 'अगर बच्चा कुछ कठिन बताए, धन्यवाद कहें। उन पर विश्वास करें और शांत रहें।',
      te: 'పిల్లవాడు కష్టమైన విషయం చెప్పితే, చెప్పినందుకు ధన్యవాదాలు చెప్పండి. నమ్మండి.',
    },
  },
  {
    title: { en: 'Set screen rules together', hi: 'स्क्रीन नियम साथ मिलकर', te: 'స్క్రీన్ నియమాలు కలిసి' },
    body: {
      en: 'Agree on privacy, stranger chats, and what to do if something feels wrong online.',
      hi: 'गोपनीयता, अजनबी चैट और ऑनलाइन गलत लगने पर क्या करना है — साथ तय करें।',
      te: 'గోప్యత, అపరిచితుల చాట్, ఆన్‌లైన్ తప్పుగా అనిపిస్తే ఏమి చేయాలి — కలిసి నిర్ణయించండి.',
    },
  },
  {
    title: { en: 'Know the law basics', hi: 'कानून की बुनियाद जानें', te: 'చట్టం ప్రాథమికాలు తెలుసుకోండి' },
    body: {
      en: 'POCSO protects children from sexual abuse. RTE gives every child the right to education.',
      hi: 'पॉक्सो बच्चों की सुरक्षा करता है। आरटीई शिक्षा का अधिकार देता है।',
      te: 'POCSO పిల్లలను రక్షిస్తుంది. RTE ప్రతి పిల్లవాడికి విద్యా హక్కు ఇస్తుంది.',
    },
  },
];
