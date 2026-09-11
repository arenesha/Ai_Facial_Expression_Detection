import React from 'react';
import type { GameMode } from '@/types/game';

interface GameModeCardProps {
  mode: GameMode;
  selected: boolean;
  onSelect: (mode: GameMode) => void;
}

const modeData: Record<GameMode, { title: string; desc: string; detail: string; icon: string }> = {
  classic: {
    icon: '🏆',
    title: 'Classic',
    desc: 'Best of 5 rounds',
    detail: 'The traditional Rock Paper Scissors match. Win the majority of 5 rounds to claim victory.',
  },
  timeattack: {
    icon: '⏱️',
    title: 'Time Attack',
    desc: '60 seconds',
    detail: 'Score as many points as you can before time runs out. Speed and accuracy are everything.',
  },
  endless: {
    icon: '♾️',
    title: 'Endless',
    desc: 'Survive',
    detail: 'Keep playing until you lose 3 consecutive rounds. How long can you last?',
  },
};

export const GameModeCard: React.FC<GameModeCardProps> = ({ mode, selected, onSelect }) => {
  const data = modeData[mode];
  return (
    <button
      onClick={() => onSelect(mode)}
      aria-pressed={selected}
      aria-label={`${data.title} mode: ${data.desc}`}
      className={[
        'w-full text-left rounded-2xl border p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        selected
          ? 'bg-accent/10 border-accent/50 shadow-lg shadow-accent/20'
          : 'bg-dark-700/60 border-white/10 hover:border-white/20 hover:bg-dark-700',
      ].join(' ')}
    >
      <div className="text-3xl mb-3" aria-hidden>{data.icon}</div>
      <div className="font-bold text-white text-base mb-0.5">{data.title}</div>
      <div className={`text-sm font-semibold mb-2 ${selected ? 'text-accent' : 'text-white/40'}`}>{data.desc}</div>
      <div className="text-xs text-white/40 leading-relaxed">{data.detail}</div>
      {selected && (
        <div className="mt-3 flex items-center gap-1 text-accent text-xs font-bold">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Selected
        </div>
      )}
    </button>
  );
};
