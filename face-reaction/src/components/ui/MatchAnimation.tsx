import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchAnimationProps {
  show: boolean;
  score: number;
  combo: number;
}

export const MatchAnimation: React.FC<MatchAnimationProps> = ({ show, score, combo }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: [1.2, 1], y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="absolute top-[26%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-50 select-none"
        >
          {/* Animated Neon Pulse Backlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff9d] via-[#00e5ff] to-[#ff2fa4] blur-xl opacity-60 rounded-full animate-pulse" />

          {/* Sleek Futuristic HUD Match Pill */}
          <div className="relative px-6 py-2 rounded-full bg-[#020617]/95 border-2 border-[#00ff9d] shadow-[0_0_35px_rgba(0,255,157,0.8),inset_0_0_15px_rgba(0,255,157,0.4)] backdrop-blur-xl flex items-center gap-3">
            {/* Glowing checkmark badge */}
            <span className="w-5 h-5 rounded-full bg-[#00ff9d] text-black font-black text-xs flex items-center justify-center shadow-[0_0_10px_#00ff9d]">
              ✓
            </span>
            
            {/* MATCHED Title */}
            <span className="font-orbitron font-black text-base tracking-widest text-[#00ff9d] uppercase drop-shadow-[0_0_10px_rgba(0,255,157,0.9)]">
              MATCHED!
            </span>

            {/* Divider */}
            <div className="w-[1.5px] h-4 bg-[#00ff9d]/50" />

            {/* Points */}
            <span className="font-orbitron font-black text-sm tracking-wider text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.9)]">
              +{score} PTS
            </span>

            {/* Combo Streak Pill */}
            {combo >= 2 && (
              <>
                <div className="w-[1.5px] h-4 bg-[#ff2fa4]/50" />
                <span className="font-orbitron font-black text-sm tracking-wider text-[#ff2fa4] drop-shadow-[0_0_10px_rgba(255,47,164,0.9)] flex items-center gap-1">
                  🔥 {combo}x COMBO
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
