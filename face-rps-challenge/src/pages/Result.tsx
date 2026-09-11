import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import type { GameMode, RoundRecord } from '@/types/game';
import { winRate } from '@/utils/gameLogic';
import { loadStats } from '@/utils/persistence';

interface ResultState {
  mode: GameMode;
  rounds: RoundRecord[];
  playerScore: number;
  computerScore: number;
  bestStreak: number;
}

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as Partial<ResultState>;
  const { rounds = [], playerScore = 0, computerScore = 0, bestStreak = 0 } = state;

  const wins = rounds.filter(r => r.result === 'win').length;
  const losses = rounds.filter(r => r.result === 'lose').length;
  const draws = rounds.filter(r => r.result === 'draw').length;
  const total = rounds.length;

  const playerWon = playerScore > computerScore;
  const isDraw = playerScore === computerScore;

  const stats = loadStats();

  const resultLabel = isDraw ? 'DRAW' : playerWon ? 'YOU WIN' : 'YOU LOSE';
  const resultIcon = isDraw ? '🤝' : playerWon ? '🏆' : '💔';
  const resultColor = isDraw ? 'text-draw' : playerWon ? 'text-win' : 'text-lose';

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col">
      <Header showControls={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-8">
        {/* Result hero */}
        <div className="text-center animate-scaleIn">
          <div className="text-6xl mb-4" aria-hidden>{resultIcon}</div>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Game Over</div>
          <h1 className={`text-4xl md:text-6xl font-black tracking-tight ${resultColor}`}>
            {resultLabel}
          </h1>
        </div>

        {/* Final score */}
        <div className="flex items-center gap-6 animate-fadeUp">
          <div className="text-center">
            <div className="text-5xl font-black text-white">{playerScore}</div>
            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">You</div>
          </div>
          <div className="text-white/20 text-2xl font-bold">—</div>
          <div className="text-center">
            <div className="text-5xl font-black text-white">{computerScore}</div>
            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Computer</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="w-full max-w-md bg-dark-800/60 border border-white/10 rounded-2xl p-6 animate-fadeUp">
          <div className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Match Statistics</div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Rounds Played', value: total },
              { label: 'Wins', value: wins, color: 'text-win' },
              { label: 'Losses', value: losses, color: 'text-lose' },
              { label: 'Draws', value: draws, color: 'text-draw' },
              { label: 'Win Rate', value: winRate(wins, total) },
              { label: 'Best Streak', value: bestStreak, suffix: bestStreak >= 3 ? ' 🔥' : '' },
            ].map(({ label, value, color, suffix }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 col-span-1">
                <span className="text-sm text-white/50">{label}</span>
                <span className={`text-sm font-bold ${color ?? 'text-white'}`}>
                  {value}{suffix}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* All-time personal bests */}
        {stats.gamesPlayed > 1 && (
          <div className="w-full max-w-md bg-dark-800/40 border border-white/5 rounded-xl px-5 py-4">
            <div className="text-xs font-semibold tracking-widest text-white/20 uppercase mb-3">All‑time Records</div>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-xl font-black text-accent">{stats.highScore}</div>
                <div className="text-xs text-white/30">High Score</div>
              </div>
              <div>
                <div className="text-xl font-black text-accent">{stats.gamesPlayed}</div>
                <div className="text-xs text-white/30">Games Played</div>
              </div>
              <div>
                <div className="text-xl font-black text-accent">{stats.bestStreak}</div>
                <div className="text-xs text-white/30">Best Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
            Main Menu
          </Button>
          <Button variant="primary" size="lg" onClick={() => navigate('/game', { state: { mode: state.mode ?? 'classic' } })}>
            Play Again
          </Button>
        </div>
      </main>
    </div>
  );
};
