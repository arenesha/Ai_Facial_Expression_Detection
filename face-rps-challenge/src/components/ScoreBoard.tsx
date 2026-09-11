import React from 'react';

interface ScoreBoardProps {
  playerScore: number;
  computerScore: number;
  winStreak: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  playerScore,
  computerScore,
  winStreak,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {/* Player score */}
      <div className="flex-1 max-w-[160px] bg-dark-700/80 backdrop-blur border border-white/10 rounded-2xl p-4 text-center">
        <div className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-1">You</div>
        <div className="text-5xl font-black text-white tabular-nums" aria-live="polite" aria-label={`Your score: ${playerScore}`}>
          {playerScore}
        </div>
      </div>

      {/* Middle */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-white/30 font-semibold text-sm">VS</div>
        {winStreak >= 2 && (
          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
            <span>🔥</span>
            <span>{winStreak} STREAK</span>
          </div>
        )}
      </div>

      {/* Computer score */}
      <div className="flex-1 max-w-[160px] bg-dark-700/80 backdrop-blur border border-white/10 rounded-2xl p-4 text-center">
        <div className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-1">Computer</div>
        <div className="text-5xl font-black text-white tabular-nums" aria-live="polite" aria-label={`Computer score: ${computerScore}`}>
          {computerScore}
        </div>
      </div>
    </div>
  );
};
