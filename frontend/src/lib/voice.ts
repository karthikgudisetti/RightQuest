import type { Lang } from './i18n';

let speaking = false;

export function stopSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}

function pickVoice(lang: Lang) {
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'hi') {
    return (
      voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
      voices.find((v) => v.lang.toLowerCase().includes('in')) ||
      null
    );
  }
  if (lang === 'te') {
    return (
      voices.find((v) => v.lang.toLowerCase().startsWith('te')) ||
      voices.find((v) => v.lang.toLowerCase().includes('telugu')) ||
      voices.find((v) => v.lang.toLowerCase().includes('in')) ||
      null
    );
  }
  return (
    voices.find((v) => v.lang.toLowerCase() === 'en-in') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
}

function langCode(lang: Lang) {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'te') return 'te-IN';
  return 'en-IN';
}

/** Speak educational text with the child's selected language (EN / HI / TE). */
export function speak(text: string, lang: Lang, opts?: { rate?: number; onEnd?: () => void }) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) {
    opts?.onEnd?.();
    return;
  }
  stopSpeech();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langCode(lang);
  utter.rate = opts?.rate ?? (lang === 'en' ? 0.95 : 0.9);
  utter.pitch = 1.05;
  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;
  speaking = true;
  utter.onend = () => {
    speaking = false;
    opts?.onEnd?.();
  };
  utter.onerror = () => {
    speaking = false;
    opts?.onEnd?.();
  };
  const start = () => window.speechSynthesis.speak(utter);
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const v = pickVoice(lang);
      if (v) utter.voice = v;
      start();
    };
  } else {
    start();
  }
}

export type GameGuideKey =
  | 'words'
  | 'trail'
  | 'stars'
  | 'spotter'
  | 'match'
  | 'path'
  | 'links'
  | 'message'
  | 'clues'
  | 'story';

type Guide = { title: string; short: string; how: string; tip: string; message: string };

export function gameGuide(lang: Lang) {
  const guides: Record<Lang, Record<GameGuideKey, Guide>> = {
    en: {
      words: {
        title: 'Word Hunt',
        short: 'Words',
        how: 'Tap neighbouring letters (no drag). Clear Easy → Medium → Hard.',
        tip: 'Each word unlocks a rights message. Finish to unlock next level.',
        message: 'Finding words builds your rights power — one message at a time.',
      },
      trail: {
        title: 'Safe Trail',
        short: 'Trail',
        how: 'Tap neighbour cells to draw a path from 1 to the last number. Fill every square.',
        tip: 'Numbers must land on the correct step. Clear path if stuck.',
        message: 'A safe path is step by step — pause and ask when unsure.',
      },
      stars: {
        title: 'Safety Stars',
        short: 'Stars',
        how: 'Place one star per row and column. Grey cells are blocked. Stars cannot touch at corners.',
        tip: 'Think like boundaries that protect you.',
        message: 'Boundaries protect you. You deserve safety everywhere.',
      },
      spotter: {
        title: 'Safety Spotter',
        short: 'Spotter',
        how: 'Tap only the SAFE actions.',
        tip: 'Passwords and address stay private.',
        message: 'Your safety matters. Ask a trusted adult when unsure.',
      },
      match: {
        title: 'Rights Match',
        short: 'Match',
        how: 'Flip two cards. Match a right with its action.',
        tip: 'Education ↔ Go to school.',
        message: 'Every child has the right to learn and be safe.',
      },
      path: {
        title: 'Safe Path',
        short: 'Path',
        how: 'Choose the safest door each step.',
        tip: 'Asking for help is brave.',
        message: 'Kind, safe choices protect you and others.',
      },
      links: {
        title: 'Rights Links',
        short: 'Links',
        how: 'Find 4 groups of related words (Connections-style).',
        tip: 'Tap 4 cards, then Submit Group.',
        message: 'Rights, safety, kindness, and help belong together.',
      },
      message: {
        title: 'Message Puzzle',
        short: 'Puzzle',
        how: 'Arrange the word tiles to build the secret message.',
        tip: 'Tap tiles in the right order.',
        message: 'You are never alone. Trusted adults and Childline 1098 can help.',
      },
      clues: {
        title: 'Clue Quest',
        short: 'Clues',
        how: 'Read clues. Guess the theme.',
        tip: 'Think: school, online, or help?',
        message: 'Knowing your rights helps you make smart choices every day.',
      },
      story: {
        title: 'Story Theater',
        short: 'Story',
        how: 'Listen to the character, then choose safely.',
        tip: 'Use Play Voice anytime.',
        message: 'Your voice matters. Speak up kindly and safely.',
      },
    },
    hi: {
      words: {
        title: 'वर्ड हंट',
        short: 'शब्द',
        how: 'पास-पास अक्षर टैप करो (खींचना नहीं)। आसान → मध्यम → कठिन।',
        tip: 'हर शब्द संदेश खोलता है। पज़ल पूरा करो तो अगला लेवल।',
        message: 'शब्द ढूँढना तुम्हारी अधिकार शक्ति बढ़ाता है।',
      },
      trail: {
        title: 'सेफ ट्रेल',
        short: 'ट्रेल',
        how: '1 से आख़िरी नंबर तक पड़ोसी घरों पर टैप कर पथ बनाओ। हर घर भरो।',
        tip: 'नंबर सही कदम पर आने चाहिए। अटकोगे तो पथ साफ़ करो।',
        message: 'सुरक्षित रास्ता कदम-दर-कदम — शक हो तो पूछो।',
      },
      stars: {
        title: 'सेफ्टी स्टार्स',
        short: 'स्टार',
        how: 'हर पंक्ति व स्तंभ में एक स्टार। धूसर बंद। कोना न छुए।',
        tip: 'सीमाएँ सुरक्षा जैसी सोचो।',
        message: 'सीमाएँ तुम्हारी रक्षा करती हैं। हर जगह सुरक्षा तुम्हारा अधिकार है।',
      },
      spotter: {
        title: 'सेफ्टी स्पॉटर',
        short: 'स्पॉटर',
        how: 'सिर्फ़ सुरक्षित कामों पर टैप करो।',
        tip: 'पासवर्ड और पता निजी रखो।',
        message: 'तुम्हारी सुरक्षा ज़रूरी है। शक हो तो भरोसेमंद वयस्क से पूछो।',
      },
      match: {
        title: 'राइट्स मैच',
        short: 'मैच',
        how: 'दो कार्ड पलटो। अधिकार को काम से मिलाओ।',
        tip: 'शिक्षा ↔ स्कूल जाना।',
        message: 'हर बच्चे को सीखने और सुरक्षित रहने का अधिकार है।',
      },
      path: {
        title: 'सेफ पाथ',
        short: 'पाथ',
        how: 'हर कदम पर सबसे सुरक्षित दरवाज़ा चुनो।',
        tip: 'मदद माँगना साहस है।',
        message: 'दयालु और सुरक्षित चुनाव तुम्हारी रक्षा करते हैं।',
      },
      links: {
        title: 'राइट्स लिंक्स',
        short: 'लिंक्स',
        how: 'जुड़े हुए 4 शब्द-समूह ढूँढो।',
        tip: '4 कार्ड चुनो, फिर समूह जमा करो।',
        message: 'अधिकार, सुरक्षा, दया और मदद साथ चलते हैं।',
      },
      message: {
        title: 'संदेश पज़ल',
        short: 'पज़ल',
        how: 'शब्द टाइल्स सही क्रम में लगाओ।',
        tip: 'टाइल्स पर टैप करो।',
        message: 'तुम अकेले नहीं हो। भरोसेमंद वयस्क और चाइल्डलाइन 1098 मदद कर सकते हैं।',
      },
      clues: {
        title: 'क्ल्यू क्वेस्ट',
        short: 'क्ल्यू',
        how: 'संकेत पढ़ो। विषय अनुमान लगाओ।',
        tip: 'स्कूल, ऑनलाइन, या मदद?',
        message: 'अपने अधिकार जानना रोज़ सही चुनाव में मदद करता है।',
      },
      story: {
        title: 'स्टोरी थिएटर',
        short: 'कहानी',
        how: 'किरदार सुनो, फिर सुरक्षित चुनाव करो।',
        tip: 'आवाज़ के लिए Play Voice दबाओ।',
        message: 'तुम्हारी आवाज़ मायने रखती है।',
      },
    },
    te: {
      words: {
        title: 'వర్డ్ హంట్',
        short: 'పదాలు',
        how: 'పక్కపక్కన అక్షరాలు ట్యాప్ చేయండి (డ్రాగ్ వద్దు). సులభం → మధ్యస్థం → కష్టం.',
        tip: 'ప్రతి పదం సందేశం తెరుస్తుంది. పజిల్ పూర్తయితే తదుపరి లెవల్.',
        message: 'పదాలు కనుగొనడం మీ హక్కుల శక్తిని పెంచుతుంది.',
      },
      trail: {
        title: 'సేఫ్ ట్రైల్',
        short: 'ట్రైల్',
        how: '1 నుండి చివరి నంబర్ వరకు పక్క సెల్స్ ట్యాప్ చేసి పాత్ గీయండి. అన్నీ నింపండి.',
        tip: 'నంబర్లు సరైన అడుగున ఉండాలి. చిక్కుకుంటే క్లియర్ చేయండి.',
        message: 'సురక్షిత మార్గం అడుగడుగునా — సందేహం ఉంటే అడగండి.',
      },
      stars: {
        title: 'సేఫ్టీ స్టార్స్',
        short: 'స్టార్స్',
        how: 'ప్రతి అడ్డు/నిలువులో ఒక స్టార్. బూడిద బ్లాక్. మూల తాకవద్దు.',
        tip: 'రక్షణ హద్దుల్లా ఆలోచించండి.',
        message: 'హద్దులు మిమ్మల్ని కాపాడతాయి. ఎక్కడైనా రక్షణ మీ హక్కు.',
      },
      spotter: {
        title: 'సేఫ్టీ స్పాటర్',
        short: 'స్పాటర్',
        how: 'సురక్షిత చర్యలను మాత్రమే ట్యాప్ చేయండి.',
        tip: 'పాస్‌వర్డ్, చిరునామా రహస్యంగా ఉంచండి.',
        message: 'మీ భద్రత ముఖ్యం. సందేహం ఉంటే నమ్మకమైన పెద్దవారిని అడగండి.',
      },
      match: {
        title: 'రైట్స్ మ్యాచ్',
        short: 'మ్యాచ్',
        how: 'రెండు కార్డులు తిప్పి హక్కును చర్యతో కలపండి.',
        tip: 'విద్య ↔ స్కూల్‌కి వెళ్లడం.',
        message: 'ప్రతి పిల్లవాడికి నేర్చుకునే, సురక్షితంగా ఉండే హక్కు ఉంది.',
      },
      path: {
        title: 'సేఫ్ పాత్',
        short: 'పాత్',
        how: 'ప్రతి అడుగులో సురక్షిత ద్వారం ఎంచుకోండి.',
        tip: 'సహాయం అడగడం ధైర్యం.',
        message: 'దయగల, సురక్షిత ఎంపికలు మిమ్మల్ని కాపాడతాయి.',
      },
      links: {
        title: 'రైట్స్ లింక్స్',
        short: 'లింక్స్',
        how: 'సంబంధిత 4 పదాల గ్రూపులు కనుగొనండి.',
        tip: '4 కార్డులు ఎంచి Submit Group నొక్కండి.',
        message: 'హక్కులు, భద్రత, దయ, సహాయం కలిసి ఉంటాయి.',
      },
      message: {
        title: 'సందేశ పజిల్',
        short: 'పజిల్',
        how: 'పదాల టైల్స్ సరైన క్రమంలో అమర్చండి.',
        tip: 'టైల్స్‌పై ట్యాప్ చేయండి.',
        message: 'మీరు ఒంటరిగా లేరు. నమ్మకమైన పెద్దవారు మరియు చైల్డ్‌లైన్ 1098 సహాయం చేస్తాయి.',
      },
      clues: {
        title: 'క్లూ క్వెస్ట్',
        short: 'క్లూ',
        how: 'క్లూలు చదివి అంశం ఊహించండి.',
        tip: 'స్కూల్, ఆన్‌లైన్, లేదా సహాయం?',
        message: 'మీ హక్కులు తెలుసుకోవడం ప్రతి రోజు మంచి ఎంపికలు చేయడానికి సహాయపడుతుంది.',
      },
      story: {
        title: 'స్టోరీ థియేటర్',
        short: 'కథ',
        how: 'పాత్రను విని సురక్షితంగా ఎంచుకోండి.',
        tip: 'Play Voice నొక్కి మళ్లీ వినండి.',
        message: 'మీ గొంతు ముఖ్యం. ధైర్యంగా, సురక్షితంగా మాట్లాడండి.',
      },
    },
  };
  return guides[lang] || guides.en;
}
