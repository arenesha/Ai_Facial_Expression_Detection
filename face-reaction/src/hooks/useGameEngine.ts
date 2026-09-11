import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Target, GameMetrics } from '../types/game';
import { generateInitialQueue, generateTarget } from '../utils/targetGenerator';
import { calculateScore } from '../utils/scoreCalculator';

export const DEFAULT_TARGET_DURATION_MS = 5_000; // 5 seconds per target expression
export const TOTAL_GAME_DURATION_MS = 120_000; // 2 minutes (120 seconds) continuous session

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');

  // Overall Game Session Timer (counts UP to 120,000ms / 2 minutes)
  const [overallGameTimeMs, setOverallGameTimeMs] = useState(0);

  // Expression Timer (counts DOWN from 5000ms: 5, 4, 3, 2, 1, 0)
  const [targetTimeLeft, setTargetTimeLeft] = useState(DEFAULT_TARGET_DURATION_MS);

  const [targetQueue, setTargetQueue] = useState<Target[]>([]);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);

  const [metrics, setMetrics] = useState<GameMetrics>({
    score: 0,
    combo: 0,
    bestCombo: 0,
    matched: 0,
    missed: 0,
    totalReactionTimeMs: 0,
  });

  // ── Stable Refs for Animation Frame Loop ──────────────────────────────────
  const gameStateRef          = useRef<GameState>('IDLE');
  const overallGameTimeRef    = useRef(0);
  const targetTimeLeftRef     = useRef(DEFAULT_TARGET_DURATION_MS);
  const currentTargetRef      = useRef<Target | null>(null);
  const lastTickRef           = useRef<number | null>(null);
  const rafRef                = useRef<number | null>(null);
  const targetStartRef        = useRef<number>(0);
  const metricsRef            = useRef(metrics);

  // Sync refs with state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTickRef.current = null;
  }, []);

  // ── Advance to next target immediately (Continuous without round limit) ────
  const advanceTarget = useCallback(() => {
    setTargetQueue(prevQueue => {
      const newQueue = [...prevQueue];
      const next = newQueue.shift();

      const history = currentTargetRef.current ? [currentTargetRef.current.expression] : [];
      newQueue.push(generateTarget(history));

      currentTargetRef.current = next ?? null;
      setCurrentTarget(next ?? null);
      return newQueue;
    });

    // Reset expression timer to 5 seconds immediately
    targetTimeLeftRef.current = DEFAULT_TARGET_DURATION_MS;
    setTargetTimeLeft(DEFAULT_TARGET_DURATION_MS);
    targetStartRef.current = performance.now();
  }, []);

  // ── Handle Miss (5-Second Target Timeout Expired) ─────────────────────────
  const handleMiss = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;

    setMetrics(prev => {
      const newMissed = prev.missed + 1;
      return {
        ...prev,
        combo: 0,
        missed: newMissed,
      };
    });

    advanceTarget();
  }, [advanceTarget]);

  // ── Handle Match (Immediate Success) ──────────────────────────────────────
  const handleMatch = useCallback((reactionTimeMs: number): number => {
    if (gameStateRef.current !== 'PLAYING') return 0;

    const clampedReaction = Math.max(0, Math.min(reactionTimeMs, DEFAULT_TARGET_DURATION_MS));
    const { pointsAdded } = calculateScore(clampedReaction, metricsRef.current.combo);

    setMetrics(prev => {
      const newCombo = prev.combo + 1;
      const newMatched = prev.matched + 1;
      return {
        ...prev,
        score: prev.score + pointsAdded,
        combo: newCombo,
        bestCombo: Math.max(prev.bestCombo, newCombo),
        matched: newMatched,
        totalReactionTimeMs: prev.totalReactionTimeMs + clampedReaction,
      };
    });

    // Immediately advance to next expression without waiting
    advanceTarget();

    return pointsAdded;
  }, [advanceTarget]);

  // ── High Precision Timestamp Game Loop (2-Minute Continuous Session) ──────
  const gameLoop = useCallback((ts: number) => {
    if (gameStateRef.current !== 'PLAYING') return;

    if (lastTickRef.current === null) lastTickRef.current = ts;
    const delta = ts - lastTickRef.current;
    lastTickRef.current = ts;

    // 1. Overall Game Session Timer (counts up to 2 minutes / 120 seconds)
    overallGameTimeRef.current += delta;
    if (overallGameTimeRef.current >= TOTAL_GAME_DURATION_MS) {
      overallGameTimeRef.current = TOTAL_GAME_DURATION_MS;
      setOverallGameTimeMs(TOTAL_GAME_DURATION_MS);
      stopLoop();
      gameStateRef.current = 'GAME_OVER';
      setGameState('GAME_OVER');
      return;
    }
    setOverallGameTimeMs(overallGameTimeRef.current);

    // 2. Expression Target Timer (counts down from 5,000ms)
    const newTargetTime = targetTimeLeftRef.current - delta;
    if (newTargetTime <= 0) {
      // 5-second timeout reached: trigger miss & advance immediately
      targetTimeLeftRef.current = DEFAULT_TARGET_DURATION_MS;
      setTargetTimeLeft(DEFAULT_TARGET_DURATION_MS);
      handleMiss();
    } else {
      targetTimeLeftRef.current = newTargetTime;
      setTargetTimeLeft(newTargetTime);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [handleMiss, stopLoop]);

  // ── Begin New Game Session ────────────────────────────────────────────────
  const beginPlaying = useCallback(() => {
    stopLoop();

    const initialQueue = generateInitialQueue(5);
    const firstTarget = initialQueue.shift()!;
    currentTargetRef.current = firstTarget;

    setCurrentTarget(firstTarget);
    setTargetQueue(initialQueue);

    // Reset overall game timer to 0
    overallGameTimeRef.current = 0;
    setOverallGameTimeMs(0);

    // Reset expression timer to 5s
    targetTimeLeftRef.current = DEFAULT_TARGET_DURATION_MS;
    setTargetTimeLeft(DEFAULT_TARGET_DURATION_MS);

    setMetrics({ score: 0, combo: 0, bestCombo: 0, matched: 0, missed: 0, totalReactionTimeMs: 0 });

    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
    lastTickRef.current = null;
    targetStartRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [stopLoop, gameLoop]);

  // ── Pause Game ────────────────────────────────────────────────────────────
  const pauseGame = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;
    stopLoop();
    gameStateRef.current = 'PAUSED';
    setGameState('PAUSED');
  }, [stopLoop]);

  // ── Resume Game ───────────────────────────────────────────────────────────
  const resumeGame = useCallback(() => {
    if (gameStateRef.current !== 'PAUSED') return;
    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
    lastTickRef.current = null;
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Cleanup on unmount
  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    gameState,
    setGameState,
    overallGameTimeMs,
    targetTimeLeft,
    targetQueue,
    currentTarget,
    metrics,
    beginPlaying,
    pauseGame,
    resumeGame,
    handleMatch,
    advanceTarget,
    targetDurationMs: DEFAULT_TARGET_DURATION_MS,
    targetStartRef,
  };
};
