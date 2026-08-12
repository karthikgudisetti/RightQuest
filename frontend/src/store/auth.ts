import { create } from 'zustand';
import { api, type User } from '../lib/api';
import type { Lang } from '../lib/i18n';

type AuthState = {
  user: User | null;
  onboardingDone: boolean;
  lang: Lang;
  ageGroup: string;
  setLang: (lang: Lang) => void;
  setAgeGroup: (age: string) => void;
  completeOnboarding: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  hydrate: () => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  onboardingDone: localStorage.getItem('rq_onboarded') === '1',
  lang: (localStorage.getItem('rq_lang') as Lang) || 'en',
  ageGroup: localStorage.getItem('rq_age') || '10-13',
  setLang: (lang) => {
    localStorage.setItem('rq_lang', lang);
    set({ lang });
  },
  setAgeGroup: (ageGroup) => {
    localStorage.setItem('rq_age', ageGroup);
    set({ ageGroup });
  },
  completeOnboarding: () => {
    localStorage.setItem('rq_onboarded', '1');
    set({ onboardingDone: true });
  },
  login: async (email, password) => {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        auth: false,
      }
    );
    localStorage.setItem('rq_access', data.accessToken);
    localStorage.setItem('rq_refresh', data.refreshToken);
    const lang = (data.user.preferredLanguage as Lang) || get().lang;
    localStorage.setItem('rq_lang', lang);
    // Demo accounts skip onboarding friction for judges
    if (email.endsWith('@demo.com')) {
      localStorage.setItem('rq_onboarded', '1');
      set({ user: data.user, lang, onboardingDone: true });
      return;
    }
    set({ user: data.user, lang });
  },
  register: async (name, email, password) => {
    const { lang, ageGroup } = get();
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password, preferredLanguage: lang, ageGroup }),
        auth: false,
      }
    );
    localStorage.setItem('rq_access', data.accessToken);
    localStorage.setItem('rq_refresh', data.refreshToken);
    set({ user: data.user });
  },
  logout: () => {
    localStorage.removeItem('rq_access');
    localStorage.removeItem('rq_refresh');
    set({ user: null });
  },
  refreshMe: async () => {
    const data = await api<{ user: User }>('/users/me');
    set({ user: data.user });
  },
  hydrate: () => {
    const token = localStorage.getItem('rq_access');
    if (!token) return;
    get()
      .refreshMe()
      .catch(() => get().logout());
  },
}));
