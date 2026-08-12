import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function tr(
  contentType: string,
  contentId: string,
  language: string,
  field: string,
  translatedText: string
) {
  await prisma.contentTranslation.upsert({
    where: {
      contentType_contentId_language_field: { contentType, contentId, language, field },
    },
    create: { contentType, contentId, language, field, translatedText },
    update: { translatedText },
  });
}

async function main() {
  console.log('Seeding RightsQuest India...');

  await prisma.userBadge.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.scenarioAttempt.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.scenarioChoice.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.learningModule.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.contentTranslation.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const child = await prisma.user.create({
    data: {
      name: 'Asha',
      email: 'child@demo.com',
      passwordHash,
      role: 'CHILD',
      preferredLanguage: 'en',
      ageGroup: '10-13',
      xp: 0,
      level: 1,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
      preferredLanguage: 'en',
    },
  });

  const modulesData = [
    {
      title: 'Understanding My Rights',
      titleHi: 'मेरे अधिकार समझें',
      description: 'Learn what children\'s rights mean in everyday life.',
      descriptionHi: 'जानें कि बच्चों के अधिकार रोज़मर्रा की ज़िंदगी में क्या मतलब रखते हैं।',
      category: 'Basic Rights',
      ageGroup: '10-13',
      difficulty: 'Beginner',
      sequenceNumber: 1,
      lessons: [
        {
          title: 'What is a right?',
          titleHi: 'अधिकार क्या है?',
          content:
            'A right is something every child should have so they can grow safely and happily. Rights are not rewards — they belong to you because you are a child. In India, laws and the Constitution protect children\'s dignity, education, health, and safety.\n\nRemember: knowing your rights helps you speak up kindly and ask a trusted adult for help when something feels wrong.',
          contentHi:
            'अधिकार वह चीज़ है जो हर बच्चे को सुरक्षित और खुश रहने के लिए मिलनी चाहिए। अधिकार इनाम नहीं हैं — वे आपके हैं क्योंकि आप बच्चे हैं। भारत में कानून और संविधान बच्चों की गरिमा, शिक्षा, स्वास्थ्य और सुरक्षा की रक्षा करते हैं।',
        },
        {
          title: 'Rights and responsibilities',
          titleHi: 'अधिकार और जिम्मेदारियाँ',
          content:
            'Rights and responsibilities go together. You have the right to be treated with respect — and you can also treat others kindly. If someone breaks a rule that keeps children safe, tell a teacher, parent, or counsellor. You do not have to solve big problems alone.',
          contentHi:
            'अधिकार और जिम्मेदारियाँ साथ चलते हैं। आपको सम्मान के साथ व्यवहार का अधिकार है — और आप दूसरों के साथ भी अच्छा व्यवहार कर सकते हैं।',
        },
      ],
    },
    {
      title: 'Right to Education',
      titleHi: 'शिक्षा का अधिकार',
      description: 'Every child deserves to learn. Discover what this right means.',
      descriptionHi: 'हर बच्चे को सीखने का हक है। जानें इस अधिकार का मतलब।',
      category: 'Education Rights',
      ageGroup: '10-13',
      difficulty: 'Beginner',
      sequenceNumber: 2,
      lessons: [
        {
          title: 'School is for every child',
          titleHi: 'स्कूल हर बच्चे के लिए है',
          content:
            'In India, children aged 6 to 14 have a right to free and compulsory education. No one should force a child to skip school to work during school hours. If school feels unsafe or unfair, talk to a trusted adult at school or home.',
          contentHi:
            'भारत में 6 से 14 वर्ष के बच्चों को मुफ़्त और अनिवार्य शिक्षा का अधिकार है। किसी को भी बच्चे को स्कूल छोड़कर काम करने के लिए मजबूर नहीं करना चाहिए।',
        },
      ],
    },
    {
      title: 'Online Safety',
      titleHi: 'ऑनलाइन सुरक्षा',
      description: 'Stay safe while chatting, gaming, and exploring the internet.',
      descriptionHi: 'चैट, गेमिंग और इंटरनेट पर सुरक्षित रहें।',
      category: 'Online Safety',
      ageGroup: '10-14',
      difficulty: 'Beginner',
      sequenceNumber: 3,
      lessons: [
        {
          title: 'Private info stays private',
          titleHi: 'निजी जानकारी निजी रखें',
          content:
            'Never share your full name, home address, school name, phone number, or passwords with strangers online. Real friends you meet only online can still be strangers. If someone asks for photos or secrets, pause and tell a trusted adult.\n\nSafe tip: Use privacy settings, block/report unkind users, and keep your accounts locked with strong passwords.',
          contentHi:
            'अजनबियों के साथ अपना पूरा नाम, घर का पता, स्कूल, फ़ोन नंबर या पासवर्ड कभी साझा न करें। अगर कोई फ़ोटो या राज़ माँगे, रुकें और किसी भरोसेमंद वयस्क को बताएँ।',
        },
        {
          title: 'Kind clicks',
          titleHi: 'दयालु क्लिक',
          content:
            'Online words can hurt. Do not send mean messages or share embarrassing photos of others. If you see cyberbullying, do not join in — support the person and tell a trusted adult or teacher.',
          contentHi:
            'ऑनलाइन शब्द चोट पहुँचा सकते हैं। दूसरों को बुरा संदेश न भेजें। साइबरबुलिंग दिखे तो शामिल न हों — मदद करें और वयस्क को बताएँ।',
        },
      ],
    },
    {
      title: 'Protection from Harm',
      titleHi: 'नुकसान से सुरक्षा',
      description: 'Recognize unsafe situations and get help early.',
      descriptionHi: 'असुरक्षित स्थितियाँ पहचानें और जल्दी मदद लें।',
      category: 'Protection',
      ageGroup: '10-14',
      difficulty: 'Beginner',
      sequenceNumber: 4,
      lessons: [
        {
          title: 'Safe and unsafe touch',
          titleHi: 'सुरक्षित और असुरक्षित स्पर्श',
          content:
            'Your body belongs to you. Safe touches are caring and welcome (like a high-five). Unsafe or secret touches that make you uncomfortable should be stopped — say NO, get away if you can, and tell a trusted adult. It is never your fault.',
          contentHi:
            'आपका शरीर आपका है। असुरक्षित या गुप्त स्पर्श जो असहज करें — ना कहें, दूर हों, और किसी भरोसेमंद वयस्क को बताएँ। यह कभी आपकी गलती नहीं है।',
        },
      ],
    },
    {
      title: 'Whom Can I Ask for Help?',
      titleHi: 'मैं किससे मदद माँगूँ?',
      description: 'Build your help circle: trusted adults and helplines.',
      descriptionHi: 'अपना मदद चक्र बनाएँ: भरोसेमंद वयस्क और हेल्पलाइन।',
      category: 'Support',
      ageGroup: '10-14',
      difficulty: 'Beginner',
      sequenceNumber: 5,
      lessons: [
        {
          title: 'My trusted adults',
          titleHi: 'मेरे भरोसेमंद वयस्क',
          content:
            'Make a list of people you trust: parent/guardian, teacher, school counsellor, relative, or neighbour. In India, Childline 1098 can help children in need. Asking for help is brave — not weak.',
          contentHi:
            'भरोसेमंद लोगों की सूची बनाएँ: अभिभावक, शिक्षक, काउंसलर। भारत में चाइल्डलाइन 1098 बच्चों की मदद कर सकता है। मदद माँगना साहस है।',
        },
      ],
    },
  ];

  const createdModules = [];
  for (const m of modulesData) {
    const mod = await prisma.learningModule.create({
      data: {
        title: m.title,
        description: m.description,
        category: m.category,
        ageGroup: m.ageGroup,
        difficulty: m.difficulty,
        sequenceNumber: m.sequenceNumber,
        estimatedMinutes: 12 + m.lessons.length * 5,
        status: 'PUBLISHED',
        lessons: {
          create: m.lessons.map((l, i) => ({
            title: l.title,
            content: l.content,
            sequenceNumber: i + 1,
          })),
        },
      },
      include: { lessons: true },
    });
    await tr('module', mod.id, 'hi', 'title', m.titleHi);
    await tr('module', mod.id, 'hi', 'description', m.descriptionHi);
    for (let i = 0; i < mod.lessons.length; i++) {
      await tr('lesson', mod.lessons[i].id, 'hi', 'title', m.lessons[i].titleHi);
      await tr('lesson', mod.lessons[i].id, 'hi', 'content', m.lessons[i].contentHi);
    }
    createdModules.push(mod);
  }

  const [basic, education, online, protection, help] = createdModules;

  // --- 10 scenarios ---
  type ChoiceSeed = {
    choiceText: string;
    choiceTextHi: string;
    isCorrect: boolean;
    explanation: string;
    explanationHi: string;
    xpReward: number;
  };

  const scenarioSeeds: {
    moduleId: string;
    title: string;
    titleHi: string;
    description: string;
    descriptionHi: string;
    story: string;
    storyHi: string;
    isDemoPath?: boolean;
    choices: ChoiceSeed[];
  }[] = [
    {
      moduleId: education.id,
      title: 'Riya and School Hours',
      titleHi: 'रिया और स्कूल का समय',
      description: 'Riya is asked to work instead of attending school.',
      descriptionHi: 'रिया से स्कूल छोड़कर काम करने को कहा जाता है।',
      story:
        'Riya loves science class. One morning, an uncle says she should stay home and help in the shop during school hours because "school can wait." Riya feels confused and worried.',
      storyHi:
        'रिया विज्ञान की कक्षा पसंद करती है। एक सुबह चाचा कहते हैं कि स्कूल के समय दुकान में मदद करो, स्कूल बाद में चल जाएगा। रिया चिंतित है।',
      choices: [
        {
          choiceText: 'Quietly skip school and work every day',
          choiceTextHi: 'चुपचाप स्कूल छोड़कर रोज़ काम करना',
          isCorrect: false,
          explanation:
            'Children have a right to education. Skipping school regularly for work is not okay. Riya should talk to a trusted adult.',
          explanationHi: 'बच्चों को शिक्षा का अधिकार है। नियमित रूप से स्कूल छोड़ना ठीक नहीं। रिया को भरोसेमंद वयस्क से बात करनी चाहिए।',
          xpReward: 5,
        },
        {
          choiceText: 'Tell a trusted adult (parent/teacher) that she wants to keep going to school',
          choiceTextHi: 'भरोसेमंद वयस्क को बताना कि वह स्कूल जाना चाहती है',
          isCorrect: true,
          explanation:
            'Great choice! Education is a right for children in India. Asking a trusted adult for help is a brave and smart step.',
          explanationHi: 'शानदार! शिक्षा बच्चों का अधिकार है। भरोसेमंद वयस्क से मदद माँगना साहसी कदम है।',
          xpReward: 20,
        },
        {
          choiceText: 'Argue angrily and run away from home',
          choiceTextHi: 'गुस्से में झगड़ा करके घर छोड़ देना',
          isCorrect: false,
          explanation:
            'Feeling upset is understandable, but running away can be unsafe. Safer: speak to a teacher, relative, or call Childline 1098 with help from an adult.',
          explanationHi: 'गुस्सा समझ में आता है, पर घर छोड़ना असुरक्षित हो सकता है। शिक्षक या चाइल्डलाइन 1098 बेहतर हैं।',
          xpReward: 5,
        },
      ],
    },
    {
      moduleId: online.id,
      title: 'The Friendly Stranger Online',
      titleHi: 'ऑनलाइन मिलने वाला अजनबी',
      description: 'Someone new asks for personal details in a game chat.',
      descriptionHi: 'कोई नया व्यक्ति गेम चैट में निजी जानकारी माँगता है।',
      isDemoPath: true,
      story:
        'Kabir is playing an online game. A new player named "SuperFriend99" says: "You\'re cool! Tell me your school name and send a photo so we can be real friends." Kabir has never met this person offline.',
      storyHi:
        'कबीर ऑनलाइन गेम खेल रहा है। एक नया खिलाड़ी कहता है: "तुम अच्छे हो! अपना स्कूल बताओ और फ़ोटो भेजो।" कबीर ने इस व्यक्ति को कभी नहीं देखा।',
      choices: [
        {
          choiceText: 'Share school name and a selfie to be polite',
          choiceTextHi: 'शिष्टाचार के लिए स्कूल और सेल्फी भेज देना',
          isCorrect: false,
          explanation:
            'Politeness does not require sharing private info. Online strangers should not get your school, address, or photos.',
          explanationHi: 'शिष्टाचार के लिए निजी जानकारी देने की ज़रूरत नहीं। अजनबियों को स्कूल/फ़ोटो न दें।',
          xpReward: 5,
        },
        {
          choiceText: 'Refuse, block/report if needed, and tell a trusted adult',
          choiceTextHi: 'मना करना, ज़रूरत हो तो ब्लॉक/रिपोर्ट, और वयस्क को बताना',
          isCorrect: true,
          explanation:
            'Excellent! Keeping personal information private and telling a trusted adult are key online safety skills.',
          explanationHi: 'बहुत अच्छा! निजी जानकारी सुरक्षित रखना और वयस्क को बताना सही सुरक्षा कौशल है।',
          xpReward: 20,
        },
        {
          choiceText: 'Give a fake address but keep chatting privately',
          choiceTextHi: 'झूठा पता देकर निजी चैट जारी रखना',
          isCorrect: false,
          explanation:
            'Even with fake details, private chats with strangers can become unsafe. Better to stop and tell an adult.',
          explanationHi: 'झूठी जानकारी के बावजूद अजनबी से निजी चैट असुरक्षित हो सकती है।',
          xpReward: 5,
        },
      ],
    },
    {
      moduleId: online.id,
      title: 'Password Pressure',
      titleHi: 'पासवर्ड का दबाव',
      description: 'A classmate asks for your account password.',
      descriptionHi: 'एक सहपाठी पासवर्ड माँगता है।',
      story:
        'Meera\'s classmate wants to "borrow" her learning-app password to check scores. They promise to give it back and not tell anyone.',
      storyHi: 'मीरा की सहपाठी उसका ऐप पासवर्ड "उधार" माँगती है और वादा करती है कि किसी को नहीं बताएगी।',
      choices: [
        {
          choiceText: 'Share the password just this once',
          choiceTextHi: 'सिर्फ़ एक बार पासवर्ड बता देना',
          isCorrect: false,
          explanation: 'Passwords are private keys to your account. Sharing them can lead to misuse.',
          explanationHi: 'पासवर्ड निजी होते हैं। बाँटने से दुरुपयोग हो सकता है।',
          xpReward: 5,
        },
        {
          choiceText: 'Say no politely and suggest they ask the teacher for help',
          choiceTextHi: 'विनम्रता से ना कहना और शिक्षक से मदद का सुझाव देना',
          isCorrect: true,
          explanation: 'Perfect. Never share passwords — even with friends.',
          explanationHi: 'बिल्कुल सही। दोस्तों के साथ भी पासवर्ड साझा न करें।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: online.id,
      title: 'Mean Comments in the Group',
      titleHi: 'ग्रुप में अपमानजनक टिप्पणियाँ',
      description: 'Someone is being teased in a class chat.',
      descriptionHi: 'क्लास चैट में किसी का मज़ाक उड़ाया जा रहा है।',
      story:
        'In a class WhatsApp group, a few students post laughing stickers under a classmate\'s photo and call them names. Others stay silent.',
      storyHi: 'क्लास व्हाट्सऐप ग्रुप में कुछ छात्र एक सहपाठी की फ़ोटो पर अपमानजनक टिप्पणी कर रहे हैं।',
      choices: [
        {
          choiceText: 'Join the jokes so you are not left out',
          choiceTextHi: 'मज़ाक में शामिल होना ताकि अकेला न लगो',
          isCorrect: false,
          explanation: 'Joining cyberbullying hurts others and is not okay.',
          explanationHi: 'साइबरबुलिंग में शामिल होना गलत है।',
          xpReward: 5,
        },
        {
          choiceText: 'Support the classmate and tell a teacher/trusted adult',
          choiceTextHi: 'सहपाठी का साथ देना और शिक्षक को बताना',
          isCorrect: true,
          explanation: 'Kindness + reporting to a trusted adult helps stop bullying.',
          explanationHi: 'दया और वयस्क को बताना बुलिंग रोकने में मदद करता है।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: basic.id,
      title: 'Speaking Up in Class',
      titleHi: 'कक्षा में बोलना',
      description: 'You have an idea but feel shy.',
      descriptionHi: 'आपके पास विचार है पर संकोच हो रहा है।',
      story:
        'During a rights discussion, Anu has a good question but worries others will laugh.',
      storyHi: 'अधिकारों की चर्चा में अनु के पास अच्छा सवाल है, पर वह हँसी से डरती है।',
      choices: [
        {
          choiceText: 'Stay silent forever and never ask',
          choiceTextHi: 'हमेशा चुप रहना',
          isCorrect: false,
          explanation: 'Your voice matters. You can ask the teacher privately if speaking up feels hard.',
          explanationHi: 'आपकी आवाज़ मायने रखती है। निजी तौर पर शिक्षक से भी पूछ सकते हैं।',
          xpReward: 5,
        },
        {
          choiceText: 'Ask the teacher — in class or privately',
          choiceTextHi: 'शिक्षक से पूछना — कक्षा में या निजी तौर पर',
          isCorrect: true,
          explanation: 'Wonderful! Asking questions helps you learn. Teachers are there to help.',
          explanationHi: 'शानदार! सवाल पूछना सीखने में मदद करता है।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: protection.id,
      title: 'A Secret That Feels Wrong',
      titleHi: 'एक राज़ जो गलत लगे',
      description: 'Someone asks you to keep an uncomfortable secret.',
      descriptionHi: 'कोई असहज राज़ रखने को कहता है।',
      story:
        'An older person tells Zoya that a touch or message must stay "our secret" and that she will get in trouble if she tells anyone.',
      storyHi:
        'कोई बड़ा व्यक्ति ज़ोया से कहता है कि यह "हमारा राज़" रहे और बताने पर उसे सज़ा मिलेगी।',
      choices: [
        {
          choiceText: 'Keep the secret because you were told to',
          choiceTextHi: 'राज़ रखना क्योंकि ऐसा कहा गया',
          isCorrect: false,
          explanation:
            'Secrets that make you scared or uncomfortable should not be kept. Safe adults never ask children to hide unsafe things.',
          explanationHi: 'डराने वाले राज़ नहीं रखने चाहिए। सुरक्षित वयस्क ऐसे राज़ नहीं छुपाते।',
          xpReward: 5,
        },
        {
          choiceText: 'Tell a trusted adult — even if someone said not to',
          choiceTextHi: 'भरोसेमंद वयस्क को बताना — भले मना किया हो',
          isCorrect: true,
          explanation:
            'Yes. You have the right to be safe. Telling a trusted adult is the right step. It is not your fault.',
          explanationHi: 'हाँ। सुरक्षा आपका अधिकार है। भरोसेमंद वयस्क को बताना सही है।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: help.id,
      title: 'Finding My Help Circle',
      titleHi: 'मेरा मदद चक्र',
      description: 'Who can you talk to when worried?',
      descriptionHi: 'चिंता होने पर किससे बात करें?',
      story:
        'Sam feels worried after seeing something unfair at school but is not sure who to tell.',
      storyHi: 'सैम स्कूल में कुछ अन्याय देखकर चिंतित है, पर किसे बताए पता नहीं।',
      choices: [
        {
          choiceText: 'Keep it bottled up and hope it goes away',
          choiceTextHi: 'मन में रखना और इंतज़ार करना',
          isCorrect: false,
          explanation: 'Worries can grow when kept inside. Trusted adults can help.',
          explanationHi: 'चिंताएँ अंदर रखने से बढ़ सकती हैं।',
          xpReward: 5,
        },
        {
          choiceText: 'Talk to a parent, teacher, counsellor — or Childline 1098',
          choiceTextHi: 'अभिभावक, शिक्षक, काउंसलर या चाइल्डलाइन 1098 से बात करना',
          isCorrect: true,
          explanation: 'Great! Building a help circle keeps you safer.',
          explanationHi: 'बहुत अच्छा! मदद चक्र आपको सुरक्षित रखता है।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: education.id,
      title: 'Unequal Treatment',
      titleHi: 'असमान व्यवहार',
      description: 'A child is told they "don\'t need school".',
      descriptionHi: 'एक बच्चे से कहा जाता है कि उसे स्कूल की ज़रूरत नहीं।',
      story:
        'A neighbour says girls in the family "don\'t need much schooling." Priya wants to become a doctor.',
      storyHi: 'पड़ोसी कहते हैं लड़कियों को ज़्यादा पढ़ाई की ज़रूरत नहीं। प्रिया डॉक्टर बनना चाहती है।',
      choices: [
        {
          choiceText: 'Believe that education is only for some children',
          choiceTextHi: 'मान लेना कि शिक्षा कुछ बच्चों के लिए ही है',
          isCorrect: false,
          explanation: 'Education is a right for every child — girls and boys.',
          explanationHi: 'शिक्षा हर बच्चे का अधिकार है।',
          xpReward: 5,
        },
        {
          choiceText: 'Talk to a trusted adult about her dream to keep learning',
          choiceTextHi: 'सीखते रहने के सपने के बारे में वयस्क से बात करना',
          isCorrect: true,
          explanation: 'Yes! Every child deserves education and encouragement.',
          explanationHi: 'हाँ! हर बच्चे को शिक्षा और प्रोत्साहन चाहिए।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: basic.id,
      title: 'Fair Play at Recess',
      titleHi: 'अवकाश में निष्पक्ष खेल',
      description: 'Someone is left out of the game every day.',
      descriptionHi: 'किसी को रोज़ खेल से बाहर रखा जाता है।',
      story:
        'At recess, the same child is never allowed to join football "because they are not good enough."',
      storyHi: 'अवकाश में एक बच्चे को रोज़ फ़ुटबॉल में नहीं लिया जाता।',
      choices: [
        {
          choiceText: 'Ignore it — it\'s just a game',
          choiceTextHi: 'नज़रअंदाज़ करना — यह तो सिर्फ़ खेल है',
          isCorrect: false,
          explanation: 'Being excluded repeatedly can hurt. Kind inclusion matters.',
          explanationHi: 'बार-बार बाहर रखना चोट पहुँचाता है।',
          xpReward: 5,
        },
        {
          choiceText: 'Invite them to play and tell a teacher if exclusion continues',
          choiceTextHi: 'खेलने के लिए बुलाना और ज़रूरत हो तो शिक्षक को बताना',
          isCorrect: true,
          explanation: 'Kindness and fairness help everyone enjoy school.',
          explanationHi: 'दया और निष्पक्षता सबको अच्छा महसूस कराती है।',
          xpReward: 20,
        },
      ],
    },
    {
      moduleId: online.id,
      title: 'Too-Good-To-Be-True Prize',
      titleHi: 'बहुत आसान इनाम',
      description: 'A pop-up promises free gifts for personal data.',
      descriptionHi: 'पॉप-अप व्यक्तिगत जानकारी के बदले मुफ़्त उपहार का वादा करता है।',
      story:
        'While browsing, Arjun sees a bright pop-up: "YOU WON A FREE PHONE! Enter your full address and OTP to claim."',
      storyHi: 'अर्जुन को पॉप-अप दिखता है: "आपने फ़ोन जीता! पता और OTP डालें।"',
      choices: [
        {
          choiceText: 'Enter address and OTP quickly before the offer ends',
          choiceTextHi: 'जल्दी पता और OTP डाल देना',
          isCorrect: false,
          explanation: 'Scam alert! Never share OTP or address for surprise online prizes.',
          explanationHi: 'धोखा हो सकता है! OTP और पता न दें।',
          xpReward: 5,
        },
        {
          choiceText: 'Close the pop-up and tell a trusted adult',
          choiceTextHi: 'पॉप-अप बंद करें और वयस्क को बताएँ',
          isCorrect: true,
          explanation: 'Smart! Surprise prize pages often try to trick people.',
          explanationHi: 'समझदारी भरा कदम!',
          xpReward: 20,
        },
      ],
    },
  ];

  for (const s of scenarioSeeds) {
    const scenario = await prisma.scenario.create({
      data: {
        moduleId: s.moduleId,
        title: s.title,
        description: s.description,
        story: s.story,
        ageGroup: '10-14',
        difficulty: 'Beginner',
        isDemoPath: s.isDemoPath ?? false,
        choices: {
          create: s.choices.map((c) => ({
            choiceText: c.choiceText,
            isCorrect: c.isCorrect,
            explanation: c.explanation,
            xpReward: c.xpReward,
          })),
        },
      },
      include: { choices: true },
    });
    await tr('scenario', scenario.id, 'hi', 'title', s.titleHi);
    await tr('scenario', scenario.id, 'hi', 'description', s.descriptionHi);
    await tr('scenario', scenario.id, 'hi', 'story', s.storyHi);
    for (let i = 0; i < scenario.choices.length; i++) {
      await tr('scenario_choice', scenario.choices[i].id, 'hi', 'choiceText', s.choices[i].choiceTextHi);
      await tr('scenario_choice', scenario.choices[i].id, 'hi', 'explanation', s.choices[i].explanationHi);
    }
  }

  // Quizzes for each module
  async function createQuiz(
    moduleId: string,
    title: string,
    questions: { q: string; answers: { text: string; correct: boolean; explanation?: string }[] }[]
  ) {
    return prisma.quiz.create({
      data: {
        moduleId,
        title,
        passingScore: 70,
        questions: {
          create: questions.map((item, idx) => ({
            question: item.q,
            questionType: 'MCQ',
            difficulty: 'Beginner',
            sequenceNumber: idx + 1,
            answers: {
              create: item.answers.map((a) => ({
                answerText: a.text,
                isCorrect: a.correct,
                explanation: a.explanation,
              })),
            },
          })),
        },
      },
    });
  }

  await createQuiz(basic.id, 'Basic Rights Check', [
    {
      q: 'What is a right?',
      answers: [
        { text: 'A reward only for top students', correct: false },
        { text: 'Something every child should have to grow safely', correct: true, explanation: 'Rights belong to every child.' },
        { text: 'A video game level', correct: false },
      ],
    },
    {
      q: 'If something feels unfair or unsafe, a good first step is to…',
      answers: [
        { text: 'Keep it secret forever', correct: false },
        { text: 'Tell a trusted adult', correct: true, explanation: 'Trusted adults can help.' },
        { text: 'Post personal details online', correct: false },
      ],
    },
  ]);

  await createQuiz(education.id, 'Education Rights Quiz', [
    {
      q: 'In India, children 6–14 generally have a right to…',
      answers: [
        { text: 'Free and compulsory education', correct: true, explanation: 'Education is a protected right.' },
        { text: 'Skip school whenever they want for paid work', correct: false },
        { text: 'Only study if they win prizes', correct: false },
      ],
    },
    {
      q: 'Riya is asked to work during school hours. Best action?',
      answers: [
        { text: 'Always quit school immediately', correct: false },
        { text: 'Talk to a trusted adult about continuing school', correct: true },
        { text: 'Hide and never speak to anyone', correct: false },
      ],
    },
  ]);

  await createQuiz(online.id, 'Online Safety Quiz', [
    {
      q: 'An online stranger asks for your school name and photo. You should…',
      answers: [
        { text: 'Share it to be friendly', correct: false },
        { text: 'Refuse, block/report if needed, tell a trusted adult', correct: true, explanation: 'Private info stays private.' },
        { text: 'Share your password too', correct: false },
      ],
    },
    {
      q: 'What should you never share online with strangers?',
      answers: [
        { text: 'Your favourite cartoon', correct: false },
        { text: 'Home address, phone number, passwords, OTP', correct: true },
        { text: 'That you like cricket', correct: false },
      ],
    },
    {
      q: 'If you see cyberbullying in a group chat, a good action is…',
      answers: [
        { text: 'Join the teasing', correct: false },
        { text: 'Support the person and tell a trusted adult/teacher', correct: true },
        { text: 'Share more personal photos of them', correct: false },
      ],
    },
  ]);

  await createQuiz(protection.id, 'Protection Basics Quiz', [
    {
      q: 'If a touch or secret makes you uncomfortable, you should…',
      answers: [
        { text: 'Keep it secret because someone said so', correct: false },
        { text: 'Tell a trusted adult — it is not your fault', correct: true },
        { text: 'Blame yourself', correct: false },
      ],
    },
  ]);

  await createQuiz(help.id, 'Help Circle Quiz', [
    {
      q: 'Which number can help children in need in India?',
      answers: [
        { text: '1098 (Childline)', correct: true, explanation: 'Childline 1098 supports children in need.' },
        { text: '0000', correct: false },
        { text: 'Only ask online strangers', correct: false },
      ],
    },
    {
      q: 'Asking for help is…',
      answers: [
        { text: 'Brave and smart', correct: true },
        { text: 'A sign of weakness', correct: false },
        { text: 'Only for adults', correct: false },
      ],
    },
  ]);

  await prisma.badge.createMany({
    data: [
      {
        name: 'First Step',
        description: 'Complete your first lesson.',
        icon: '🎯',
        requirementType: 'FIRST_LESSON',
        requirementValue: 1,
      },
      {
        name: 'Quick Learner',
        description: 'Score 80%+ in three quizzes.',
        icon: '🧠',
        requirementType: 'QUIZ_STREAK',
        requirementValue: 3,
      },
      {
        name: 'Safety Champion',
        description: 'Complete Online Safety learning.',
        icon: '🛡️',
        requirementType: 'MODULE_CATEGORY',
        requirementValue: 1,
        category: 'Online Safety',
      },
      {
        name: 'Rights Explorer',
        description: 'Complete modules across categories.',
        icon: '🌟',
        requirementType: 'MODULES_COUNT',
        requirementValue: 3,
      },
      {
        name: 'Story Hero',
        description: 'Complete 5 interactive scenarios.',
        icon: '📖',
        requirementType: 'SCENARIOS_COUNT',
        requirementValue: 5,
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on a quiz.',
        icon: '🏆',
        requirementType: 'PERFECT_QUIZ',
        requirementValue: 1,
      },
    ],
  });

  const kb = [
    {
      topic: 'Right to Education',
      keywords: 'education,school,study,rte,learn,शिक्षा,स्कूल',
      simpleExplanation:
        'Every child deserves to learn. In India, children from 6 to 14 years generally have a right to free and compulsory education. If someone tries to stop you from going to school, talk to a trusted adult or teacher.',
      legalReference: 'Right of Children to Free and Compulsory Education Act, 2009 (educational overview)',
      source: 'Educational summary — verify with teachers/official sources',
      language: 'en',
    },
    {
      topic: 'शिक्षा का अधिकार',
      keywords: 'शिक्षा,स्कूल,पढ़ाई,education',
      simpleExplanation:
        'हर बच्चे को सीखने का हक है। भारत में आमतौर पर 6 से 14 वर्ष के बच्चों को मुफ़्त और अनिवार्य शिक्षा का अधिकार है। अगर कोई स्कूल रोकता है, तो भरोसेमंद वयस्क से बात करें।',
      legalReference: 'RTE Act 2009 (शैक्षिक सार)',
      source: 'शैक्षिक सार',
      language: 'hi',
    },
    {
      topic: 'Online Safety',
      keywords: 'online,internet,password,stranger,photo,cyber,chat,otp,ऑनलाइन,पासवर्ड',
      simpleExplanation:
        'Keep personal information private online. Do not share your address, phone number, passwords, or OTP with strangers. If someone makes you uncomfortable, block/report and tell a trusted adult.',
      legalReference: 'Online safety guidance for children (educational)',
      source: 'RightsQuest approved knowledge',
      language: 'en',
    },
    {
      topic: 'Childline Help',
      keywords: 'help,helpline,childline,1098,trusted adult,मदद,हेल्पलाइन',
      simpleExplanation:
        'You can ask parents, teachers, or school counsellors for help. In India, Childline 1098 supports children who need care and protection. Asking for help is brave.',
      legalReference: 'Childline 1098',
      source: 'Childline India',
      language: 'en',
    },
    {
      topic: 'What are children\'s rights?',
      keywords: 'rights,basic rights,what is a right,अधिकार',
      simpleExplanation:
        'Children\'s rights are protections and freedoms that help every child grow with dignity — like education, safety, health, and being treated fairly. Rights are not prizes; they belong to you.',
      legalReference: 'UNCRC principles + Indian child protection framework (educational overview)',
      source: 'RightsQuest approved knowledge',
      language: 'en',
    },
    {
      topic: 'Protection from harm',
      keywords: 'harm,abuse,unsafe,touch,secret,protection,सुरक्षा',
      simpleExplanation:
        'You have the right to be safe. If a touch, message, or secret makes you scared or uncomfortable, tell a trusted adult. It is never your fault. Safe adults do not ask children to hide unsafe secrets.',
      legalReference: 'Child protection principles (educational)',
      source: 'RightsQuest approved knowledge',
      language: 'en',
    },
  ];

  for (const k of kb) {
    await prisma.knowledgeBase.create({
      data: {
        ...k,
        status: 'APPROVED',
        reviewedBy: 'admin@demo.com',
        reviewedAt: new Date(),
        jurisdiction: 'India',
        ageGroup: '10-14',
      },
    });
  }

  await prisma.dailyChallenge.create({
    data: {
      title: "Today's Mission: Spot the safest choice",
      description: 'Play the Online Safety story and choose the safest action when a stranger asks for personal info.',
      moduleId: online.id,
      xpReward: 20,
      isActive: true,
    },
  });

  console.log('Seed complete.');
  console.log('Demo child:', child.email, '/ demo1234');
  console.log('Demo admin: admin@demo.com / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
