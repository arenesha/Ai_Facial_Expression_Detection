import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ScoreBoard } from '@/components/ScoreBoard';
import { CameraPanel } from '@/components/CameraPanel';
import { ComputerPanel } from '@/components/ComputerPanel';
import { Countdown } from '@/components/Countdown';
import { ResultCard } from '@/components/ResultCard';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useSound } from '@/hooks/useSound';
import type { GameMode, Move, FaceDetectionResult, RoundResult, RoundRecord } from '@/types/game';
import { EXPRESSION_TO_MOVE } from '@/types/game';
import {
  determineWinner,
  getComputerMove,
  calcPoints,
  isGameOver,
  getMaxRounds,
  getTimeLimit,
} from '@/utils/gameLogic';
import { updateStats, loadStats } from '@/utils/persistence';

type GamePhase = 'countdown' | 'detecting' | 'thinking' | 'result';
type ComputerPhase = 'waiting' | 'thinking' | 'revealed';

/**
 * Computer selection is idempotent:
 *   1. Player move is locked once after DETECTION_WINDOW (3 s).
 *   2. Computer move is chosen ONCE, immediately, and stored in a ref.
 *   3. The ComputerPanel shows 'thinking' + cycling emoji for THINKING_DISPLAY_MS.
 *   4. After that timer fires, computerPhase flips to 'revealed' — interval stops in ComputerPanel.
 *   5. Result is calculated from the SAME stored compMove ref.
 *
 * All timers are stored in refs and cleared on:
 *   - phase change (effect cleanup)
 *   - Restart (clearAllTimers())
 *   - component unmount
 */
export const Game: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mode: GameMode = (location.state as { mode?: GameMode })?.mode ?? 'classic';
  const { play } = useSound();

  const maxRounds = getMaxRounds(mode);
  const timeLimit = getTimeLimit(mode);

  // ── Game state ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [computerPhase, setComputerPhase] = useState<ComputerPhase>('waiting');
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit ?? 999);
  const [rounds, setRounds] = useState<RoundRecord[]>([]);

  const [lockedPlayerMove, setLockedPlayerMove] = useState<Move | null>(null);
  const [computerMove, setComputerMove] = useState<Move | null>(null);    // display only
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [roundPoints, setRoundPoints] = useState(0);

  const [detection, setDetection] = useState<FaceDetectionResult>({
    detected: false, expression: 'unknown', confidence: 0, smileRatio: 0, mouthOpenRatio: 0,
  });

  // ── Refs — never stale inside timers ────────────────────────────────────────
  const detectionRef   = useRef<FaceDetectionResult>(detection);
  const winStreakRef   = useRef(winStreak);
  const consecutiveLossesRef = useRef(consecutiveLosses);
  const roundRef       = useRef(round);
  const playerScoreRef = useRef(playerScore);
  const computerScoreRef = useRef(computerScore);
  const bestStreakRef  = useRef(bestStreak);
  const timeLeftRef    = useRef(timeLeft);

  // Keep refs in sync every render
  winStreakRef.current          = winStreak;
  consecutiveLossesRef.current  = consecutiveLosses;
  roundRef.current              = round;
  playerScoreRef.current        = playerScore;
  computerScoreRef.current      = computerScore;
  bestStreakRef.current         = bestStreak;
  timeLeftRef.current           = timeLeft;

  // Single-execution guard: stores the computer's chosen move for the round.
  // Written ONCE per detecting phase, read during resolving.
  const lockedCompMoveRef = useRef<Move | null>(null);

  // All active timer/interval IDs — cleared on restart and unmount
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach(id => clearTimeout(id));
    timerRefs.current = [];
  }, []);

  const addTimer = (id: ReturnType<typeof setTimeout>) => {
    timerRefs.current.push(id);
  };

  // ── Camera ──────────────────────────────────────────────────────────────────
  const onResult = useCallback((r: FaceDetectionResult) => {
    detectionRef.current = r;
    setDetection({ ...r });
  }, []);

  const { videoRef, canvasRef, cameraReady, cameraError, requestCamera } = useFaceDetection({
    enabled: true,
    onResult,
  });

  // ── Time Attack countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'timeattack' || phase !== 'detecting') return;
    if (timeLeft <= 0) { handleGameOver(); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, timeLeft]);

  // ── Countdown complete ───────────────────────────────────────────────────────
  const handleCountdownComplete = useCallback(() => {
    lockedCompMoveRef.current = null; // reset guard for new round
    setComputerPhase('thinking');
    setPhase('detecting');
  }, []);

  // ── MAIN ROUND LIFECYCLE ─────────────────────────────────────────────────────
  //
  //  detecting phase:
  //    t=0          → start listening to camera
  //    t=3000ms     → lock player move; choose computer move ONCE
  //                   setPhase('thinking') — shows cycling emoji
  //    t=3000+7000ms→ flip computerPhase to 'revealed' — carousel stops in ComputerPanel
  //                   resolve result, update scores, setPhase('result')
  //
  useEffect(() => {
    if (phase !== 'detecting') return;

    const DETECTION_WINDOW  = 3000;   // ms — how long the user has to show their face
    const THINKING_DISPLAY  = 7000;   // ms — how long the cycling emoji is visible

    // Timer 1: lock player move + choose computer move
    const t1 = setTimeout(() => {
      // Guard: only select computer move once per round
      if (lockedCompMoveRef.current !== null) return;

      const current = detectionRef.current;
      let playerMove: Move = 'rock';
      if (current.detected && current.expression !== 'unknown') {
        playerMove = EXPRESSION_TO_MOVE[
          current.expression as Exclude<typeof current.expression, 'unknown'>
        ];
      }

      // ONE computer selection — stored in ref as source of truth
      const compMove = getComputerMove();
      lockedCompMoveRef.current = compMove;

      setLockedPlayerMove(playerMove);
      setComputerMove(compMove);     // synced to state for display
      setPhase('thinking');          // triggers cycling emoji in ComputerPanel

      // Timer 2: after carousel, reveal result
      const t2 = setTimeout(() => {
        const finalComp = lockedCompMoveRef.current!; // guaranteed not null here

        // Flip computer panel to revealed → interval stops inside ComputerPanel
        setComputerPhase('revealed');
        play('reveal');

        // Calculate result using the ONE stored move
        const result     = determineWinner(playerMove, finalComp);
        const streak     = winStreakRef.current;
        const newStreak  = result === 'win' ? streak + 1 : 0;
        const points     = calcPoints(result, newStreak);

        setRoundResult(result);
        setRoundPoints(points);

        if (result === 'win') {
          setPlayerScore(s => s + points);
          setWinStreak(newStreak);
          setBestStreak(b => Math.max(b, newStreak));
          setConsecutiveLosses(0);
        } else if (result === 'lose') {
          setComputerScore(s => s + 10);
          setWinStreak(0);
          setConsecutiveLosses(c => c + 1);
        } else {
          setWinStreak(0);
        }

        const newRecord: RoundRecord = {
          round: roundRef.current,
          playerMove,
          computerMove: finalComp,
          result,
          expression: current.expression,
          confidence: current.confidence,
        };
        setRounds(r => [...r, newRecord]);
        play(result);
        setPhase('result');
      }, THINKING_DISPLAY);

      addTimer(t2);
    }, DETECTION_WINDOW);

    addTimer(t1);
    return () => clearTimeout(t1); // t2 is tracked separately; cleared via clearAllTimers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Next round ───────────────────────────────────────────────────────────────
  const handleNextRound = () => {
    const nextRound = round + 1;
    if (isGameOver(nextRound, maxRounds, consecutiveLosses, mode, timeLeft)) {
      handleGameOver();
      return;
    }
    setRound(nextRound);
    setLockedPlayerMove(null);
    setComputerMove(null);
    setRoundResult(null);
    setComputerPhase('waiting');
    lockedCompMoveRef.current = null;
    setPhase('countdown');
  };

  // ── Game over ────────────────────────────────────────────────────────────────
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    const stats = loadStats();
    setRounds(currentRounds => {
      const wins   = currentRounds.filter(r => r.result === 'win').length;
      const losses = currentRounds.filter(r => r.result === 'lose').length;
      const draws  = currentRounds.filter(r => r.result === 'draw').length;
      updateStats(stats, wins, losses, draws, bestStreakRef.current, playerScoreRef.current);
      navigate('/result', {
        state: {
          mode,
          rounds: currentRounds,
          playerScore: playerScoreRef.current,
          computerScore: computerScoreRef.current,
          bestStreak: bestStreakRef.current,
          timeLeft: timeLeftRef.current,
        },
      });
      return currentRounds;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAllTimers, mode, navigate]);

  // ── Restart ───────────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    clearAllTimers();
    lockedCompMoveRef.current = null;
    navigate('/');
  }, [clearAllTimers, navigate]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const roundLabel =
    mode === 'classic'
      ? `Round ${String(round).padStart(2, '0')} / ${maxRounds}`
      : mode === 'timeattack'
      ? `⏱ ${timeLeft}s`
      : `Round ${round}`;

  const getStatusMessage = (): string | null => {
    if (phase === 'detecting') {
      if (cameraError) return '⚠ Camera unavailable — defaulting to Rock. Click Enable Camera to fix.';
      if (!cameraReady)      return 'Starting camera...';
      if (!detection.detected) return '👤 No face detected — position your face in the camera';
      return `Make your expression now!  Detected: ${detection.expression}`;
    }
    if (phase === 'thinking') return 'Computer is deciding...';
    return null;
  };

  const statusMsg = getStatusMessage();

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col">
      <Header roundLabel={roundLabel} onRestart={handleRestart} />

      <main className="flex-1 flex flex-col p-4 gap-4 max-w-5xl mx-auto w-full">
        <ScoreBoard playerScore={playerScore} computerScore={computerScore} winStreak={winStreak} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            detection={detection}
            cameraError={cameraError}
            onRequestCamera={requestCamera}
            lockedMove={lockedPlayerMove}
          />
          <ComputerPanel phase={computerPhase} />
        </div>

        {statusMsg && (
          <div
            className={`rounded-xl px-4 py-3 text-center font-semibold text-sm animate-pulse2 ${
              cameraError
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-accent/10 border border-accent/30 text-accent'
            }`}
          >
            {statusMsg}
          </div>
        )}
      </main>

      {phase === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}

      {phase === 'result' && roundResult && lockedPlayerMove && computerMove && (
        <ResultCard
          result={roundResult}
          playerMove={lockedPlayerMove}
          computerMove={computerMove}
          points={roundPoints}
          onNext={handleNextRound}
        />
      )}
    </div>
  );
};
