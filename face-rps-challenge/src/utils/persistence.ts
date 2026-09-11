import type { PersistentStats } from '@/types/game';

const KEY = 'face_rps_stats';

export function loadStats(): PersistentStats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: PersistentStats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch { /* noop */ }
}

export function updateStats(
  current: PersistentStats,
  wins: number,
  losses: number,
  draws: number,
  streak: number,
  score: number,
): PersistentStats {
  const updated: PersistentStats = {
    highScore: Math.max(current.highScore, score),
    bestStreak: Math.max(current.bestStreak, streak),
    gamesPlayed: current.gamesPlayed + 1,
    totalWins: current.totalWins + wins,
    totalLosses: current.totalLosses + losses,
    totalDraws: current.totalDraws + draws,
  };
  saveStats(updated);
  return updated;
}

function defaultStats(): PersistentStats {
  return { highScore: 0, bestStreak: 0, gamesPlayed: 0, totalWins: 0, totalLosses: 0, totalDraws: 0 };
}
