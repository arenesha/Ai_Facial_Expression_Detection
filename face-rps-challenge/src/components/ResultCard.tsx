import React from 'react';
import type { Move, RoundResult } from '@/types/game';
import { MOVE_EMOJI, MOVE_LABELS } from '@/types/game';
import { resultDescription } from '@/utils/gameLogic';

interface ResultCardProps {
  result: RoundResult;
  playerMove: Move;
  computerMove: Move;
  points: number;
  onNext: () => void;
}

const resultConfig: Record<RoundResult, { label: string; icon: string; color: string; bg: string }> = {
  win: { label: 'YOU WIN', icon: '🎉', color: 'text-win', bg: 'bg-win/10 border-win/30' },
  lose: { label: 'YOU LOSE', icon: '😔', color: 'text-lose', bg: 'bg-lose/10 border-lose/30' },
  draw: { label: 'DRAW', icon: '🤝', color: 'text-draw', bg: 'bg-draw/10 border-draw/30' },
};

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  playerMove,
  computerMove,
  points,
  onNext,
}) => {
  const config = resultConfig[result];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-dark-900/70 backdrop-blur-sm p-4">
      <div
        className={`animate-scaleIn w-full max-w-sm bg-dark-800 border rounded-2xl p-6 text-center shadow-2xl ${config.bg}`}
        role="dialog"
        aria-label={`Round result: ${config.label}`}
      >
        <div className="text-4xl mb-2" aria-hidden>{config.icon}</div>
        <div className={`text-2xl font-black tracking-tight mb-4 ${config.color}`}>
          {config.label}
        </div>

        {/* Moves comparison */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl" aria-hidden>{MOVE_EMOJI[playerMove]}</span>
            <span className="text-xs text-white/40 font-semibold uppercase">{MOVE_LABELS[playerMove]}</span>
          </div>
          <span className="text-white/30 font-bold text-lg">VS</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl" aria-hidden>{MOVE_EMOJI[computerMove]}</span>
            <span className="text-xs text-white/40 font-semibold uppercase">{MOVE_LABELS[computerMove]}</span>
          </div>
        </div>

        <div className="text-sm text-white/50 mb-4">{resultDescription(playerMove, computerMove)}</div>

        {points > 0 && (
          <div className="inline-block bg-win/20 border border-win/40 text-win text-sm font-bold px-4 py-1.5 rounded-full mb-4 animate-fadeUp">
            +{points} POINTS
          </div>
        )}

        <button
          onClick={onNext}
          className="w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          autoFocus
        >
          Next Round
        </button>
      </div>
    </div>
  );
};
