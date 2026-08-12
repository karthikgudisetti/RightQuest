import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { t } from '../lib/i18n';

export function AdminDashboard() {
  const { lang } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalLearners: 0,
    modulesCompleted: 0,
    averageQuizScore: 0,
    scenarioCompletions: 0,
    badgesEarned: 0,
  });

  useEffect(() => {
    api<typeof analytics>('/admin/analytics').then(setAnalytics);
  }, []);

  const cards = [
    ['Learners', analytics.totalLearners],
    ['Modules completed', analytics.modulesCompleted],
    ['Avg quiz score', `${analytics.averageQuizScore}%`],
    ['Scenarios played', analytics.scenarioCompletions],
    ['Badges earned', analytics.badgesEarned],
  ];

  return (
    <div className="animate-rise space-y-6">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'admin')} Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label as string} className="panel p-5">
            <p className="text-sm font-bold text-teal-700">{label}</p>
            <p className="mt-2 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="btn-primary" to="/admin/modules">
          {t(lang, 'modules')}
        </Link>
        <Link className="btn-secondary" to="/admin/knowledge">
          {t(lang, 'knowledge')}
        </Link>
      </div>
    </div>
  );
}

type Module = {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
};

export function AdminModulesPage() {
  const { lang } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [editing, setEditing] = useState<Module | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const d = await api<{ modules: Module[] }>('/admin/modules');
    setModules(d.modules);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await api(`/admin/modules/${editing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: editing.title,
        description: editing.description,
        status: editing.status,
      }),
    });
    setMessage('Module updated — child app will show the new title after refresh.');
    setEditing(null);
    await load();
  }

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'modules')} CMS</h1>
      {message && <p className="mt-3 font-bold text-orange-600">{message}</p>}
      <div className="mt-6 space-y-3">
        {modules.map((m) => (
          <div key={m.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-extrabold">{m.title}</p>
              <p className="text-sm text-teal-900/70">
                {m.category} · {m.status}
              </p>
            </div>
            <button className="btn-secondary !py-2" type="button" onClick={() => setEditing(m)}>
              Edit
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <form className="panel mt-6 space-y-3 p-5" onSubmit={save}>
          <h2 className="font-display text-xl font-bold">Edit module</h2>
          <input
            className="w-full rounded-xl border border-teal-900/15 px-4 py-3"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
          <textarea
            className="w-full rounded-xl border border-teal-900/15 px-4 py-3"
            rows={4}
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
          <select
            className="w-full rounded-xl border border-teal-900/15 px-4 py-3"
            value={editing.status}
            onChange={(e) => setEditing({ ...editing, status: e.target.value })}
          >
            {['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">
              {t(lang, 'save')}
            </button>
            <button className="btn-secondary" type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

type KB = {
  id: string;
  topic: string;
  keywords: string;
  simpleExplanation: string;
  language: string;
  status: string;
};

export function AdminKnowledgePage() {
  const { lang } = useAuth();
  const [entries, setEntries] = useState<KB[]>([]);
  const [form, setForm] = useState({
    topic: '',
    keywords: '',
    simpleExplanation: '',
    language: 'en',
  });

  async function load() {
    const d = await api<{ entries: KB[] }>('/admin/knowledge');
    setEntries(d.entries);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    await api('/admin/knowledge', { method: 'POST', body: JSON.stringify(form) });
    setForm({ topic: '', keywords: '', simpleExplanation: '', language: 'en' });
    await load();
  }

  return (
    <div className="animate-rise space-y-6">
      <h1 className="font-display text-3xl font-bold">{t(lang, 'knowledge')}</h1>
      <form className="panel space-y-3 p-5" onSubmit={create}>
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          required
        />
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Keywords (comma separated)"
          value={form.keywords}
          onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          required
        />
        <textarea
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Approved simple explanation"
          rows={4}
          value={form.simpleExplanation}
          onChange={(e) => setForm({ ...form, simpleExplanation: e.target.value })}
          required
        />
        <button className="btn-primary" type="submit">
          Add approved entry
        </button>
      </form>
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="panel p-4">
            <p className="font-extrabold">
              {e.topic} <span className="text-sm font-bold text-teal-700">({e.language})</span>
            </p>
            <p className="mt-1 text-sm text-teal-900/70">{e.simpleExplanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
