import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameModeCard } from '@/components/GameModeCard';
import { Button } from '@/components/Button';
import type { GameMode } from '@/types/game';
import { loadStats } from '@/utils/persistence';

const MOVE_CARDS = [
  { expression: '😐', move: 'ROCK', label: 'Neutral Face' },
  { expression: '😄', move: 'PAPER', label: 'Smile' },
  { expression: '😮', move: 'SCISSORS', label: 'Open Mouth' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const stats = loadStats();

  const handleStart = () => {
    navigate('/game', { state: { mode: selectedMode } });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col">
      <Header showControls={true} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-12">
        {/* Hero */}
        <div className="text-center animate-fadeUp">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3">
            FACE <span className="text-accent">RPS</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl">
            Play Rock Paper Scissors with your face.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-white/30 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            Powered by AI Face Detection
          </div>
        </div>

        {/* Move cards */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          {MOVE_CARDS.map((c) => (
            <div
              key={c.move}
              className="flex-1 bg-dark-700/60 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:border-accent/40 hover:bg-dark-700 transition-all duration-200"
            >
              <div className="text-5xl mb-3" aria-hidden>{c.expression}</div>
              <div className="text-base font-black tracking-wide text-white mb-1">{c.move}</div>
              <div className="text-xs text-white/40 font-medium">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Mode selection */}
        <div className="w-full max-w-2xl">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Select Game Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['classic', 'timeattack', 'endless'] as GameMode[]).map((m) => (
              <GameModeCard key={m} mode={m} selected={selectedMode === m} onSelect={setSelectedMode} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button variant="primary" size="lg" onClick={handleStart} className="animate-glowPulse">
            START GAME
          </Button>
        </div>

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="w-full max-w-md bg-dark-800/60 border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3 text-center">Your Stats</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-white">{stats.highScore}</div>
                <div className="text-xs text-white/40">High Score</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{stats.gamesPlayed}</div>
                <div className="text-xs text-white/40">Games</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{stats.bestStreak}</div>
                <div className="text-xs text-white/40">Best Streak</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
