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
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3 text-white/50">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-xl font-bold ${color}`}>{value}</span>
  </div>
);

export const ResultModal: React.FC<ResultModalProps> = ({ metrics, onPlayAgain, onExit }) => {
  const total = metrics.matched + metrics.missed;
  const accuracy = total > 0 ? Math.round((metrics.matched / total) * 100) : 0;
  const avgReaction = metrics.matched > 0
    ? (metrics.totalReactionTimeMs / metrics.matched / 1000).toFixed(2)
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 24 }}
        className="bg-dark-800 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-3xl font-black tracking-wider text-white">GAME COMPLETE</h2>
          <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">Final Results</p>
        </div>

        {/* Big score */}
        <div className="bg-dark-900 rounded-2xl px-10 py-4 text-center border border-white/5">
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Final Score</p>
          <p className="text-6xl font-black text-accent tabular-nums mt-1">{metrics.score}</p>
        </div>

        {/* Stats */}
        <div className="w-full">
          <StatRow icon={<Zap size={16} />} label="Best Combo" value={`×${metrics.bestCombo}`} color="text-accent" />
          <StatRow icon={<CheckCircle size={16} />} label="Matched" value={metrics.matched} color="text-green-400" />
          <StatRow icon={<XCircle size={16} />} label="Missed" value={metrics.missed} color="text-red-400" />
          <StatRow icon={<Trophy size={16} />} label="Accuracy" value={`${accuracy}%`} />
          <StatRow icon={<Trophy size={16} />} label="Avg Reaction" value={`${avgReaction}s`} />
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-dark-900 font-bold text-lg rounded-xl hover:bg-accent-hover transition-colors"
          >
            <RotateCcw size={20} /> Play Again
          </button>
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 text-white/50 font-semibold text-base rounded-xl hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} /> Exit
          </button>
        </div>
      </motion.div>
    </div>
  );
};
