import React from 'react';
import { TOTAL_GAME_DURATION_MS } from '@/hooks/useGameEngine';

interface TopBarProps {
  score: number;
  streak: number;
  matched: number;
  currentRound: number;
  maxRounds: number;
  expressionTimeLeftMs: number;
  overallGameTimeMs: number;
  isAiActive: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  score,
  streak,
  matched,
  currentRound: _currentRound,
  expressionTimeLeftMs,
  overallGameTimeMs,
  isAiActive,
  isPlaying,
  isPaused,
  onPause,
  onResume,
}) => {
  // Target Expression Countdown (e.g. 00:05)
  const exprSec = Math.max(0, Math.ceil(expressionTimeLeftMs / 1000));
  const exprFormatted = `00:${exprSec.toString().padStart(2, '0')}`;

  // 2-Minute Continuous Session Timer Countdown (from 02:00 down to 00:00)
  const sessionTimeRemainingMs = Math.max(0, TOTAL_GAME_DURATION_MS - overallGameTimeMs);
  const sessionMins = Math.floor(sessionTimeRemainingMs / 60000);
  const sessionSecs = Math.floor((sessionTimeRemainingMs % 60000) / 1000);
  const formattedSessionTime = `${sessionMins.toString().padStart(2, '0')}:${sessionSecs.toString().padStart(2, '0')}`;

  const displayScore = !isPlaying && score === 0 ? 0 : score;
  const displayStreak = `${streak}x`;
  const displayMatched = `${matched}`;
  const displayTime = !isPlaying && overallGameTimeMs === 0 ? '02:00' : formattedSessionTime;

  return (
    <header className="w-full relative z-20 max-w-[1280px] mx-auto px-6 pt-3 pb-1 shrink-0">
      <div className="w-full flex items-center justify-between">
        
        {/* ── Left HUD: SCORE & STREAK ── */}
        <div className="relative p-[2px] clip-cyber-tr-bl bg-gradient-to-r from-[#00e5ff] via-[#18d9ff] to-[#ff2fa4] shadow-[0_0_20px_rgba(0,229,255,0.45)]">
          <div className="clip-cyber-tr-bl px-4 py-1.5 flex items-center gap-4 bg-[#020617]/95 backdrop-blur-md">
            {/* SCORE Box */}
            <div className="flex flex-col items-center min-w-[55px]">
              <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff] uppercase flex items-center gap-1">
                <span className="text-[#00e5ff]">★</span> SCORE
              </span>
              <span className="font-orbitron font-black text-2xl text-[#00e5ff] tracking-wider text-glow-cyan leading-tight">
                {displayScore}
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1.5px] h-7 bg-[#00e5ff]/30" />

            {/* STREAK Box */}
            <div className="flex flex-col items-center min-w-[45px]">
              <span className="font-orbitron text-[9px] font-black tracking-widest text-[#ff2fa4] uppercase flex items-center gap-1">
                <span className="text-[#ff2fa4]">🔥</span> STREAK
              </span>
              <span className="font-orbitron font-black text-2xl text-[#ff2fa4] tracking-wider text-glow-pink leading-tight">
                {displayStreak}
              </span>
            </div>
          </div>
        </div>

        {/* ── Center Header: Emoji + Title + Subtitle ── */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            {/* Smiling Face Emoji with Neon Glow */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-[#ffd200] via-[#ffaa00] to-[#ff7700] border-2 border-yellow-300 shadow-[0_0_20px_rgba(255,200,0,0.9)]">
              <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                😊
              </span>
            </div>

            {/* Headline "FACE REACTION" */}
            <h1 className="font-orbitron font-black text-3xl sm:text-4xl tracking-wider uppercase leading-none italic select-none">
              <span className="text-[#00e5ff] drop-shadow-[0_0_15px_rgba(0,229,255,0.9)]">FACE </span>
              <span className="bg-gradient-to-r from-[#a855f7] via-[#ff2fa4] to-[#ff3d9a] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,47,164,0.9)]">REACTION</span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="font-orbitron text-[9px] font-black tracking-[0.3em] text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] uppercase mt-1.5 text-center select-none">
            2-MINUTE CONTINUOUS CHALLENGE • MATCH THE EXPRESSION
          </p>
        </div>

        {/* ── Right HUD: Top Controls & Timer Box ── */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <a
              href="https://game.arenesha.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hud-pill-btn hub-pill-btn flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#020617]/90 border border-[#00e5ff]/80 text-[#00e5ff] font-orbitron text-[9px] font-extrabold tracking-wider uppercase shadow-[0_0_12px_rgba(0,229,255,0.4)] hover:bg-[#00e5ff]/20 hover:border-[#ff2fa4] hover:text-[#ff2fa4] transition-all"
              title="Explore More AI Games on Arenesha"
            >
              <span className="hud-btn-icon">🎮</span>
              <span>MORE GAMES &gt;</span>
            </a>

            <button
              onClick={isPaused ? onResume : onPause}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#020617]/90 border border-[#ff2fa4]/80 text-[#ff2fa4] font-orbitron text-[9px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(255,47,164,0.4)] hover:bg-[#ff2fa4]/20 transition-all cursor-pointer"
            >
              <span>{isPaused ? '▶ RESUME' : '❚❚ PAUSE'}</span>
            </button>

            {/* Top-Right AI Active Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#020617]/90 border border-[#00ff9d]/80 text-[#00ff9d] font-orbitron text-[9px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(0,255,157,0.4)]">
              <span className={`w-2 h-2 rounded-full ${isAiActive ? 'bg-[#00ff9d] shadow-[0_0_8px_#00ff9d] animate-pulse' : 'bg-yellow-400'}`} />
              <span>{isAiActive ? 'AI: ACTIVE' : 'AI: READY'}</span>
            </div>
          </div>

          {/* 2-MINUTE SESSION TIMER & TARGET TIMER HUD Box */}
          <div className="relative p-[2px] clip-cyber-tl-br bg-gradient-to-r from-[#00e5ff] via-[#2563ff] to-[#ff2fa4] shadow-[0_0_20px_rgba(0,229,255,0.45)]">
            <div className="clip-cyber-tl-br px-4 py-1.5 flex items-center gap-4 bg-[#020617]/95 backdrop-blur-md">
              {/* 2-MIN SESSION TIMER Box */}
              <div className="flex flex-col items-center min-w-[65px]">
                <span className="font-orbitron text-[8.5px] font-black tracking-widest text-[#00e5ff] uppercase flex items-center gap-1">
                  ⏱ SESSION
                </span>
                <span className="font-orbitron font-black text-2xl text-[#00e5ff] tracking-wider text-glow-cyan leading-tight tabular-nums">
                  {displayTime}
                </span>
              </div>

              {/* Vertical Divider */}
              <div className="w-[1.5px] h-7 bg-[#00e5ff]/30" />

              {/* MATCHES Box */}
              <div className="flex flex-col items-center min-w-[50px]">
                <span className="font-orbitron text-[8.5px] font-black tracking-widest text-[#00ff9d] uppercase flex items-center gap-1">
                  🎯 MATCHED
                </span>
                <span className="font-orbitron font-black text-2xl text-[#00ff9d] tracking-wider leading-tight">
                  {displayMatched}
                </span>
              </div>

              {/* Vertical Divider */}
              <div className="w-[1.5px] h-7 bg-[#00e5ff]/30" />

              {/* TARGET TIMER Box */}
              <div className="flex flex-col items-center min-w-[55px]">
                <span className="font-orbitron text-[8.5px] font-black tracking-widest text-[#ff2fa4] uppercase flex items-center gap-1">
                  ⏰ TARGET
                </span>
                <span className="font-orbitron font-black text-2xl text-[#ff2fa4] tracking-wider tabular-nums leading-tight drop-shadow-[0_0_12px_rgba(255,47,164,0.9)]">
                  {exprFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
