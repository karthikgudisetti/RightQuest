import { useEffect, useState } from 'react';
import type { Lang } from '../lib/i18n';
import { speak, stopSpeech } from '../lib/voice';
import { CHAR_ART } from '../lib/characters';

const CHARACTERS: Record<
  string,
  { name: string; nameHi: string; nameTe: string; img: string; role: string }
> = {
  asha: {
    name: 'Asha',
    nameHi: 'आशा',
    nameTe: 'ఆశ',
    img: CHAR_ART.asha,
    role: 'Learner',
  },
  kabir: {
    name: 'Kabir',
    nameHi: 'कबीर',
    nameTe: 'కబీర్',
    img: CHAR_ART.kabir,
    role: 'Explorer',
  },
  fox: {
    name: 'Quest Fox',
    nameHi: 'क्वेस्ट फॉक्स',
    nameTe: 'క్వెస్ట్ ఫాక్స్',
    img: CHAR_ART.fox,
    role: 'Guide',
  },
};

export function pickStoryCharacter(title: string) {
  const t = title.toLowerCase();
  if (
    t.includes('riya') ||
    t.includes('meera') ||
    t.includes('priya') ||
    t.includes('anu') ||
    t.includes('zoya') ||
    t.includes('रिया') ||
    t.includes('मीरा')
  ) {
    return 'asha';
  }
  if (t.includes('kabir') || t.includes('arjun') || t.includes('sam') || t.includes('कबीर') || t.includes('अर्जुन')) {
    return 'kabir';
  }
  return Math.random() > 0.5 ? 'asha' : 'kabir';
}

export function StoryTheater({
  title,
  story,
  lang,
  characterKey,
  speakingLabel,
}: {
  title: string;
  story: string;
  lang: Lang;
  characterKey?: string;
  speakingLabel?: string;
}) {
  const key = characterKey || pickStoryCharacter(title);
  const character = CHARACTERS[key] || CHARACTERS.fox;
  const [talking, setTalking] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  function playVoice() {
    setTalking(true);
    const intro =
      lang === 'hi'
        ? `${character.nameHi} की कहानी। `
        : lang === 'te'
          ? `${character.nameTe} కథ. `
          : `Here is ${character.name}'s story. `;
    speak(intro + story, lang, {
      onEnd: () => setTalking(false),
    });
  }

  const displayName = lang === 'hi' ? character.nameHi : lang === 'te' ? character.nameTe : character.name;

  return (
    <div className="theater">
      <div className="theater-stage">
        <div className="theater-sky" />
        <div className="theater-ground" />
        <img
          src={CHAR_ART.fox}
          alt="Quest Fox"
          className={`theater-guide ${talking ? 'is-talking' : ''}`}
        />
        <img
          src={character.img}
          alt={character.name}
          className={`theater-hero ${talking ? 'is-talking' : ''}`}
        />
        <div className="theater-bubble">
          <p className="theater-name">
            {displayName}
            <span> · {character.role}</span>
          </p>
          <p className="theater-lines">{story}</p>
        </div>
      </div>
      <div className="theater-controls">
        <button type="button" className="btn-primary" onClick={playVoice}>
          🔊 {speakingLabel || (lang === 'hi' ? 'आवाज़ चलाएँ' : lang === 'te' ? 'వాయిస్ ప్లే' : 'Play Voice')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            stopSpeech();
            setTalking(false);
          }}
        >
          ⏹ {lang === 'hi' ? 'रोकें' : lang === 'te' ? 'ఆపండి' : 'Stop'}
        </button>
      </div>
      {talking && (
        <p className="mt-2 text-sm font-bold text-[#0d6b63]">
          {lang === 'hi' ? 'किरदार बोल रहा/रही है…' : lang === 'te' ? 'పాత్ర మాట్లాడుతోంది…' : 'Character is speaking…'}
        </p>
      )}
    </div>
  );
}

export function VoiceButton({
  text,
  lang,
  label,
}: {
  text: string;
  lang: Lang;
  label?: string;
}) {
  return (
    <button type="button" className="btn-secondary !px-3 !py-2 text-sm" onClick={() => speak(text, lang)}>
      🔊 {label || (lang === 'hi' ? 'सुनें' : lang === 'te' ? 'వినండి' : 'Listen')}
    </button>
  );
}

export function CharacterBadge({ who = 'fox', lang = 'en' as Lang }: { who?: keyof typeof CHARACTERS; lang?: Lang }) {
  const c = CHARACTERS[who];
  const name = lang === 'hi' ? c.nameHi : lang === 'te' ? c.nameTe : c.name;
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#d7e8e3] bg-white px-2 py-1.5">
      <img src={c.img} alt={c.name} className="h-10 w-10 rounded-xl object-cover char-frame" />
      <span className="text-sm font-bold text-[#12352f]">{name}</span>
    </div>
  );
}
