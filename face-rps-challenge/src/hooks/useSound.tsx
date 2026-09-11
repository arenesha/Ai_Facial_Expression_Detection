import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

type SoundKey = 'countdown' | 'go' | 'win' | 'lose' | 'draw' | 'click' | 'reveal';

interface SoundContextValue {
  muted: boolean;
  toggleMute: () => void;
  play: (key: SoundKey) => void;
}

const SoundContext = createContext<SoundContextValue>({
  muted: false,
  toggleMute: () => {},
  play: () => {},
});

/** Programmatically generated tones using AudioContext – no external files needed */
function createTonePlayer(audioCtx: AudioContext) {
  const play = (key: SoundKey) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    switch (key) {
      case 'countdown':
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'go':
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'win':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      case 'lose':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'draw':
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'reveal':
        osc.type = 'square';
        osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'click':
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
    }
  };
  return play;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tonePlayerRef = useRef<((key: SoundKey) => void) | null>(null);

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      tonePlayerRef.current = createTonePlayer(audioCtxRef.current);
    }
  }, []);

  const play = useCallback((key: SoundKey) => {
    if (muted) return;
    ensureAudioContext();
    tonePlayerRef.current?.(key);
  }, [muted, ensureAudioContext]);

  const toggleMute = useCallback(() => {
    ensureAudioContext();
    setMuted(m => !m);
  }, [ensureAudioContext]);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
