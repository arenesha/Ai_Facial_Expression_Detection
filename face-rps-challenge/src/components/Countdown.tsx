import React, { useEffect, useState } from 'react';
import { useSound } from '@/hooks/useSound';

interface CountdownProps {
  onComplete: () => void;
}

const steps = ['3', '2', '1', 'GO!'];

export const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);
  const { play } = useSound();

  useEffect(() => {
    play(index < 3 ? 'countdown' : 'go');
    if (index >= steps.length - 1) {
      const t = setTimeout(onComplete, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setIndex(i => i + 1);
      setKey(k => k + 1);
    }, 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const isGo = index === 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm"
      role="status"
      aria-live="assertive"
    >
      <div
        key={key}
        className={`animate-countDown font-black tabular-nums select-none ${
          isGo
            ? 'text-win text-8xl md:text-[10rem]'
            : 'text-white text-9xl md:text-[12rem]'
        }`}
        style={{ textShadow: isGo ? '0 0 40px rgba(34,197,94,0.6)' : '0 0 40px rgba(99,102,241,0.5)' }}
      >
        {steps[index]}
      </div>
    </div>
  );
};
