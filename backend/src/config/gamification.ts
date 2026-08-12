export const XP = {
  LESSON: 10,
  SCENARIO: 20,
  QUIZ_ANSWER: 5,
  MODULE: 50,
  DAILY_CHALLENGE: 20,
  PERFECT_QUIZ: 30,
} as const;

export const LEVELS = [
  { level: 1, name: 'Explorer', minXp: 0 },
  { level: 2, name: 'Learner', minXp: 100 },
  { level: 3, name: 'Rights Seeker', minXp: 250 },
  { level: 4, name: 'Rights Champion', minXp: 500 },
  { level: 5, name: 'Rights Ambassador', minXp: 900 },
] as const;

export function levelFromXp(xp: number): { level: number; name: string; minXp: number } {
  let current: { level: number; name: string; minXp: number } = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  return current;
}

export function levelName(level: number) {
  return LEVELS.find((l) => l.level === level)?.name ?? 'Explorer';
}
