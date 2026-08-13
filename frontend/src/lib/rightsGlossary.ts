import type { Lang } from './i18n';

export type RightEntry = {
  id: string;
  icon: string;
  title: { en: string; hi: string; te: string };
  summary: { en: string; hi: string; te: string };
  example: { en: string; hi: string; te: string };
  law?: { en: string; hi: string; te: string };
};

export function rightText<T extends { en: string; hi: string; te: string }>(lang: Lang, obj: T) {
  if (lang === 'hi') return obj.hi;
  if (lang === 'te') return obj.te;
  return obj.en;
}

/** Core child rights for India's national literacy programme. */
export const CHILD_RIGHTS: RightEntry[] = [
  {
    id: 'safety',
    icon: '🛡️',
    title: { en: 'Right to Safety', hi: 'सुरक्षा का अधिकार', te: 'భద్రతా హక్కు' },
    summary: {
      en: 'Every child deserves to be safe from harm, violence, and neglect at home, school, and online.',
      hi: 'हर बच्चा घर, स्कूल और ऑनलाइन हानि, हिंसा और उपेक्षा से सुरक्षित रहने का हकदार है।',
      te: 'ప్రతి పిల్లవాడు ఇల్లు, పాఠశాల, ఆన్‌లైన్‌లో హాని, హింస, నిర్లక్ష్యం నుండి సురక్షితంగా ఉండే హక్కు కలిగి ఉంటాడు.',
    },
    example: {
      en: 'If someone hurts you or makes you uncomfortable, tell a trusted adult immediately.',
      hi: 'कोई चोट पहुँचाए या असहज करे तो तुरंत भरोसेमंद वयस्क को बताओ।',
      te: 'ఎవరైనా హాని చేస్తే లేదా అసౌకర్యం కలిగిస్తే వెంటనే నమ్మకమైన పెద్దవారికి చెప్పండి.',
    },
    law: { en: 'POCSO Act, 2012', hi: 'पॉक्सो अधिनियम, 2012', te: 'POCSO చట్టం, 2012' },
  },
  {
    id: 'education',
    icon: '📚',
    title: { en: 'Right to Education', hi: 'शिक्षा का अधिकार', te: 'విద్యా హక్కు' },
    summary: {
      en: 'Children aged 6–14 have the right to free and compulsory education in India.',
      hi: '6–14 वर्ष के बच्चों को भारत में मुफ़्त और अनिवार्य शिक्षा का अधिकार है।',
      te: '6–14 సంవత్సరాల పిల్లలకు భారతదేశంలో ఉచిత, తప్పనిసరి విద్య హక్కు ఉంది.',
    },
    example: {
      en: 'School cannot refuse admission because of your caste, religion, gender, or disability.',
      hi: 'जाति, धर्म, लिंग या विकलांगता के कारण स्कूल प्रवेश नहीं रोक सकता।',
      te: 'జాతి, మతం, లింగం లేదా వికలాంగత కారణంగా పాఠశాల ప్రవేశం నిరాకరించకూడదు.',
    },
    law: { en: 'RTE Act, 2009', hi: 'आरटीई अधिनियम, 2009', te: 'RTE చట్టం, 2009' },
  },
  {
    id: 'voice',
    icon: '🗣️',
    title: { en: 'Right to Be Heard', hi: 'सुने जाने का अधिकार', te: 'వినిపించుకునే హక్కు' },
    summary: {
      en: 'Your opinions matter. Adults should listen to children in decisions that affect them.',
      hi: 'तुम्हारी राय मायने रखती है। बच्चों को प्रभावित करने वाले फैसलों में सुनना चाहिए।',
      te: 'మీ అభిప్రాయాలు ముఖ్యం. పిల్లలను ప్రభావితం చేసే నిర్ణయాలలో వినాలి.',
    },
    example: {
      en: 'You can speak up in class meetings, family talks, or school councils respectfully.',
      hi: 'कक्षा बैठक, परिवार या स्कूल परिषद में सम्मान से बोल सकते हो।',
      te: 'తరగతి సమావేశం, కుటుంబ చర్చ, పాఠశాల కౌన్సిల్‌లో గౌరవంగా మాట్లాడవచ్చు.',
    },
    law: { en: 'UNCRC Article 12', hi: 'यूएनसीआरसी धारा 12', te: 'UNCRC అనుచ్ఛేదం 12' },
  },
  {
    id: 'health',
    icon: '💚',
    title: { en: 'Right to Health', hi: 'स्वास्थ्य का अधिकार', te: 'ఆరోగ్య హక్కు' },
    summary: {
      en: 'Children have the right to nutritious food, clean water, healthcare, and a healthy environment.',
      hi: 'बच्चों को पौष्टिक भोजन, स्वच्छ पानी, स्वास्थ्य सेवा और स्वस्थ वातावरण का अधिकार है।',
      te: 'పిల్లలకు పోషకాహారం, శుభ్ర నీరు, ఆరోగ్య సంరక్షణ, ఆరోగ్యకర వాతావరణం హక్కు ఉంది.',
    },
    example: {
      en: 'Schools should have clean toilets and safe drinking water for every student.',
      hi: 'स्कूल में हर छात्र के लिए स्वच्छ शौचालय और सुरक्षित पेयजल होना चाहिए।',
      te: 'ప్రతి విద్యార్థికి శుభ్ర మరుగుదొడ్లు, సురక్షిత తాగునీరు ఉండాలి.',
    },
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: { en: 'Right to Privacy', hi: 'निजता का अधिकार', te: 'గోప్యతా హక్కు' },
    summary: {
      en: 'Your personal information — photos, address, passwords — should be protected, especially online.',
      hi: 'तुम्हारी निजी जानकारी — फोटो, पता, पासवर्ड — सुरक्षित रहनी चाहिए, खासकर ऑनलाइन।',
      te: 'మీ వ్యక్తిగత సమాచారం — ఫోటోలు, చిరునామా, పాస్‌వర్డ్‌లు — రక్షించబడాలి.',
    },
    example: {
      en: 'Never share OTP, location, or school details with strangers in games or chats.',
      hi: 'गेम या चैट में अजनबियों को OTP, लोकेशन या स्कूल विवरण न दो।',
      te: 'గేమ్ లేదా చాట్‌లో అపరిచితులకు OTP, లొకేషన్, పాఠశాల వివరాలు ఇవ్వవద్దు.',
    },
  },
  {
    id: 'play',
    icon: '⚽',
    title: { en: 'Right to Play & Rest', hi: 'खेल और आराम का अधिकार', te: 'ఆట & విశ్రాంతి హక్కు' },
    summary: {
      en: 'Children need time to play, rest, and enjoy culture — not only study or work.',
      hi: 'बच्चों को खेल, आराम और संस्कृति का समय चाहिए — सिर्फ पढ़ाई या काम नहीं।',
      te: 'పిల్లలకు ఆట, విశ్రాంతి, సంస్కృతి ఆనందించే సమయం కావాలి.',
    },
    example: {
      en: 'Too much pressure or punishment for not studying can violate your rights.',
      hi: 'पढ़ाई न करने पर बहुत दबाव या सज़ा अधिकारों का उल्लंघन हो सकता है।',
      te: 'చదవకపోవడానికి ఎక్కువ ఒత్తిడి లేదా శిక్ష హక్కుల ఉల్లంఘన కావచ్చు.',
    },
  },
  {
    id: 'identity',
    icon: '🪪',
    title: { en: 'Right to Identity', hi: 'पहचान का अधिकार', te: 'గుర్తింపు హక్కు' },
    summary: {
      en: 'Every child has the right to a name, nationality, and to know and be cared for by parents.',
      hi: 'हर बच्चे को नाम, राष्ट्रीयता और माता-पिता की देखभाल का अधिकार है।',
      te: 'ప్రతి పిల్లవాడికి పేరు, పౌరసత్వం, తల్లిదండ్రుల సంరక్షణ హక్కు ఉంది.',
    },
    example: {
      en: 'Birth registration helps you access school, health services, and legal protection.',
      hi: 'जन्म पंजीकरण स्कूल, स्वास्थ्य सेवा और कानूनी सुरक्षा में मदद करता है।',
      te: 'జనన నమోదు పాఠశాల, ఆరోగ్య సేవలు, చట్టపరమైన రక్షణకు సహాయపడుతుంది.',
    },
  },
  {
    id: 'no-discrimination',
    icon: '🤝',
    title: { en: 'Right to Non-Discrimination', hi: 'भेदभाव न होने का अधिकार', te: 'వివక్ష లేకుండా ఉండే హక్కు' },
    summary: {
      en: 'No child should be treated unfairly because of caste, religion, gender, disability, or where they live.',
      hi: 'किसी बच्चे के साथ जाति, धर्म, लिंग, विकलांगता या जगह के कारण अन्याय नहीं होना चाहिए।',
      te: 'జాతి, మతం, లింగం, వికలాంగత లేదా నివాసం కారణంగా అన్యాయం జరగకూడదు.',
    },
    example: {
      en: 'If you are excluded from school activities unfairly, talk to a teacher or counsellor.',
      hi: 'अगर स्कूल गतिविधियों से अन्यायपूर्ण बाहर किया जाए, शिक्षक या परामर्शदाता से बात करो।',
      te: 'పాఠశాల కార్యక్రమాల నుండి అన్యాయంగా విస్మరించబడితే టీచర్ లేదా కౌన్సిలర్‌తో మాట్లాడండి.',
    },
    law: { en: 'Constitution Articles 14–15', hi: 'संविधान धारा 14–15', te: 'భారత శాసన అనుచ్ఛేదాలు 14–15' },
  },
];
