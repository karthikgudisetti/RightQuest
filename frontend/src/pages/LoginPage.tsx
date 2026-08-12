import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

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
      const role = useAuth.getState().user?.role;
      navigate(role === 'ADMIN' || role === 'CONTENT_REVIEWER' ? '/admin' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pattern-dots flex min-h-screen items-center justify-center px-4">
      <div className="panel animate-rise w-full max-w-md p-8">
        <p className="font-display text-3xl font-bold text-teal-900">{t(lang, 'brand')}</p>
        <p className="mt-2 text-teal-900/70">{t(lang, 'tagline')}</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">{t(lang, 'email')}</span>
            <input
              className="w-full rounded-xl border border-teal-900/15 bg-white px-4 py-3 outline-none ring-teal-600 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">{t(lang, 'password')}</span>
            <input
              className="w-full rounded-xl border border-teal-900/15 bg-white px-4 py-3 outline-none ring-teal-600 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {error && <p className="text-sm font-semibold text-coral-600 text-orange-700">{error}</p>}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? '...' : t(lang, 'login')}
          </button>
        </form>
        <p className="mt-4 text-sm text-teal-900/70">
          Demo: child@demo.com / demo1234 · admin@demo.com / demo1234
        </p>
        <Link className="mt-3 inline-block font-bold text-teal-700" to="/register">
          {t(lang, 'register')}
        </Link>
      </div>
    </div>
  );
}
