import React, { useEffect, useRef, useState } from 'react';

interface ComputerPanelProps {
  /** 'waiting' = before round, 'thinking' = cycling emojis, 'revealed' = freeze last emoji */
  phase: 'waiting' | 'thinking' | 'revealed';
}

// Pure visual emojis — no game logic, no Rock/Paper/Scissors meaning
const EMOJIS = ['😀', '😎', '🤖', '😮', '😂', '😏', '🤔', '😍', '😲', '🤩', '😜', '🥳'];

const INTERVAL_MS = 2400; // ~2.4 s between changes (stays within 2–3 s requirement)

export const ComputerPanel: React.FC<ComputerPanelProps> = ({ phase }) => {
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [visible, setVisible] = useState(true);       // drives opacity fade
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Clear both timers safely ─────────────────────────────────────────────────
  const clearTimers = () => {
    if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (fadeRef.current     !== null) { clearTimeout(fadeRef.current);      fadeRef.current     = null; }
  };

  // ── Emoji carousel — starts on 'thinking', stops on everything else ──────────
  useEffect(() => {
    if (phase !== 'thinking') {
      clearTimers();          // freeze the current emoji (visible stays true)
      return;
    }

    // Fresh start for every new thinking phase
    setEmojiIndex(0);
    setVisible(true);

    intervalRef.current = setInterval(() => {
      // Brief fade-out
      setVisible(false);

      fadeRef.current = setTimeout(() => {
        setEmojiIndex(prev => (prev + 1) % EMOJIS.length);
        setVisible(true);
      }, 180); // 180 ms fade
    }, INTERVAL_MS);

    return () => clearTimers(); // cleanup when phase changes or unmount
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // Full-height panel matching the camera panel — only an emoji inside
    <div className="relative bg-dark-800 rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
      <span
        className="text-8xl md:text-9xl select-none transition-opacity"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: '180ms',
        }}
        aria-hidden
      >
        {EMOJIS[emojiIndex]}
      </span>
    </div>
  );
};
