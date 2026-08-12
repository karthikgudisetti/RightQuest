import { useEffect, useState } from 'react';

export function XpBurst({
  xp,
  label,
  show,
  onDone,
}: {
  xp?: number;
  label?: string;
  show: boolean;
  onDone?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1500);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-burst-pop rounded-2xl border border-[#d7e8e3] bg-white px-8 py-6 text-center shadow-2xl">
        <div className="text-3xl">⭐</div>
        {typeof xp === 'number' && (
          <p className="mt-2 font-display text-3xl font-bold text-[#12352f]">+{xp} XP</p>
        )}
        {label && <p className="mt-1 text-sm font-bold text-[#0d6b63]">{label}</p>}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute animate-confetti text-lg"
            style={{
              left: `${10 + ((i * 37) % 80)}%`,
              top: `${12 + ((i * 19) % 65)}%`,
              animationDelay: `${i * 40}ms`,
            }}
          >
            {['✨', '🌟', '🧡', '💚'][i % 4]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Mascot({
  mood = 'happy',
  className = '',
}: {
  mood?: 'happy' | 'think' | 'cheer';
  className?: string;
}) {
  const face = mood === 'cheer' ? '🦊' : mood === 'think' ? '🤔' : '🦊';
  return (
    <div
      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7e8e3] bg-white text-3xl shadow-sm animate-float ${className}`}
    >
      {face}
    </div>
  );
}

export function ProgressRing({ value, size = 72 }: { value: number; size?: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className="animate-pop">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e8f6f2" strokeWidth="8" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#0d6b63"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        className="transition-all duration-700"
      />
      <text
        x="36"
        y="41"
        textAnchor="middle"
        fill="#12352f"
        style={{ fontSize: '12px', fontWeight: 800 }}
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}
