import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, CheckCircle, XCircle, RotateCcw, LogOut, ShieldAlert, Award, Sparkles, Clock, Target } from 'lucide-react';
import { GameMetrics } from '@/types/game';

interface ResultModalProps {
  metrics: GameMetrics;
  onPlayAgain: () => void;
  onExit: () => void;
}

const StatRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string; badgeBg: string }> = ({
  icon, label, value, colorClass, badgeBg
}) => (
  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[#020718]/60 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
    <div className="flex items-center gap-2 text-cyan-200/80 font-orbitron text-[11px] tracking-wider">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-orbitron text-xs font-black tracking-widest px-2 py-0.5 rounded ${badgeBg} ${colorClass}`}>
      {value}
    </span>
  </div>
);

export const ResultModal: React.FC<ResultModalProps> = ({ metrics, onPlayAgain, onExit }) => {
  const total = metrics.matched + metrics.missed;
  const accuracy = total > 0 ? Math.round((metrics.matched / total) * 100) : 0;
  const avgReaction = metrics.matched > 0
    ? (metrics.totalReactionTimeMs / metrics.matched / 1000).toFixed(2)
    : '—';

  const getRankInfo = () => {
    if (accuracy >= 85) return { title: 'CYBER S-RANK', color: 'text-[#00ff9d]', border: 'border-[#00ff9d]', bg: 'bg-[#00ff9d]/15 shadow-[0_0_20px_rgba(0,255,157,0.4)]', icon: <Sparkles size={14} className="text-[#00ff9d]" /> };
    if (accuracy >= 60) return { title: 'PRO OPERATOR', color: 'text-[#00f0ff]', border: 'border-[#00f0ff]', bg: 'bg-[#00f0ff]/15 shadow-[0_0_20px_rgba(0,240,255,0.4)]', icon: <Award size={14} className="text-[#00f0ff]" /> };
    if (accuracy >= 40) return { title: 'CYBER AGENT', color: 'text-[#ff007f]', border: 'border-[#ff007f]', bg: 'bg-[#ff007f]/15 shadow-[0_0_20px_rgba(255,0,127,0.4)]', icon: <Target size={14} className="text-[#ff007f]" /> };
    return { title: 'ROOKIE CADET', color: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-400/15 shadow-[0_0_20px_rgba(251,191,36,0.4)]', icon: <ShieldAlert size={14} className="text-amber-400" /> };
  };

  const rank = getRankInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-[500px] aspect-square bg-gradient-to-b from-[#040e29]/95 via-[#020718]/95 to-[#010410]/98 border-2 border-[#00f0ff] shadow-[0_0_60px_rgba(0,240,255,0.5),inset_0_0_30px_rgba(0,240,255,0.15)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between backdrop-blur-xl overflow-hidden"
      >
        {/* Animated HUD Background Overlay Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Futuristic Corner Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff007f]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff007f]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff007f]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff007f]" />

        {/* Header with Glowing Trophy Badge */}
        <div className="relative text-center flex flex-col items-center">
          <div className="relative mb-1">
            <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 rounded-full animate-pulse" />
            <div className="relative w-11 h-11 rounded-full bg-[#031333] border border-[#00f0ff] shadow-[0_0_15px_#00f0ff] flex items-center justify-center text-xl">
              🏆
            </div>
          </div>
          <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-widest bg-gradient-to-r from-[#00f0ff] via-white to-[#ff007f] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,240,255,0.7)] uppercase">
            GAME COMPLETE
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
            <p className="font-orbitron text-cyan-300/70 text-[9.5px] tracking-[0.25em] uppercase">
              SYSTEM PERFORMANCE ANALYSIS
            </p>
          </div>
        </div>

        {/* 2-Column Balanced Dashboard Content */}
        <div className="grid grid-cols-2 gap-3.5 my-auto z-10">
          {/* Left Box: Final Score Card */}
          <div className="flex flex-col justify-between bg-gradient-to-b from-[#081840]/90 via-[#040c24]/90 to-[#020718]/95 rounded-xl p-4 border border-[#00f0ff]/40 shadow-[0_0_20px_rgba(0,240,255,0.15),inset_0_0_15px_rgba(0,240,255,0.1)] text-center relative overflow-hidden">
            {/* Subtle glow orb inside score card */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#00f0ff]/20 blur-xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-center gap-1.5 text-[#00f0ff] font-orbitron text-[9.5px] uppercase tracking-widest font-black">
                <Zap size={11} className="text-[#00f0ff]" />
                <span>FINAL SCORE</span>
              </div>
              <p className="font-orbitron text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-[#00f0ff] drop-shadow-[0_0_18px_rgba(0,240,255,0.8)] tabular-nums leading-none mt-2 mb-1">
                {metrics.score}
              </p>
            </div>

            {/* Rank Banner Badge */}
            <div className={`mt-2 py-1.5 px-2 rounded-lg border bg-black/60 backdrop-blur-md flex items-center justify-center gap-1.5 ${rank.border} ${rank.bg}`}>
              {rank.icon}
              <span className={`font-orbitron text-[10px] font-black tracking-wider uppercase ${rank.color}`}>
                {rank.title}
              </span>
            </div>
          </div>

          {/* Right Box: Sleek Stats Cards */}
          <div className="bg-gradient-to-b from-[#081840]/80 via-[#040c24]/80 to-[#020718]/90 rounded-xl p-2.5 border border-cyan-500/30 flex flex-col justify-between gap-1.5 shadow-[inset_0_0_15px_rgba(0,240,255,0.08)]">
            <StatRow icon={<Zap size={12} className="text-[#00f0ff]" />} label="BEST COMBO" value={`×${metrics.bestCombo}`} colorClass="text-[#00f0ff]" badgeBg="bg-[#00f0ff]/15 border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.3)]" />
            <StatRow icon={<CheckCircle size={12} className="text-[#00ff9d]" />} label="MATCHED" value={metrics.matched} colorClass="text-[#00ff9d]" badgeBg="bg-[#00ff9d]/15 border border-[#00ff9d]/30 shadow-[0_0_8px_rgba(0,255,157,0.3)]" />
            <StatRow icon={<XCircle size={12} className="text-[#ff007f]" />} label="MISSED" value={metrics.missed} colorClass="text-[#ff007f]" badgeBg="bg-[#ff007f]/15 border border-[#ff007f]/30 shadow-[0_0_8px_rgba(255,0,127,0.3)]" />
            <StatRow icon={<Trophy size={12} className="text-yellow-400" />} label="ACCURACY" value={`${accuracy}%`} colorClass="text-yellow-400" badgeBg="bg-yellow-400/15 border border-yellow-400/30 shadow-[0_0_8px_rgba(250,204,21,0.3)]" />
            <StatRow icon={<Clock size={12} className="text-cyan-300" />} label="AVG TIME" value={`${avgReaction}s`} colorClass="text-cyan-200" badgeBg="bg-cyan-400/15 border border-cyan-400/30 shadow-[0_0_8px_rgba(0,240,255,0.3)]" />
          </div>
        </div>

        {/* Action Buttons - 3 IDENTICAL SIZED HIGH-GLOW HORIZONTAL CYBER BUTTONS */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-1 z-10">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-1.5 w-full h-11 bg-gradient-to-r from-[#00f0ff] via-[#00d0ff] to-[#ff007f] text-black font-orbitron font-black text-[11px] uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:brightness-125 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer border-none"
          >
            <RotateCcw size={14} strokeWidth={2.5} />
            <span>PLAY AGAIN</span>
          </button>
          
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-1.5 w-full h-11 bg-[#091838]/90 border border-[#00f0ff]/70 text-[#00f0ff] font-orbitron font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:bg-[#00f0ff]/25 hover:border-[#00f0ff] hover:text-white hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <LogOut size={14} strokeWidth={2.5} />
            <span>EXIT</span>
          </button>

          <a
            href="https://game.arenesha.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full h-11 rounded-xl bg-[#091838]/90 border border-[#ff007f]/70 text-[#ff007f] font-orbitron text-[11px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:bg-[#ff007f]/25 hover:border-[#ff007f] hover:text-white hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] hover:scale-[1.03] active:scale-[0.97] transition-all no-underline"
            title="Explore More AI Games on Arenesha"
          >
            <span className="text-xs">🌐</span>
            <span>MORE GAMES</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
