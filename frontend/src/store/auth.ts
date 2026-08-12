import { create } from 'zustand';
import { api, type User } from '../lib/api';
import type { Lang } from '../lib/i18n';

type AuthState = {
  user: User | null;
  ready: boolean;
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
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
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
    const age = data.user.ageGroup || get().ageGroup || '10-13';
    localStorage.setItem('rq_age', age);

    // Demo child: pick age UI each login
    if (data.user.role === 'CHILD' && email.endsWith('@demo.com')) {
      localStorage.removeItem('rq_onboarded');
      set({ user: data.user, lang, ageGroup: age, onboardingDone: false, ready: true });
      return;
    }
    if (email.endsWith('@demo.com')) {
      localStorage.setItem('rq_onboarded', '1');
      set({ user: data.user, lang, ageGroup: age, onboardingDone: true, ready: true });
      return;
    }
    const onboarded = localStorage.getItem('rq_onboarded') === '1';
    set({
      user: data.user,
      lang,
      ageGroup: age,
      onboardingDone: onboarded || data.user.role !== 'CHILD',
      ready: true,
    });
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
    localStorage.removeItem('rq_onboarded');
    set({ user: data.user, onboardingDone: false, ready: true });
  },
  logout: () => {
    localStorage.removeItem('rq_access');
    localStorage.removeItem('rq_refresh');
    set({ user: null, ready: true });
  },
  refreshMe: async () => {
    const data = await api<{ user: User }>('/users/me');
    if (data.user.ageGroup) {
      localStorage.setItem('rq_age', data.user.ageGroup);
      set({ user: data.user, ageGroup: data.user.ageGroup });
      return;
    }
    set({ user: data.user });
  },
  hydrate: async () => {
    const token = localStorage.getItem('rq_access');
    if (!token) {
      set({ ready: true });
      return;
    }
    try {
      await get().refreshMe();
      set({ ready: true });
    } catch {
      localStorage.removeItem('rq_access');
      localStorage.removeItem('rq_refresh');
      set({ user: null, ready: true });
    }
  },
}));
