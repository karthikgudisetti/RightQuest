import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

export function RegisterPage() {
  const { register, lang } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <div className="pattern-dots flex min-h-screen items-center justify-center px-4">
      <div className="panel animate-rise w-full max-w-md p-8">
        <p className="font-display text-3xl font-bold text-teal-900">{t(lang, 'register')}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="w-full rounded-xl border border-teal-900/15 bg-white px-4 py-3"
            placeholder={t(lang, 'name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-teal-900/15 bg-white px-4 py-3"
            placeholder={t(lang, 'email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-teal-900/15 bg-white px-4 py-3"
            placeholder={t(lang, 'password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm font-semibold text-orange-700">{error}</p>}
          <button className="btn-primary w-full" type="submit">
            {t(lang, 'next')}
          </button>
        </form>
        <Link className="mt-4 inline-block font-bold text-teal-700" to="/login">
          {t(lang, 'login')}
        </Link>
      </div>
    </div>
  );
}
