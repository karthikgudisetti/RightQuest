import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { ageGuide } from '../lib/ageGuide';
import { CHAR_ART } from '../lib/characters';
import { XpBurst } from '../components/GameEffects';
import { speak } from '../lib/voice';
import {
  VIDEO_LESSONS,
  embedUrl,
  loadWatched,
  saveWatched,
  videoCategory,
  videoSummary,
  videoTakeaway,
  videoTitle,
  videoYoutubeId,
  type VideoLesson,
} from '../lib/videoLessons';
import type { Lang } from '../lib/i18n';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function VideosPage() {
  const { lang, ageGroup } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [watched, setWatched] = useState<string[]>(() => loadWatched());
  const [activeId, setActiveId] = useState(VIDEO_LESSONS[0]?.id);
  const [burst, setBurst] = useState({ show: false, xp: 0, label: '' });

  const active = useMemo(
    () => VIDEO_LESSONS.find((v) => v.id === activeId) || VIDEO_LESSONS[0],
    [activeId]
  );

  function markWatched(v: VideoLesson) {
    if (watched.includes(v.id)) return;
    const next = [...watched, v.id];
    setWatched(next);
    saveWatched(next);
    const msg = videoTakeaway(v, lang);
    setBurst({ show: true, xp: 15, label: msg });
    speak(msg, lang);
  }

  if (!active) return null;

  const yt = videoYoutubeId(active, lang);
  const doneCount = watched.filter((id) => VIDEO_LESSONS.some((v) => v.id === id)).length;

  return (
    <div className="animate-rise space-y-6">
      <XpBurst
        show={burst.show}
        xp={burst.xp}
        label={burst.label}
        onDone={() => setBurst((b) => ({ ...b, show: false }))}
      />

      <section className="realm-hero compact px-6 py-9 md:px-10">
        <div className="india-ribbon mb-3">
          <span className="saffron" />
          <span className="white" />
          <span className="green" />
          RightsQuest India
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <img
            src={CHAR_ART.fox}
            alt="Quest Fox"
            className="h-20 w-20 rounded-2xl object-cover char-frame animate-float"
          />
          <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/80">
                {L(lang, 'Video Learning', 'वीडियो लर्निंग', 'వీడియో లెర్నింగ్')}
              </p>
            <h1 className={`mt-2 font-display font-bold text-white ${guide.titleScale}`}>
              {L(lang, 'Watch & learn', 'देखो और सीखो', 'చూసి నేర్చుకోండి')}
            </h1>
            <p className={`mt-2 max-w-xl font-semibold text-white/90 ${guide.textScale}`}>
              {L(
                lang,
                'Short films on rights, online safety, and asking for help.',
                'अधिकार, ऑनलाइन सुरक्षा और मदद माँगने पर छोटी फिल्में।',
                'హక్కులు, ఆన్‌లైన్ భద్రత, సహాయం అడగడం — చిన్న చిత్రాలు.'
              )}
            </p>
            <p className="mt-3 text-sm font-bold text-white/85">
              {doneCount}/{VIDEO_LESSONS.length} {L(lang, 'watched', 'देखीं', 'చూశారు')}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="game-board !p-0 overflow-hidden">
          <div className="video-stage">
            <iframe
              key={yt}
              title={videoTitle(active, lang)}
              src={embedUrl(yt)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#0d6b63]">
              {videoCategory(active, lang)} · {active.minutes} min · {active.ages}
            </p>
            <h2 className="font-display text-2xl font-bold text-[#0f2a26]">{videoTitle(active, lang)}</h2>
            <p className="text-sm font-semibold text-[#3d5c56]">{videoSummary(active, lang)}</p>
            <div className="message-glow !mt-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#b45309]">
                {L(lang, 'Key message', 'मुख्य संदेश', 'ముఖ్య సందేశం')}
              </p>
              <p className="mt-1 font-extrabold text-[#0c2e2a]">{videoTakeaway(active, lang)}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                className="btn-primary"
                onClick={() => markWatched(active)}
                disabled={watched.includes(active.id)}
              >
                {watched.includes(active.id)
                  ? L(lang, '✓ Learned', '✓ सीखा', '✓ నేర్చుకున్నారు')
                  : L(lang, 'I learned this (+15 XP)', 'मैंने सीखा (+15 XP)', 'నేర్చుకున్నాను (+15 XP)')}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => speak(videoTakeaway(active, lang), lang)}
              >
                🔊 {L(lang, 'Hear message', 'संदेश सुनें', 'సందేశం వినండి')}
              </button>
              <Link className="btn-secondary" to="/learn">
                {L(lang, 'Open lessons', 'पाठ खोलो', 'పాఠాలు తెరవండి')}
              </Link>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <h3 className="section-title text-lg">
            {L(lang, 'Pick a video', 'वीडियो चुनो', 'వీడియో ఎంచుకోండి')}
          </h3>
          {VIDEO_LESSONS.map((v, i) => {
            const selected = v.id === active.id;
            const done = watched.includes(v.id);
            return (
              <button
                key={v.id}
                type="button"
                className={`video-card text-left ${selected ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => setActiveId(v.id)}
              >
                <span className="video-card-n">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-[#0d6b63]">
                    {videoCategory(v, lang)} · {v.minutes} min
                    {done ? ` · ✓` : ''}
                  </span>
                  <span className="mt-0.5 block font-display text-base font-bold text-[#0f2a26]">
                    {videoTitle(v, lang)}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-[#3d5c56] line-clamp-2">
                    {videoSummary(v, lang)}
                  </span>
                </span>
              </button>
            );
          })}
          <p className="pt-2 text-center text-sm font-bold text-[#3d5c56]">
            {L(
              lang,
              'Need help? Tell a trusted adult or call Childline 1098.',
              'मदद चाहिए? भरोसेमंद वयस्क को बताओ या 1098 कॉल करो।',
              'సహాయం కావాలా? నమ్మకమైన పెద్దవారికి చెప్పండి లేదా 1098కి కాల్ చేయండి.'
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}
