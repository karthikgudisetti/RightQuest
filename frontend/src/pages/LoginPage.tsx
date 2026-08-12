import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';
import { CHAR_ART } from '../lib/characters';

export function LoginPage() {
  const { login, lang } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('child@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      const { user, onboardingDone } = useAuth.getState();
      if (user?.role === 'ADMIN' || user?.role === 'CONTENT_REVIEWER') {
        navigate('/admin');
      } else if (!onboardingDone && user?.role === 'CHILD') {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#d5e5e0] bg-white shadow-2xl md:grid-cols-2">
        <div className="relative hidden min-h-[420px] bg-gradient-to-br from-[#0c1f1c] via-[#0a4f49] to-[#0d6b63] p-8 text-white md:block">
          <div className="india-ribbon mb-6">
            <span className="saffron" />
            <span className="white" />
            <span className="green" />
            For every child in India
          </div>
          <img
            src={CHAR_ART.fox}
            alt="Quest Fox"
            className="mb-5 h-28 w-28 rounded-2xl object-cover char-frame animate-float"
          />
          <h1 className="font-display text-4xl font-bold">{t(lang, 'brand')}</h1>
          <p className="mt-4 max-w-sm text-lg font-semibold text-teal-50/95">
            National child-rights literacy · Games · Videos · Stories · Lessons
          </p>
          <ul className="mt-8 space-y-2 text-sm font-semibold text-teal-50/90">
            <li>One clear experience for ages 8–16</li>
            <li>EN · हिन्दी · తెలుగు</li>
            <li>Childline 1098 awareness</li>
          </ul>
        </div>
        <div className="p-8 md:p-10">
          <p className="eyebrow">Welcome</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#0f2a26]">{t(lang, 'login')}</p>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-[#0f2a26]">{t(lang, 'email')}</span>
              <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-[#0f2a26]">{t(lang, 'password')}</span>
              <input className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            {error && <p className="text-sm font-semibold text-[#c2410c]">{error}</p>}
            <button className="btn-primary w-full" disabled={loading} type="submit">
              {loading ? '...' : t(lang, 'login')}
            </button>
          </form>
          <p className="mt-4 text-sm muted">Demo: child@demo.com / demo1234</p>
          <Link className="mt-3 inline-block font-bold text-[#0d6b63]" to="/register">
            {t(lang, 'register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
