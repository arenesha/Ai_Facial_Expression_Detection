import React from 'react';
import { Pause, Play } from 'lucide-react';

interface TopBarProps {
  score: number;
  streak: number;
  currentRound: number;
  maxRounds: number;
  expressionTimeLeftMs: number; // 5-second expression timer countdown
  overallGameTimeMs: number;    // Overall game session timer count-up
  isAiActive: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  score,
  streak,
  currentRound,
  maxRounds,
  expressionTimeLeftMs,
  overallGameTimeMs,
  isAiActive,
  isPlaying,
  isPaused,
  onPause,
  onResume,
}) => {
  // Format Expression Timer (countdown from 5s: 00:05, 00:04, ...)
  const exprSec = Math.max(0, Math.ceil(expressionTimeLeftMs / 1000));
  const exprFormatted = `00:${exprSec.toString().padStart(2, '0')}`;

  // Format Overall Game Session Timer (counts up: 00:00, 00:01, ...)
  const totalGameSec = Math.floor(overallGameTimeMs / 1000);
  const gameMins = Math.floor(totalGameSec / 60).toString().padStart(2, '0');
  const gameSecs = (totalGameSec % 60).toString().padStart(2, '0');
  const gameTimeFormatted = `${gameMins}:${gameSecs}`;

  return (
    <header className="w-full flex items-center justify-between px-6 pt-3 pb-2 z-20">
      {/* ── TOP LEFT: SCORE & STREAK ── */}
      <div className="flex items-center gap-2">
        <div className="hud-panel rounded-2xl px-5 py-2 flex items-center gap-6 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          {/* SCORE */}
          <div className="flex flex-col">
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">
              SCORE
            </span>
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-wider text-glow-cyan">
              {score}
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-8 bg-cyan-500/30" />

          {/* STREAK */}
          <div className="flex flex-col">
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-[#ff007f] uppercase">
              STREAK
            </span>
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-[#ff007f] tracking-wider text-glow-pink">
              {streak}x
            </span>
          </div>
        </div>
      </div>

      {/* ── TOP CENTER: LOGO + TITLE + SUBTITLE + OVERALL GAME TIMER ── */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          {/* Glowing Smiley Emoji Icon */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 border-2 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <span className="text-2xl select-none filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
              😊
            </span>
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col items-start">
            <h1 className="font-orbitron font-black text-2xl sm:text-3xl tracking-tight uppercase leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#38bdf8] text-glow-cyan">
                FACE{' '}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff007f] to-[#e879f9] text-glow-pink">
                REACTION
              </span>
            </h1>
            <p className="font-orbitron text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-[#00f0ff] uppercase mt-0.5">
              MATCH THE EXPRESSION • BEAT THE CLOCK
            </p>
          </div>
        </div>

        {/* Dedicated Overall Game Timer Pill */}
        <div className="mt-1 flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#051428]/80 border border-cyan-400/30 shadow-[0_0_8px_rgba(0,240,255,0.25)]">
          <span className="font-orbitron text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            GAME TIME:
          </span>
          <span className="font-orbitron text-xs font-black text-[#00f0ff] text-glow-cyan tabular-nums tracking-wider">
            {gameTimeFormatted}
          </span>
        </div>
      </div>

      {/* ── TOP RIGHT: AI ACTIVE + ROUND + TIME LEFT + PAUSE/RESUME ── */}
      <div className="flex flex-col items-end gap-1">
        {/* Upper row: AI ACTIVE + PAUSE/RESUME BUTTON */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume Button */}
          {isPlaying && (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-[#00f0ff]/60 text-[#00f0ff] font-orbitron text-[10px] font-bold tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Pause size={12} />
              <span>PAUSE</span>
            </button>
          )}
          {isPaused && (
            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-950/90 hover:bg-pink-900 border border-[#ff007f] text-[#ff007f] font-orbitron text-[10px] font-bold tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(255,0,127,0.5)] animate-pulse cursor-pointer"
            >
              <Play size={12} fill="#ff007f" />
              <span>RESUME</span>
            </button>
          )}

          {/* AI ACTIVE Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#05141e]/80 border border-green-500/50 shadow-[0_0_8px_rgba(0,255,136,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88] animate-pulse" />
            <span className="font-orbitron text-[9px] font-bold tracking-widest text-[#00ff88]">
              AI: {isAiActive ? 'ACTIVE' : 'READY'}
            </span>
            <div className="flex items-end gap-0.5 ml-1 h-2">
              <span className="w-0.5 h-1 bg-[#00ff88] rounded-xs" />
              <span className="w-0.5 h-1.5 bg-[#00ff88] rounded-xs" />
              <span className="w-0.5 h-2 bg-[#00ff88] rounded-xs" />
            </div>
          </div>
        </div>

        {/* Lower row: ROUND & TIME LEFT (Expression Timer) Panel */}
        <div className="hud-panel rounded-2xl px-5 py-2 flex items-center gap-6 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          {/* ROUND */}
          <div className="flex flex-col">
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">
              ROUND
            </span>
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-wider text-glow-cyan">
              {currentRound}/{maxRounds}
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-8 bg-cyan-500/30" />

          {/* TIME LEFT (Expression Countdown) */}
          <div className="flex flex-col">
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-[#ff007f] uppercase">
              TIME LEFT
            </span>
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-[#ff007f] tracking-wider text-glow-pink tabular-nums">
              {exprFormatted}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
