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
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.3, y: -30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
        >
          {/* Ring burst */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-20 h-20 rounded-full border-4 border-green-400"
          />
          <motion.div
            initial={{ scale: 0.3, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            className="absolute w-20 h-20 rounded-full border-2 border-green-300"
          />

          {/* MATCH! text */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="bg-green-400 text-dark-900 font-black text-3xl tracking-widest px-6 py-2 rounded-full shadow-[0_0_30px_rgba(74,222,128,0.8)] uppercase"
          >
            MATCH!
          </motion.div>

          {/* Score badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-green-300 font-bold text-lg"
          >
            +{score} pts {combo >= 3 ? `× ${combo} COMBO 🔥` : ''}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
