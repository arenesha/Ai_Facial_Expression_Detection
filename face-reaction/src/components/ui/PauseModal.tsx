import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, LogOut } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onExit }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-800 border border-white/10 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl min-w-[320px]"
      >
        <h2 className="text-3xl font-black tracking-wider text-white">PAUSED</h2>
        <p className="text-white/40 text-sm tracking-widest uppercase">Game is paused</p>

        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-dark-900 font-bold text-lg rounded-xl hover:bg-accent-hover transition-colors"
          >
            <Play size={20} /> Resume
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 text-white font-semibold text-base rounded-xl hover:bg-white/15 transition-colors"
          >
            <RotateCcw size={18} /> Restart
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
