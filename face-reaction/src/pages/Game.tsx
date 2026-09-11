import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pause, AlertCircle } from 'lucide-react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useCamera } from '@/hooks/useCamera';
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker';
import { useExpressionDetection } from '@/hooks/useExpressionDetection';
import { CameraPanel } from '@/components/camera/CameraPanel';
import { TargetQueue } from '@/components/target/TargetQueue';
import { ScoreBoard } from '@/components/ui/ScoreBoard';
import { MatchAnimation } from '@/components/ui/MatchAnimation';
import { PauseModal } from '@/components/ui/PauseModal';
import { ResultModal } from '@/components/ui/ResultModal';

interface GamePageProps {
  onExit: () => void;
}

/**
 * Internal flow (no separate Home screen involvement):
 *
 * INITIALIZING_CAMERA
 *   → camera permission granted → DETECTING_FACE
 *   → camera permission denied  → CAMERA_ERROR
 *
 * DETECTING_FACE
 *   → 8 consecutive frames with face → auto-call beginPlaying() → PLAYING
 *
 * PLAYING  ←→  PAUSED  →  GAME_OVER
 */

type InternalPhase = 'INITIALIZING_CAMERA' | 'CAMERA_ERROR' | 'DETECTING_FACE' | 'GAME';

export const Game: React.FC<GamePageProps> = ({ onExit }) => {
  const [internalPhase, setInternalPhase] = useState<InternalPhase>('INITIALIZING_CAMERA');
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatchScore, setLastMatchScore] = useState(0);
  const matchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchFiredRef   = useRef(false); // guard: one match per target

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { landmarker, isLoaded: landmarkerLoaded } = useFaceLandmarker();
  const { videoRef, isReady: cameraReady, error: cameraError, startCamera, stopCamera } = useCamera();
  const {
    detection, faceCount, cameraStatus,
    startDetection, stopDetection,
    setOnMatch, setOnAutoStart,
    setTargetExpression, setIsPlaying, resetAutoStart,
  } = useExpressionDetection(landmarker);

  const {
    gameState,
    gameTimeLeft, targetTimeLeft,
    targetQueue, currentTarget,
    metrics,
    beginPlaying,
    pauseGame, resumeGame,
    handleMatch,
    advanceTarget,
    targetDurationMs,
    targetStartRef,
  } = useGameEngine();

  // ── STEP 1: start camera immediately on mount ─────────────────────────────
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopDetection();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── STEP 2: when camera is ready, transition phase ─────────────────────────
  useEffect(() => {
    if (cameraReady) {
      setInternalPhase('DETECTING_FACE');
    }
  }, [cameraReady]);

  // ── STEP 3: when camera errors ──────────────────────────────────────────────
  useEffect(() => {
    if (cameraError) setInternalPhase('CAMERA_ERROR');
  }, [cameraError]);

  // ── STEP 4: when both camera + AI are ready, start detection loop ──────────
  useEffect(() => {
    if (cameraReady && landmarkerLoaded && videoRef.current) {
      startDetection(videoRef.current);
    }
    return () => stopDetection();
  }, [cameraReady, landmarkerLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── STEP 5: register auto-start callback (fires once after face stable) ────
  useEffect(() => {
    setOnAutoStart(() => {
      setInternalPhase('GAME');
      beginPlaying();
    });
  }, [setOnAutoStart, beginPlaying]);

  // ── STEP 6: sync playing state to detection ─────────────────────────────────
  useEffect(() => {
    setIsPlaying(gameState === 'PLAYING');
  }, [gameState, setIsPlaying]);

  // ── STEP 7: sync target expression whenever target changes ─────────────────
  useEffect(() => {
    if (currentTarget) {
      matchFiredRef.current = false;
      setTargetExpression(currentTarget.expression);
    }
  }, [currentTarget, setTargetExpression]);

  // ── STEP 8: register match callback ────────────────────────────────────────
  useEffect(() => {
    setOnMatch(() => {
      if (matchFiredRef.current || gameState !== 'PLAYING') return;
      matchFiredRef.current = true;

      const reactionMs = performance.now() - targetStartRef.current;
      handleMatch(reactionMs);

      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
      setLastMatchScore(10);
      setShowMatch(true);

      matchTimeoutRef.current = setTimeout(() => {
        setShowMatch(false);
        advanceTarget();
      }, 1000);
    });
  }, [setOnMatch, handleMatch, targetStartRef, advanceTarget, gameState]);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current); };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePlayAgain = useCallback(() => {
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    matchFiredRef.current = false;
    setShowMatch(false);
    resetAutoStart();
    setInternalPhase('DETECTING_FACE');
    // Re-run detection (camera stays open, just reset auto-start state)
    // beginPlaying will be called again by onAutoStart
  }, [resetAutoStart]);

  const isGameActive = gameState === 'PLAYING' || gameState === 'PAUSED';

  // ── Status text for the pre-game phase ──────────────────────────────────────
  const getPreGameStatus = () => {
    if (!cameraReady) return { text: 'Initializing camera…', pulse: true };
    if (!landmarkerLoaded) return { text: 'Loading AI model…', pulse: true };
    if (cameraStatus === 'NO_FACE') return { text: 'No face detected — position your face in view', pulse: false };
    if (cameraStatus === 'FACE_DETECTED') return { text: '● Face detected — starting…', pulse: false };
    return { text: 'Detecting face…', pulse: true };
  };

  const preStatus = getPreGameStatus();

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">😊</span>
          <h1 className="text-lg font-black tracking-widest uppercase text-white">Face Reaction</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* AI status pill */}
          <div className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
            landmarkerLoaded
              ? 'text-green-400 border-green-500/30 bg-green-500/10'
              : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse'
          }`}>
            {landmarkerLoaded ? '● AI Ready' : '○ Loading AI…'}
          </div>
          {gameState === 'PLAYING' && (
            <button
              onClick={pauseGame}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors"
            >
              <Pause size={16} /> Pause
            </button>
          )}
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 font-semibold text-sm transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* ── Score bar (only while game is active) ───────────────────────── */}
      {isGameActive && (
        <div className="flex-shrink-0 px-6 py-3">
          <ScoreBoard
            score={metrics.score}
            matched={metrics.matched}
            missed={metrics.missed}
            gameTimeLeftMs={gameTimeLeft}
            targetTimeLeftMs={targetTimeLeft}
          />
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6 min-h-0">

        {/* ── LEFT: Always-on camera ───────────────────────────────────────── */}
        <CameraPanel
          videoRef={videoRef}
          detection={detection}
          faceCount={faceCount}
          isReady={cameraReady}
          cameraStatus={cameraStatus}
        />

        {/* ── RIGHT: State-dependent content ──────────────────────────────── */}
        <div className="relative flex flex-col min-h-0">

          {/* Camera error state */}
          {internalPhase === 'CAMERA_ERROR' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
              <AlertCircle size={48} className="text-red-400" />
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Camera Access Required</h2>
                <p className="text-white/50 text-sm max-w-xs">{cameraError}</p>
              </div>
              <button
                onClick={() => { setInternalPhase('INITIALIZING_CAMERA'); startCamera(); }}
                className="px-8 py-3 bg-accent text-dark-900 font-bold rounded-xl hover:bg-accent-hover transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Pre-game: detecting face */}
          {internalPhase === 'DETECTING_FACE' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 text-center"
            >
              <div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-8xl mb-6 select-none"
                >
                  {cameraStatus === 'FACE_DETECTED' ? '😊' : '👤'}
                </motion.div>

                <h2 className="text-2xl font-black text-white mb-2">
                  {cameraStatus === 'FACE_DETECTED' ? 'Face Detected!' : 'Looking For Your Face'}
                </h2>

                <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-semibold ${
                  cameraStatus === 'FACE_DETECTED'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10'
                } ${preStatus.pulse ? 'animate-pulse' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${cameraStatus === 'FACE_DETECTED' ? 'bg-green-400' : 'bg-white/30'}`} />
                  {preStatus.text}
                </div>
              </div>

              {/* Setup checklist */}
              <div className="flex flex-col gap-2">
                <StatusRow ready={cameraReady} readyLabel="Camera connected" notReadyLabel="Starting camera…" />
                <StatusRow ready={landmarkerLoaded} readyLabel="AI model loaded" notReadyLabel="Loading AI model…" />
                <StatusRow ready={cameraStatus === 'FACE_DETECTED'} readyLabel="Face detected — game starting!" notReadyLabel="Position your face in the camera…" />
              </div>
            </motion.div>
          )}

          {/* Active game */}
          {internalPhase === 'GAME' && isGameActive && currentTarget && (
            <>
              <TargetQueue
                currentTarget={currentTarget}
                queue={targetQueue}
                timeLeftMs={targetTimeLeft}
                durationMs={targetDurationMs}
                detection={detection}
                showSuccess={showMatch}
              />
              <MatchAnimation show={showMatch} score={lastMatchScore} combo={metrics.combo} />
            </>
          )}
        </div>
      </main>

      {/* ── Pause modal ─────────────────────────────────────────────────────── */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={resumeGame}
          onRestart={handlePlayAgain}
          onExit={onExit}
        />
      )}

      {/* ── Game-over modal ─────────────────────────────────────────────────── */}
      {gameState === 'GAME_OVER' && (
        <ResultModal
          metrics={metrics}
          onPlayAgain={handlePlayAgain}
          onExit={onExit}
        />
      )}
    </div>
  );
};

// ── Tiny helper ───────────────────────────────────────────────────────────────
const StatusRow: React.FC<{ ready: boolean; readyLabel: string; notReadyLabel: string }> = ({
  ready, readyLabel, notReadyLabel,
}) => (
  <p className={`text-xs font-semibold ${ready ? 'text-green-400' : 'text-white/30'}`}>
    {ready ? `✓ ${readyLabel}` : `○ ${notReadyLabel}`}
  </p>
);
