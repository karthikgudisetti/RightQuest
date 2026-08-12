import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import { t, type Lang } from '../lib/i18n';

export function OnboardingPage() {
  const { lang, setLang, ageGroup, setAgeGroup, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  async function finish() {
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ preferredLanguage: lang, ageGroup }),
      });
    } catch {
      // continue locally even if patch fails
    }
    completeOnboarding();
    navigate('/');
  }

  return (
    <div className="pattern-dots flex min-h-screen items-center justify-center px-4">
      <div className="panel animate-rise w-full max-w-lg p-8">
        <h1 className="font-display text-3xl font-bold text-teal-900">{t(lang, 'brand')}</h1>
        <p className="mt-2 text-teal-900/70">{t(lang, 'tagline')}</p>

        <div className="mt-8">
          <p className="mb-2 font-bold">{t(lang, 'ageGroup')}</p>
          <div className="flex flex-wrap gap-2">
            {['8-10', '10-13', '13-16'].map((age) => (
              <button
                key={age}
                type="button"
                className={`rounded-xl px-4 py-2 font-bold ${
                  ageGroup === age ? 'bg-teal-700 text-white' : 'bg-white/80 text-teal-900'
                }`}
                onClick={() => setAgeGroup(age)}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 font-bold">{t(lang, 'language')}</p>
          <div className="flex gap-2">
            {(
              [
                ['en', 'English'],
                ['hi', 'हिन्दी'],
              ] as [Lang, string][]
            ).map(([code, label]) => (
              <button
                key={code}
                type="button"
                className={`rounded-xl px-4 py-2 font-bold ${
                  lang === code ? 'bg-orange-500 text-white' : 'bg-white/80 text-teal-900'
                }`}
                onClick={() => setLang(code)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary mt-8 w-full" type="button" onClick={finish}>
          {t(lang, 'next')}
        </button>
      </div>
    </div>
  );
}
