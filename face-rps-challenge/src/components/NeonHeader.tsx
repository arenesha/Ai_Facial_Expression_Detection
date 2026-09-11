import React from 'react';
import { CyberFrame } from './CyberFrame';

interface NeonHeaderProps {
  score: number;
  streak: number;
  round: number;
  maxRounds: number;
  roundTimeLeft: number;
  totalTimeLeft: number;
  isPlaying: boolean;
}

function formatGameTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const NeonHeader: React.FC<NeonHeaderProps> = ({
  score,
  streak,
  round,
  maxRounds,
  roundTimeLeft,
  totalTimeLeft,
  isPlaying,
}) => {
  const formattedRoundTime = String(Math.max(0, roundTimeLeft)).padStart(2, '0');

  return (
    <div className="w-full flex-shrink-0 pt-2.5 px-4 relative z-10">
      <div className="flex items-center justify-between max-w-[1240px] mx-auto">
        
        {/* Left: Score + Streak */}
        <div className="w-[240px] h-[68px]">
          <CyberFrame cut="all" color="cyan" className="h-full">
            <div className="flex h-full divide-x divide-white/10 bg-[#020718]/80 backdrop-blur-md">
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold tracking-[0.2em] text-neon-cyan uppercase">Score</span>
                <span className="text-2xl font-black tabular-nums neon-text-cyan leading-tight">
                  {!isPlaying && score === 0 ? 1240 : score}
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center border-r-2 border-neon-magenta">
                <span className="text-[10px] font-bold tracking-[0.2em] text-neon-magenta uppercase">Streak</span>
                <span className="text-2xl font-black tabular-nums neon-text-magenta leading-tight">
                  {!isPlaying && streak === 0 ? '7x' : `${streak}x`}
                </span>
              </div>
            </div>
          </CyberFrame>
        </div>

        {/* Center: Title + Subtitle */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,200,0,0.6)] ring-2 ring-yellow-400/40">
              😊
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase flex items-center gap-2">
              <span className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.9)]">FACE</span>
              <span className="text-neon-magenta drop-shadow-[0_0_15px_rgba(255,0,255,0.9)]">REACTION</span>
            </h1>
          </div>
          <p className="text-[10px] font-extrabold tracking-[0.25em] text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] uppercase mt-1">
            Match the Expression • Beat the Clock
          </p>
        </div>

        {/* Right: Round + Time Left + MORE GAMES + AI Active Pill */}
        <div className="w-[280px] h-[68px] relative flex items-center">
          {/* Top-Right Pills: MORE GAMES & AI Active */}
          <div className="absolute -top-3.5 right-0 z-20 flex items-center gap-2">
            <a
              href="https://game.arenesha.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hud-pill-btn hub-pill-btn flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#05060f]/90 border border-[#00f0ff]/80 text-[#00f0ff] font-orbitron text-[9px] font-extrabold tracking-wider uppercase shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:bg-[#00f0ff]/20 hover:border-[#ff00c8] hover:text-[#ff00c8] transition-all"
              title="Explore More AI Games on Arenesha"
            >
              <span className="hud-btn-icon">🌐</span>
              <span>MORE GAMES &gt;</span>
            </a>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#00ff88]/60 bg-[#02150c]/90 shadow-[0_0_12px_rgba(0,255,136,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88] animate-pulse" />
              <span className="text-[9px] font-black tracking-widest text-[#00ff88] uppercase">
                AI: ACTIVE
              </span>
              <div className="flex items-end gap-[1.5px] ml-0.5 h-2">
                <div className="w-[1.5px] h-1 bg-[#00ff88] rounded-xs" />
                <div className="w-[1.5px] h-1.5 bg-[#00ff88] rounded-xs" />
                <div className="w-[1.5px] h-2 bg-[#00ff88] rounded-xs" />
              </div>
            </div>
          </div>

          <div className="w-full h-full">
            <CyberFrame cut="all" color="cyan" className="h-full">
              <div className="flex h-full divide-x divide-white/10 bg-[#020718]/80 backdrop-blur-md">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-neon-cyan uppercase">Round</span>
                  <span className="text-2xl font-black tabular-nums text-white leading-tight">
                    {!isPlaying && round === 0 ? '3/10' : `${round}/${maxRounds}`}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center border-r-2 border-neon-magenta">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-neon-magenta uppercase">Time Left</span>
                  <span className="text-2xl font-black tabular-nums neon-text-magenta leading-tight">
                    {!isPlaying && round === 0 ? '00:05' : `00:${formattedRoundTime}`}
                  </span>
                </div>
              </div>
            </CyberFrame>
          </div>
        </div>

      </div>
    </div>
  );
};
