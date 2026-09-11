import type { Move, RoundResult, GameMode } from '@/types/game';

/** Determine winner of a single round */
export function determineWinner(player: Move, computer: Move): RoundResult {
  if (player === computer) return 'draw';
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'scissors' && computer === 'paper') ||
    (player === 'paper' && computer === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}

/** Random computer move */
export function getComputerMove(): Move {
  const moves: Move[] = ['rock', 'paper', 'scissors'];
  return moves[Math.floor(Math.random() * 3)];
}

/** Points awarded per round */
export function calcPoints(result: RoundResult, streak: number): number {
  if (result === 'win') return 10 + Math.max(0, streak - 1) * 5;
  if (result === 'draw') return 2;
  return 0;
}

/** Win condition per mode */
export function isGameOver(
  round: number,
  maxRounds: number,
  consecutiveLosses: number,
  mode: GameMode,
  timeLeft: number,
): boolean {
  if (mode === 'classic') return round > maxRounds;
  if (mode === 'timeattack') return timeLeft <= 0;
  if (mode === 'endless') return consecutiveLosses >= 3;
  return false;
}

/** Max rounds per mode */
export function getMaxRounds(mode: GameMode): number {
  if (mode === 'classic') return 5;
  if (mode === 'timeattack') return 999; // time based, not round based
  return 999; // endless
}

/** Time limit per mode in seconds */
export function getTimeLimit(mode: GameMode): number | undefined {
  if (mode === 'timeattack') return 60;
  return undefined;
}

/** Win-rate percentage */
export function winRate(wins: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((wins / total) * 100)}%`;
}

/** Result description text */
export function resultDescription(player: Move, computer: Move): string {
  if (player === computer) return "It's a draw!";
  const winner = determineWinner(player, computer);
  const p = player.charAt(0).toUpperCase() + player.slice(1);
  const c = computer.charAt(0).toUpperCase() + computer.slice(1);
  if (winner === 'win') return `${p} beats ${c}`;
  return `${c} beats ${p}`;
}
