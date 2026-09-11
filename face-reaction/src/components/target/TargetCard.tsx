import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, EXPRESSIONS, DetectionResult } from '@/types/game';

interface TargetCardProps {
  target: Target;
  timeLeftMs: number;
  durationMs: number;
  detection: DetectionResult;
  isCurrent: boolean;
  showSuccess: boolean;
}

export const TargetCard: React.FC<TargetCardProps> = ({
  target,
  timeLeftMs,
  durationMs,
  detection,
  isCurrent,
  showSuccess,
}) => {
  const exprInfo   = EXPRESSIONS[target.expression];
  const progress   = isCurrent ? Math.max(0, timeLeftMs / durationMs) : 1;
  const timeDisplay = isCurrent ? (Math.max(0, timeLeftMs) / 1000).toFixed(1) : '';

  const isMatching = isCurrent && detection.expression === target.expression;
  const isMatchActive = isMatching || showSuccess;

  const progressColor =
    progress > 0.5 ? '#38bdf8' :
    progress > 0.25 ? '#fbbf24' : '#ef4444';

  if (!isCurrent) {
    // Compact "up next" row
    return (
      <div className="rounded-xl border border-white/5 bg-[#1e293b]/50 px-4 py-3 flex items-center gap-3 opacity-70">
        <span className="text-3xl select-none">{exprInfo.emoji}</span>
        <span className="text-sm text-white/50 font-semibold tracking-widest uppercase">{exprInfo.label}</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-white/15 bg-[#1e293b] flex flex-col items-center justify-center p-6 overflow-hidden h-full min-h-[280px]">

      {/* Success flash */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-green-400/10 rounded-2xl"
          />
        )}
      </AnimatePresence>

      {/* Circular progress timer */}
      <div className="relative flex items-center justify-center mb-5">
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }} className="absolute">
          <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <circle
            cx="65" cy="65" r="58"
            fill="none"
            stroke={isMatchActive ? '#22c55e' : progressColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 58}
            strokeDashoffset={(2 * Math.PI * 58) * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.08s linear, stroke 0.2s' }}
          />
        </svg>

        {/* Target emoji */}
        <motion.span
          key={target.id}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{
            scale: showSuccess ? [1, 1.25, 1] : isMatchActive ? [1, 1.06, 1] : 1,
            opacity: 1,
          }}
          transition={{
            scale: { repeat: isMatchActive && !showSuccess ? Infinity : 0, duration: 0.5 },
            opacity: { duration: 0.2 },
          }}
          className="text-7xl select-none z-10 leading-none"
        >
          {exprInfo.emoji}
        </motion.span>
      </div>

      {/* Expression label */}
      <motion.p
        animate={{ color: isMatchActive ? '#4ade80' : '#ffffff' }}
        transition={{ duration: 0.15 }}
        className="text-xl font-black tracking-widest uppercase"
      >
        {exprInfo.label}
      </motion.p>

      {/* Feedback line */}
      <div className="mt-2 h-5 text-center">
        {isMatchActive ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-xs font-bold tracking-wider"
          >
            ✓ MATCHED
          </motion.p>
        ) : detection.expression !== 'unknown' ? (
          <p className="text-white/25 text-xs">
            You: {EXPRESSIONS[detection.expression as keyof typeof EXPRESSIONS]?.emoji ?? ''} {detection.expression.toUpperCase()}
          </p>
        ) : null}
      </div>

      {/* Timer */}
      <p className={`mt-4 text-2xl font-mono font-bold tabular-nums ${progress < 0.25 ? 'text-red-400' : 'text-white/35'}`}>
        {timeDisplay}s
      </p>
    </div>
  );
};
