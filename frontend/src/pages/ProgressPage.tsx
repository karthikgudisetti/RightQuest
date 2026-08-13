import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import { t, type Lang } from '../lib/i18n';
import { ageGuide } from '../lib/ageGuide';
import { Certificate } from '../components/Certificate';

function L(lang: Lang, en: string, hi: string, te: string) {
  if (lang === 'hi') return hi;
  if (lang === 'te') return te;
  return en;
}

export function ProgressPage() {
  const { user, lang, ageGroup, refreshMe } = useAuth();
  const guide = ageGuide(ageGroup, lang);
  const [stats, setStats] = useState({
    modulesCompleted: 0,
    badges: 0,
    avgQuizScore: 0,
    scenariosCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [progress, setProgress] = useState<
    { id: string; completionPercentage: number; module: { title: string; category: string } }[]
  >([]);
  const [milestones, setMilestones] = useState<{ name: string; reached: boolean }[]>([]);

  useEffect(() => {
    refreshMe();
    api<typeof stats>('/users/me/stats').then(setStats);
    api<{ progress: typeof progress }>('/users/me/progress').then((d) => setProgress(d.progress));
    api<{ milestones: typeof milestones }>('/gamification/leaderboard').then((d) =>
      setMilestones(d.milestones)
    );
  }, [refreshMe]);

  const canCertify = (user?.xp ?? 0) >= 50 || stats.modulesCompleted >= 1;

  return (
    <div className="animate-rise space-y-6">
      <section className="hero-banner px-6 py-7">
        <p className="eyebrow">{L(lang, 'Your Journey', 'आपकी यात्रा', 'మీ ప్రయాణం')}</p>
        <h1 className={`mt-2 font-display font-bold text-[#12352f] ${guide.titleScale}`}>
          {t(lang, 'progress')}
        </h1>
        {(stats.currentStreak > 0 || user?.currentStreak) ? (
          <p className="mt-2 text-sm font-bold text-[#e07a2f]">
            🔥 {stats.currentStreak || user?.currentStreak}{' '}
            {L(lang, 'day learning streak', 'दिन की सीखने की स्ट्रीक', 'రోజుల నేర్చుకునే స్ట్రీక్')}
            {stats.longestStreak > 1 &&
              ` · ${L(lang, 'Best', 'सर्वश्रेष्ठ', 'అత్యుత్తమ')} ${stats.longestStreak}`}
          </p>
        ) : (
          <p className="mt-2 text-sm font-semibold text-[#3d5c56]">
            {L(
              lang,
              'Play a game or complete a lesson today to start your streak!',
              'स्ट्रीक शुरू करने के लिए आज गेम खेलो या पाठ पूरा करो!',
              'స్ట్రీక్ ప్రారంభించడానికి ఈరోజు గేమ్ ఆడండి లేదా పాఠం పూర్తి చేయండి!'
            )}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['XP', user?.xp ?? 0],
          [t(lang, 'level'), `${user?.level} · ${user?.levelName}`],
          [L(lang, 'Modules', 'मॉड्यूल', 'మాడ్యూల్స్'), `${stats.modulesCompleted}`],
          [L(lang, 'Avg Quiz', 'औसत क्विज़', 'సగటు క్విజ్'), `${stats.avgQuizScore}%`],
        ].map(([label, value]) => (
          <div key={label as string} className="panel p-4">
            <p className="text-sm font-bold text-[#0d6b63]">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#12352f]">{value}</p>
          </div>
        ))}
      </div>

      {canCertify && user && (
        <section className="panel p-5">
          <h2 className="font-display text-xl font-bold text-[#12352f]">
            {L(lang, 'Your certificate', 'आपका प्रमाणपत्र', 'మీ ధృవపత్రం')}
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#3d5c56]">
            {L(
              lang,
              'Celebrate your learning! Print and share with family or school.',
              'अपनी सीख का जश्न मनाओ! परिवार या स्कूल के साथ साझा करो।',
              'మీ నేర్చుకోవడాన్ని జరుపుకోండి! కుటుంబం లేదా పాఠశాలతో షేర్ చేయండి.'
            )}
          </p>
          <div className="mt-4">
            <Certificate
              name={user.name}
              level={user.level}
              levelName={user.levelName}
              xp={user.xp}
              badges={stats.badges}
              modulesCompleted={stats.modulesCompleted}
              lang={lang}
            />
          </div>
        </section>
      )}

      <section className="panel p-5">
        <h2 className="font-display text-xl font-bold text-[#12352f]">
          {L(lang, 'My Learning', 'मेरी सीख', 'నా నేర్చుకోవడం')}
        </h2>
        <div className="mt-4 space-y-4">
          {progress.length === 0 && (
            <p className="muted">
              {L(lang, 'Start a module to track progress.', 'प्रगति ट्रैक करने के लिए मॉड्यूल शुरू करो।', 'ప్రగతి ట్రాక్ చేయడానికి మాడ్యూల్ ప్రారంభించండి.')}
            </p>
          )}
          {progress.map((p) => (
            <div key={p.id}>
              <div className="flex justify-between text-sm font-bold text-[#12352f]">
                <span>
                  {p.module.title}{' '}
                  <span className="text-[#0d6b63]">· {p.module.category}</span>
                </span>
                <span>{Math.round(p.completionPercentage)}%</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#e8f6f2]">
                <div
                  className="h-full rounded-full bg-[#0d6b63]"
                  style={{ width: `${p.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <Link className="btn-primary mt-4 inline-flex" to="/learn">
          {L(lang, 'Continue learning', 'सीखना जारी रखो', 'నేర్చుకోవడం కొనసాగించండి')}
        </Link>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-xl font-bold text-[#12352f]">
          {L(lang, 'Personal milestones', 'व्यक्तिगत मील के पत्थर', 'వ్యక్తిగత మైలురాళ్లు')}
        </h2>
        <ul className="mt-3 space-y-2">
          {milestones.map((m) => (
            <li key={m.name} className="font-semibold text-[#12352f]">
              {m.reached ? '✅' : '○'} {m.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
