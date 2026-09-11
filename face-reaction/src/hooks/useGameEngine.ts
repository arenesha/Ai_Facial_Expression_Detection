import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Target, GameMetrics } from '../types/game';
import { generateInitialQueue, generateTarget } from '../utils/targetGenerator';
import { calculateScore } from '../utils/scoreCalculator';

const GAME_DURATION_MS = 60_000;
export const DEFAULT_TARGET_DURATION_MS = 5_000; // 5 seconds per target

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');

  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION_MS);
  const [targetTimeLeft, setTargetTimeLeft] = useState(DEFAULT_TARGET_DURATION_MS);

  const [targetQueue, setTargetQueue] = useState<Target[]>([]);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);

  const [metrics, setMetrics] = useState<GameMetrics>({
    score: 0, combo: 0, bestCombo: 0, matched: 0, missed: 0, totalReactionTimeMs: 0,
  });

  // ── Refs (never stale inside rAF loop) ──────────────────────────────────────
  const gameStateRef       = useRef<GameState>('IDLE');
  const gameTimeLeftRef    = useRef(GAME_DURATION_MS);
  const targetTimeLeftRef  = useRef(DEFAULT_TARGET_DURATION_MS);
  const currentTargetRef   = useRef<Target | null>(null);
  const lastTickRef        = useRef<number | null>(null);
  const rafRef             = useRef<number | null>(null);
  const targetStartRef     = useRef<number>(0);
  const metricsRef         = useRef(metrics);
  const isTransitioningRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    lastTickRef.current = null;
  }, []);

  // ── Advance to next target ───────────────────────────────────────────────────
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

    targetTimeLeftRef.current = DEFAULT_TARGET_DURATION_MS;
    setTargetTimeLeft(DEFAULT_TARGET_DURATION_MS);
    targetStartRef.current = performance.now();
    isTransitioningRef.current = false;
  }, []);

  // ── Miss ─────────────────────────────────────────────────────────────────────
  const handleMiss = useCallback(() => {
    if (isTransitioningRef.current || gameStateRef.current !== 'PLAYING') return;
    setMetrics(prev => ({ ...prev, combo: 0, missed: prev.missed + 1 }));
    advanceTarget();
  }, [advanceTarget]);

  // ── Match ─────────────────────────────────────────────────────────────────────
  const handleMatch = useCallback((reactionTimeMs: number): number => {
    if (isTransitioningRef.current || gameStateRef.current !== 'PLAYING') return 0;
    isTransitioningRef.current = true;

    const clampedReaction = Math.max(0, Math.min(reactionTimeMs, DEFAULT_TARGET_DURATION_MS));
    const { pointsAdded } = calculateScore(clampedReaction, metricsRef.current.combo);

    setMetrics(prev => {
      const newCombo = prev.combo + 1;
      return {
        ...prev,
        score: prev.score + pointsAdded,
        combo: newCombo,
        bestCombo: Math.max(prev.bestCombo, newCombo),
        matched: prev.matched + 1,
        totalReactionTimeMs: prev.totalReactionTimeMs + clampedReaction,
      };
    });

    return pointsAdded;
  }, []);

  // ── Game loop ─────────────────────────────────────────────────────────────────
  const gameLoop = useCallback((ts: number) => {
    if (gameStateRef.current !== 'PLAYING') return;

    if (lastTickRef.current === null) lastTickRef.current = ts;
    const delta = ts - lastTickRef.current;
    lastTickRef.current = ts;

    // Overall timer (60s)
    const newGameTime = gameTimeLeftRef.current - delta;
    if (newGameTime <= 0) {
      gameTimeLeftRef.current = 0;
      setGameTimeLeft(0);
      gameStateRef.current = 'GAME_OVER';
      setGameState('GAME_OVER');
      stopLoop();
      return;
    }
    gameTimeLeftRef.current = newGameTime;
    setGameTimeLeft(newGameTime);

    // Target timer (5s per target) — only ticks down if not in match feedback transition
    if (!isTransitioningRef.current) {
      const newTargetTime = targetTimeLeftRef.current - delta;
      if (newTargetTime <= 0) {
        targetTimeLeftRef.current = DEFAULT_TARGET_DURATION_MS;
        setTargetTimeLeft(DEFAULT_TARGET_DURATION_MS);
        handleMiss();
      } else {
        targetTimeLeftRef.current = newTargetTime;
        setTargetTimeLeft(newTargetTime);
      }
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [stopLoop, handleMiss]);

  /**
   * beginPlaying — called directly after face is auto-detected.
   */
  const beginPlaying = useCallback(() => {
    stopLoop();

    const initialQueue = generateInitialQueue(5);
    const firstTarget = initialQueue.shift()!;
    currentTargetRef.current = firstTarget;

    setCurrentTarget(firstTarget);
    setTargetQueue(initialQueue);

    gameTimeLeftRef.current = GAME_DURATION_MS;
    setGameTimeLeft(GAME_DURATION_MS);

    targetTimeLeftRef.current = DEFAULT_TARGET_DURATION_MS;
    setTargetTimeLeft(DEFAULT_TARGET_DURATION_MS);

    setMetrics({ score: 0, combo: 0, bestCombo: 0, matched: 0, missed: 0, totalReactionTimeMs: 0 });

    isTransitioningRef.current = false;
    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
    lastTickRef.current = null;
    targetStartRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [stopLoop, gameLoop]);

  const pauseGame = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;
    stopLoop();
    gameStateRef.current = 'PAUSED';
    setGameState('PAUSED');
  }, [stopLoop]);

  const resumeGame = useCallback(() => {
    if (gameStateRef.current !== 'PAUSED') return;
    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
    lastTickRef.current = null;
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    gameState,
    setGameState,
    gameTimeLeft,
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
    isTransitioningRef,
  };
};
