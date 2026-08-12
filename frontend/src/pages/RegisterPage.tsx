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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel animate-rise w-full max-w-md p-8">
        <p className="eyebrow">Create profile</p>
        <p className="mt-2 font-display text-3xl font-bold text-[#12352f]">{t(lang, 'register')}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="input-field"
            placeholder={t(lang, 'name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder={t(lang, 'email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder={t(lang, 'password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm font-semibold text-[#b45309]">{error}</p>}
          <button className="btn-primary w-full" type="submit">
            {t(lang, 'next')}
          </button>
        </form>
        <Link className="mt-4 inline-block font-bold text-[#0d6b63]" to="/login">
          {t(lang, 'login')}
        </Link>
      </div>
    </div>
  );
}
