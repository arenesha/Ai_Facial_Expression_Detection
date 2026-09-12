import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useCamera } from '@/hooks/useCamera';
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker';
import { useExpressionDetection } from '@/hooks/useExpressionDetection';
import { TopBar } from '@/components/cyber/TopBar';
import { TargetExpressionPanel } from '@/components/cyber/TargetExpressionPanel';
import { ExpressionGuide } from '@/components/cyber/ExpressionGuide';
import { AiProcessingPanel } from '@/components/cyber/AiProcessingPanel';
import { CameraPanel } from '@/components/camera/CameraPanel';
import { MatchAnimation } from '@/components/ui/MatchAnimation';
import { ResultModal } from '@/components/ui/ResultModal';

export const Game: React.FC = () => {
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatchScore, setLastMatchScore] = useState(0);
  const matchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Existing Hooks (100% Preserved GPU MediaPipe Pipeline) ─────────────────
  const { landmarker, isLoaded: landmarkerLoaded } = useFaceLandmarker();
  const { videoRef, isReady: cameraReady, startCamera, stopCamera } = useCamera();
  const {
    detection, faceCount, cameraStatus,
    startDetection, stopDetection,
    setOnMatch, setOnAutoStart,
    setTargetExpression, setIsPlaying, resetAutoStart,
  } = useExpressionDetection(landmarker);

  // ── Game Engine with Two Separate Timers & Immediate Match ─────────────────
  const {
    gameState,
    targetTimeLeft,       // Expression Timer: countdown from 5s
    overallGameTimeMs,    // Overall Game Timer: count up from 0s
    currentTarget,
    metrics,
    beginPlaying,
    pauseGame,
    resumeGame,
    handleMatch,
    targetStartRef,
  } = useGameEngine();

  // 1. Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopDetection();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Start detection loop when both camera & AI model are ready
  useEffect(() => {
    if (cameraReady && landmarkerLoaded && videoRef.current) {
      startDetection(videoRef.current);
    }
    return () => stopDetection();
  }, [cameraReady, landmarkerLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Register auto-start callback once face is stabilized
  useEffect(() => {
    setOnAutoStart(() => {
      beginPlaying();
    });
  }, [setOnAutoStart, beginPlaying]);

  // 4. Sync playing state to expression detection
  useEffect(() => {
    setIsPlaying(gameState === 'PLAYING');
  }, [gameState, setIsPlaying]);

  // 5. Sync target expression whenever target advances
  useEffect(() => {
    if (currentTarget) {
      setTargetExpression(currentTarget.expression);
    }
  }, [currentTarget, setTargetExpression]);

  // 6. Register match trigger (Immediate match -> Next expression immediately!)
  useEffect(() => {
    setOnMatch(() => {
      const reactionMs = performance.now() - targetStartRef.current;
      const pts = handleMatch(reactionMs);

      setLastMatchScore(pts || 10);
      setShowMatch(true);

      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
      matchTimeoutRef.current = setTimeout(() => {
        setShowMatch(false);
      }, 800);
    });
  }, [setOnMatch, handleMatch, targetStartRef]);

  // 7. Manual Start / Restart handler (triggers from main CTA button)
  const handleStartGame = useCallback(() => {
    if (!cameraReady) {
      startCamera();
    }
    resetAutoStart();
    beginPlaying();
  }, [cameraReady, startCamera, resetAutoStart, beginPlaying]);

  const handlePlayAgain = useCallback(() => {
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    setShowMatch(false);
    resetAutoStart();
    beginPlaying();
  }, [resetAutoStart, beginPlaying]);

  // Total rounds calculation (1 to 10)
  const currentRound = Math.min(10, (metrics.matched + metrics.missed) + 1);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between font-rajdhani select-none bg-[#05060f] cosmic-bg">
      {/* ── 1 & 2. TOP BAR & STAT ROW ── */}
      <TopBar
        score={metrics.score}
        streak={metrics.combo}
        matched={metrics.matched}
        currentRound={currentRound}
        maxRounds={10}
        expressionTimeLeftMs={targetTimeLeft}
        overallGameTimeMs={overallGameTimeMs}
        isAiActive={landmarkerLoaded && cameraReady}
        isPlaying={gameState === 'PLAYING'}
        isPaused={gameState === 'PAUSED'}
        onPause={pauseGame}
        onResume={resumeGame}
      />

      {/* ── MAIN 3-COLUMN CYBER HUD CONTAINER ── */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 flex items-center justify-center gap-6 z-10 min-h-0 py-1 mb-1 overflow-hidden">

        {/* ── 3. LEFT PANEL: TARGET EXPRESSION ── */}
        <div className="w-[240px] shrink-0 flex flex-col items-center justify-center min-h-0">
          <TargetExpressionPanel
            currentTarget={currentTarget}
            detectedExpression={detection.expression}
            isMatching={showMatch}
          />
        </div>

        {/* ── 4. CENTER PANEL: CAMERA & MAIN CTA ── */}
        <div className="w-[520px] shrink-0 flex flex-col items-center justify-center min-h-0">
          <CameraPanel
            videoRef={videoRef}
            detection={detection}
            faceCount={faceCount}
            isReady={cameraReady}
            cameraStatus={cameraStatus}
            isPlaying={gameState === 'PLAYING'}
            onStartGame={handleStartGame}
          />
        </div>

        {/* ── 5 & 6. RIGHT COLUMN: EXPRESSION GUIDE & PROCESS STATUS ── */}
        <div className="w-[240px] shrink-0 flex flex-col items-center justify-center gap-2.5 min-h-0">
          {/* 5. Upper: Expression Guide 2x3 Grid */}
          <ExpressionGuide
            detectedExpression={detection.expression}
            targetExpression={currentTarget?.expression || 'smile'}
          />

          {/* 6. Lower: Process Status Visualizer */}
          <AiProcessingPanel
            isFaceDetected={faceCount === 1}
            isPlaying={gameState === 'PLAYING'}
          />
        </div>
      </main>

      {/* ── Glowing Planet Silhouettes at bottom corners ── */}
      <div className="planet-bottom-left" />
      <div className="planet-bottom-right" />

      {/* ── Faint PCB Circuit Trace Line Decorations near Top Corners ── */}
      <svg className="absolute top-0 left-0 w-64 h-32 pointer-events-none z-10 opacity-40 text-[#4ce3ff]" viewBox="0 0 200 100" fill="none" stroke="currentColor">
        <path d="M 0 20 L 40 20 L 60 40 L 120 40 L 140 20 L 200 20" strokeWidth="1" />
        <circle cx="60" cy="40" r="2" fill="#4ce3ff" />
        <circle cx="120" cy="40" r="2" fill="#4ce3ff" />
        <path d="M 0 50 L 30 50 L 45 65 L 90 65" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="90" cy="65" r="1.5" fill="#4ce3ff" />
      </svg>

      <svg className="absolute top-0 right-0 w-64 h-32 pointer-events-none z-10 opacity-40 text-[#4ce3ff]" viewBox="0 0 200 100" fill="none" stroke="currentColor">
        <path d="M 200 20 L 160 20 L 140 40 L 80 40 L 60 20 L 0 20" strokeWidth="1" />
        <circle cx="140" cy="40" r="2" fill="#4ce3ff" />
        <circle cx="80" cy="40" r="2" fill="#4ce3ff" />
        <path d="M 200 50 L 170 50 L 155 65 L 110 65" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="110" cy="65" r="1.5" fill="#4ce3ff" />
      </svg>

      {/* ── 7. CORNER TAGLINES ── */}
      <div className="absolute bottom-3 left-6 z-20 flex flex-col items-start gap-1 select-none pointer-events-none">
        <div className="flex flex-col leading-tight">
          <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]">
            YOUR
          </span>
          <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]">
            EXPRESSIONS
          </span>
          <span className="font-orbitron text-[9px] font-black tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
            POWER
          </span>
          <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]">
            THE GAME <span className="font-mono text-[8px] tracking-tighter">//</span>
          </span>
          <div className="w-12 h-[2px] bg-[#00e5ff] mt-0.5 shadow-[0_0_8px_rgba(0,229,255,0.9)]" />
        </div>
      </div>

      <div className="absolute bottom-3 right-6 z-20 flex flex-col items-end leading-tight select-none pointer-events-none text-right">
        <span className="font-serif italic text-base font-bold text-[#00e5ff] tracking-wide drop-shadow-[0_0_10px_rgba(0,229,255,0.9)]">
          Think
        </span>
        <span className="font-serif italic text-base font-bold text-[#00e5ff] tracking-wide drop-shadow-[0_0_10px_rgba(0,229,255,0.9)]">
          Express
        </span>
        <span className="font-serif italic text-base font-bold text-[#00e5ff] tracking-wide drop-shadow-[0_0_10px_rgba(0,229,255,0.9)] flex items-center gap-1">
          Play <span className="text-xs not-italic">😊</span>
        </span>
      </div>

      {/* ── MATCH CELEBRATION ANIMATION ── */}
      <MatchAnimation show={showMatch} score={lastMatchScore} combo={metrics.combo} />

      {/* ── GAME OVER RESULT MODAL ── */}
      {gameState === 'GAME_OVER' && (
        <ResultModal
          metrics={metrics}
          onPlayAgain={handlePlayAgain}
          onExit={handlePlayAgain}
        />
      )}
    </div>
  );
};
