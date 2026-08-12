const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'CHILD' | 'ADMIN' | 'CONTENT_REVIEWER';
  preferredLanguage: string;
  ageGroup?: string | null;
  avatar?: string | null;
  xp: number;
  level: number;
  levelName: string;
  currentStreak: number;
};

function getToken() {
  return localStorage.getItem('rq_access');
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach server. Make sure the app is running (npm run dev).');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Request failed');
  }
  return data as T;
}
