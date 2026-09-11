import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  onComplete: () => void;
}

const STEPS = ['GET READY', '3', '2', '1', 'GO!'];

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (stepIdx >= STEPS.length) {
      onComplete();
      return;
    }

    const delay = stepIdx === 0 ? 1000 : 900;
    const timer = setTimeout(() => {
      setStepIdx(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [stepIdx, onComplete]);

  const currentStep = STEPS[stepIdx];
  const isGo = currentStep === 'GO!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep}
            initial={{ scale: 0.4, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.4, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="text-center"
          >
            <div
              className={`font-black tabular-nums tracking-tighter
                ${isGo ? 'text-green-400 text-[10rem] drop-shadow-[0_0_40px_rgba(74,222,128,0.8)]' : 'text-white text-[8rem]'}
                ${currentStep === 'GET READY' ? 'text-5xl font-bold tracking-widest uppercase text-accent' : ''}
              `}
            >
              {currentStep}
            </div>
            {isGo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-300/70 text-2xl font-semibold tracking-widest uppercase mt-4"
              >
                Match the expression!
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
