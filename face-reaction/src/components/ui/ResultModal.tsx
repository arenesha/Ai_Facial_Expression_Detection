import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, CheckCircle, XCircle, RotateCcw, LogOut } from 'lucide-react';
import { GameMetrics } from '@/types/game';

interface ResultModalProps {
  metrics: GameMetrics;
  onPlayAgain: () => void;
  onExit: () => void;
}

const StatRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color?: string }> = ({
  icon, label, value, color = 'text-white'
}) => (
  <div className="flex items-center justify-between py-2 border-b border-cyan-500/15 last:border-0">
    <div className="flex items-center gap-2.5 text-cyan-200/70 font-orbitron text-xs tracking-wider">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-orbitron text-base font-bold tracking-wider ${color}`}>{value}</span>
  </div>
);

export const ResultModal: React.FC<ResultModalProps> = ({ metrics, onPlayAgain, onExit }) => {
  const total = metrics.matched + metrics.missed;
  const accuracy = total > 0 ? Math.round((metrics.matched / total) * 100) : 0;
  const avgReaction = metrics.matched > 0
    ? (metrics.totalReactionTimeMs / metrics.matched / 1000).toFixed(2)
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative bg-[#060e22]/90 border-2 border-[#00f0ff] shadow-[0_0_40px_rgba(0,240,255,0.45)] rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5 w-full max-w-sm backdrop-blur-md"
      >
        {/* Futuristic Corner Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff007f]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff007f]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff007f]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff007f]" />

        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-1 filter drop-shadow-[0_0_12px_#00f0ff]">🏆</div>
          <h2 className="font-orbitron text-2xl font-black tracking-widest text-[#00f0ff] text-glow-cyan uppercase">
            GAME COMPLETE
          </h2>
          <p className="font-orbitron text-cyan-300/60 text-[10px] tracking-[0.25em] uppercase mt-0.5">
            FINAL RESULTS
          </p>
        </div>

        {/* Big Score Box */}
        <div className="w-full bg-[#040816]/80 rounded-xl px-6 py-3 text-center border border-cyan-400/30 shadow-[inset_0_0_15px_rgba(0,240,255,0.15)]">
          <p className="font-orbitron text-[#00f0ff]/70 text-[10px] uppercase tracking-widest font-bold">
            FINAL SCORE
          </p>
          <p className="font-orbitron text-5xl font-black text-white text-glow-cyan tabular-nums mt-0.5">
            {metrics.score}
          </p>
        </div>

        {/* Stats List */}
        <div className="w-full bg-[#040816]/50 rounded-xl px-4 py-2 border border-cyan-500/15">
          <StatRow icon={<Zap size={14} className="text-[#00f0ff]" />} label="BEST COMBO" value={`×${metrics.bestCombo}`} color="text-[#00f0ff] text-glow-cyan" />
          <StatRow icon={<CheckCircle size={14} className="text-emerald-400" />} label="MATCHED" value={metrics.matched} color="text-emerald-400" />
          <StatRow icon={<XCircle size={14} className="text-[#ff007f]" />} label="MISSED" value={metrics.missed} color="text-[#ff007f]" />
          <StatRow icon={<Trophy size={14} className="text-yellow-400" />} label="ACCURACY" value={`${accuracy}%`} color="text-yellow-400" />
          <StatRow icon={<Trophy size={14} className="text-cyan-400" />} label="AVG REACTION" value={`${avgReaction}s`} color="text-white" />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#00f0ff] via-[#00c8ff] to-[#ff007f] text-black font-orbitron font-black text-sm uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw size={16} /> Play Again
          </button>
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 border border-cyan-400/20 text-cyan-200/60 font-orbitron font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </motion.div>
    </div>
  );
};

