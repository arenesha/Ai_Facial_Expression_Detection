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
      // Must be actively playing (not paused, not game over)
      if (gameState !== 'PLAYING') return;

      const reactionMs = performance.now() - targetStartRef.current;
      // handleMatch immediately updates score/streak, records match, and advances target!
      const pts = handleMatch(reactionMs);

      setLastMatchScore(pts || 10);
      setShowMatch(true);

      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
      // Brief HUD match notification that does NOT block the immediate expression switch
      matchTimeoutRef.current = setTimeout(() => {
        setShowMatch(false);
      }, 500);
    });
  }, [setOnMatch, handleMatch, targetStartRef, gameState]);

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
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col justify-between bg-cover bg-center font-rajdhani select-none"
      style={{
        backgroundImage: `url('/user_futuristic_bg.png')`,
        backgroundColor: '#040816',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ── TOP HUD BAR (Score, Streak, Logo, Title, Game Time, AI Active, Round, Expression Time, Pause/Resume) ── */}
      <TopBar
        score={metrics.score}
        streak={metrics.combo}
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

      {/* ── MAIN 3-COLUMN CYBER HUD CONTAINER (1600x900 target layout) ── */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto px-6 grid grid-cols-12 gap-5 items-center z-10 min-h-0 mb-6">
        
        {/* ── LEFT COLUMN: TARGET EXPRESSION (Col 3 / 12) ── */}
        <div className="col-span-3 h-[420px] flex flex-col justify-center">
          <TargetExpressionPanel currentTarget={currentTarget} />
        </div>

        {/* ── CENTER COLUMN: CAMERA & MAIN CTA (Col 6 / 12) ── */}
        <div className="col-span-6 h-[460px] flex flex-col items-center justify-center">
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

        {/* ── RIGHT COLUMN: EXPRESSION GUIDE & AI PROCESSING (Col 3 / 12) ── */}
        <div className="col-span-3 h-[420px] flex flex-col gap-2.5 justify-between">
          {/* Upper: Expression Guide 2x3 Grid - Images Only */}
          <div className="flex-1 min-h-0">
            <ExpressionGuide detectedExpression={detection.expression} />
          </div>

          {/* Lower: AI Processing Visualizer */}
          <div className="h-28">
            <AiProcessingPanel
              isFaceDetected={faceCount === 1}
              isPlaying={gameState === 'PLAYING'}
            />
          </div>
        </div>
      </main>

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
