import React from 'react';
import { Button } from '@/components/Button';
import { useSound } from '@/hooks/useSound';

interface HeaderProps {
  roundLabel?: string;
  onRestart?: () => void;
  showControls?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  roundLabel,
  onRestart,
  showControls = true,
}) => {
  const { muted, toggleMute } = useSound();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-dark-800/80 backdrop-blur border-b border-white/5">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-white">
          FACE<span className="text-accent">RPS</span>
        </span>
        <span className="hidden sm:block text-xs text-white/30 font-mono uppercase tracking-widest mt-0.5">
          AI Challenge
        </span>
      </div>

      {/* Round info */}
      {roundLabel && (
        <div className="text-sm font-semibold text-white/60 tracking-widest uppercase">
          {roundLabel}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {muted ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
          {onRestart && (
            <Button variant="ghost" size="sm" onClick={onRestart} aria-label="Restart game">
              ↻ Restart
            </Button>
          )}
        </div>
      )}
    </header>
  );
};
