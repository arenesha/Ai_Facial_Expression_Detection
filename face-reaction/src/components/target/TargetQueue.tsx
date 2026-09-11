import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Target, DetectionResult } from '@/types/game';
import { TargetCard } from './TargetCard';

interface TargetQueueProps {
  currentTarget: Target | null;
  queue: Target[];
  timeLeftMs: number;
  durationMs: number;
  detection: DetectionResult;
  showSuccess: boolean;
}

export const TargetQueue: React.FC<TargetQueueProps> = ({
  currentTarget,
  queue,
  timeLeftMs,
  durationMs,
  detection,
  showSuccess,
}) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Label */}
      <p className="text-white/40 text-xs uppercase tracking-widest font-bold text-center">
        👆 MAKE THIS FACE
      </p>

      {/* Current target */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="popLayout">
          {currentTarget && (
            <motion.div
              key={currentTarget.id}
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="h-full"
            >
              <TargetCard
                target={currentTarget}
                timeLeftMs={timeLeftMs}
                durationMs={durationMs}
                detection={detection}
                isCurrent={true}
                showSuccess={showSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming label */}
      <p className="text-white/20 text-xs uppercase tracking-widest font-semibold text-center">
        Up Next
      </p>

      {/* Upcoming queue */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {queue.slice(0, 3).map((target, index) => (
            <motion.div
              key={target.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 - index * 0.25 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25, delay: index * 0.04 }}
            >
              <TargetCard
                target={target}
                timeLeftMs={0}
                durationMs={durationMs}
                detection={{ expression: 'unknown', confidence: 0 }}
                isCurrent={false}
                showSuccess={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
