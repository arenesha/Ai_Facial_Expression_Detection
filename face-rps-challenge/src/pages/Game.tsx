import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NeonHeader } from '@/components/NeonHeader';
import { CameraPanel } from '@/components/CameraPanel';
import { TargetPanel } from '@/components/TargetPanel';
import { ExpressionGuide } from '@/components/ExpressionGuide';
import { AIStatusPanel } from '@/components/AIStatusPanel';
import { FeatureBadges } from '@/components/FeatureBadges';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useSound } from '@/hooks/useSound';
import type { FaceDetectionResult, TargetExpression, Expression } from '@/types/game';
import { TARGET_EXPRESSIONS, ALL_TARGET_EXPRESSIONS } from '@/types/game';
import { CyberFrame } from '@/components/CyberFrame';

type Phase = 'idle' | 'countdown' | 'detecting' | 'gameover';

const MAX_ROUNDS = 10;
const ROUND_TIME = 5;

function getRandomTarget(exclude?: TargetExpression | null): TargetExpression {
  const pool = exclude
    ? ALL_TARGET_EXPRESSIONS.filter((e) => e !== exclude)
    : ALL_TARGET_EXPRESSIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function checkMatch(target: TargetExpression, det: FaceDetectionResult): boolean {
  if (!det.detected) return false;
  const { expression, smileRatio, mouthOpenRatio, blendshapes } = det;
  
  const bs = blendshapes || {};
  const smileScore = Math.max(
    smileRatio,
    Math.max(bs['mouthSmileLeft'] ?? 0, bs['mouthSmileRight'] ?? 0)
  );
  const openScore = Math.max(
    mouthOpenRatio * 8,
    bs['jawOpen'] ?? 0
  );
  const frownScore = Math.max(
    bs['mouthFrownLeft'] ?? 0,
    bs['mouthFrownRight'] ?? 0,
    bs['mouthPucker'] ?? 0
  );
  const browDownScore = Math.max(
    bs['browDownLeft'] ?? 0,
    bs['browDownRight'] ?? 0
  );
  const blinkScore = Math.max(
    bs['eyeBlinkLeft'] ?? 0,
    bs['eyeBlinkRight'] ?? 0
  );

  switch (target) {
    case 'happy':
      return expression === 'smile' || smileRatio >= 0.35 || smileScore >= 0.22;

    case 'surprised':
      return expression === 'open' || mouthOpenRatio >= 0.035 || openScore >= 0.22;

    case 'silly':
      return (
        blinkScore >= 0.30 ||
        (smileRatio >= 0.33 && mouthOpenRatio >= 0.025) ||
        (smileScore >= 0.2 && openScore >= 0.15) ||
        (expression === 'open' && smileRatio >= 0.32)
      );

    case 'sad':
      return frownScore >= 0.15 || (smileRatio < 0.34 && mouthOpenRatio < 0.025);

    case 'angry':
      return browDownScore >= 0.18 || (frownScore >= 0.12 && smileRatio < 0.33);

    case 'neutral':
      return (
        smileRatio < 0.35 &&
        mouthOpenRatio < 0.03 &&
        smileScore < 0.18 &&
        openScore < 0.15
      );

    default:
      return false;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const Game: React.FC = () => {
  const { play } = useSound();

  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [target, setTarget] = useState<TargetExpression | null>(null);
  const [countdownNum, setCountdownNum] = useState(3);
  
  // Game metrics & 1-minute timer
  const [matchedCount, setMatchedCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(60); // 1-minute total timer
  const [isPaused, setIsPaused] = useState(false);
  const [matchedFlash, setMatchedFlash] = useState(false);
  const [matchBanner, setMatchBanner] = useState(false);
  const [missedBanner, setMissedBanner] = useState(false);
  const [lastMatchPoints, setLastMatchPoints] = useState(100);

  const [detection, setDetection] = useState<FaceDetectionResult>({
    detected: false,
    expression: 'unknown',
    confidence: 0,
    smileRatio: 0,
    mouthOpenRatio: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overallTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectionRef = useRef<FaceDetectionResult>(detection);
  const canMatchRef = useRef(true);

  const onResult = useCallback((r: FaceDetectionResult) => {
    detectionRef.current = r;
    setDetection({ ...r });
  }, []);

  const { videoRef, canvasRef, cameraReady, cameraError, requestCamera } = useFaceDetection({
    enabled: true,
    onResult,
  });

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    timerRef.current = null;
    overallTimerRef.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startGame = useCallback(() => {
    clearTimers();
    setScore(0);
    setStreak(0);
    setRound(0);
    setMatchedCount(0);
    setMissedCount(0);
    setTarget(null);
    setCountdownNum(3);
    setGameTime(0);
    setTotalTimeLeft(60);
    setIsPaused(false);
    setMatchBanner(false);
    setMissedBanner(false);
    canMatchRef.current = false;
    setPhase('countdown');
  }, [clearTimers]);

  const startRound = useCallback(() => {
    setRound((r) => {
      const next = r + 1;
      if (next > MAX_ROUNDS) {
        setPhase('gameover');
        clearTimers();
        return r;
      }
      return next;
    });
    const newTarget = getRandomTarget(target);
    setTarget(newTarget);
    setTimeLeft(ROUND_TIME);
    setPhase('detecting');

    // Anti-bounce cooldown
    canMatchRef.current = false;
    setTimeout(() => {
      canMatchRef.current = true;
    }, 400);
  }, [target, clearTimers]);

  // Countdown Effect
  useEffect(() => {
    if (phase !== 'countdown') return;
    setCountdownNum(3);
    let count = 3;
    const id = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        play('countdown');
      } else {
        clearInterval(id);
        play('go');
        startRound();
      }
    }, 800);
    play('countdown');
    return () => clearInterval(id);
  }, [phase, play, startRound]);

  // Expression Timer (5s per round -> advance after 5s)
  useEffect(() => {
    if (phase !== 'detecting' || isPaused || matchBanner || missedBanner) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Missed expression timeout after 5 seconds!
          setMissedCount((m) => m + 1);
          setStreak(0);
          play('lose');
          setMissedBanner(true);
          canMatchRef.current = false;

          // Show MISSED banner for 800ms before changing to next emoji
          setTimeout(() => {
            setMissedBanner(false);
            startRound();
          }, 800);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, matchBanner, missedBanner, play, startRound]);

  // Overall 1-Minute Session Timer (60s countdown)
  useEffect(() => {
    if (phase !== 'detecting' || isPaused) {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
      return;
    }

    overallTimerRef.current = setInterval(() => {
      setGameTime((time) => time + 1);
      setTotalTimeLeft((tl) => {
        if (tl <= 1) {
          setPhase('gameover');
          clearTimers();
          return 0;
        }
        return tl - 1;
      });
    }, 1000);

    return () => {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    };
  }, [phase, isPaused, clearTimers]);

  // Match Behavior (Hold for 1 second on match!)
  useEffect(() => {
    if (phase !== 'detecting' || !target || isPaused || !canMatchRef.current || matchBanner || missedBanner) return;

    const current = detectionRef.current;
    if (current.detected) {
      if (checkMatch(target, current)) {
        canMatchRef.current = false;
        play('win');
        
        const timeBonus = timeLeft * 20;
        const streakBonus = streak * 50;
        const points = 100 + timeBonus + streakBonus;
        
        setScore((s) => s + points);
        setStreak((s) => s + 1);
        setMatchedCount((m) => m + 1);
        setLastMatchPoints(points);
        
        // Show celebration & MATCHED for 1 full second before changing emoji
        setMatchedFlash(true);
        setMatchBanner(true);

        setTimeout(() => {
          setMatchedFlash(false);
          setMatchBanner(false);
          startRound();
        }, 1000); // 1000ms = 1 full second as requested!
      }
    }
  }, [detection, phase, target, isPaused, play, streak, timeLeft, matchBanner, missedBanner, startRound]);

  const handleStartClick = () => {
    if (phase === 'idle' || phase === 'gameover') {
      startGame();
    }
  };

  const handlePauseToggle = () => {
    setIsPaused((p) => !p);
  };

  const isGameOver = phase === 'gameover';

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-[#030612]">
      {/* Full-bleed Space Cosmic Galaxy Background */}
      <div className="space-bg pointer-events-none" />

      {/* Header */}
      <NeonHeader
        score={score}
        streak={streak}
        round={round}
        maxRounds={MAX_ROUNDS}
        roundTimeLeft={phase === 'idle' ? 5 : timeLeft}
        totalTimeLeft={phase === 'idle' ? 60 : totalTimeLeft}
        isPlaying={phase === 'detecting' && !isPaused}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pb-16 gap-3 max-w-[1600px] mx-auto w-full min-h-0 relative z-[10] mt-1">
        {/* 3-Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 min-h-0 items-stretch">
          
          {/* Left Column */}
          <div className="hidden lg:flex flex-col min-h-0">
            <TargetPanel
              target={target}
              isMatched={matchedFlash || matchBanner}
              roundTimeLeft={phase === 'detecting' ? timeLeft : undefined}
            />
          </div>

          {/* Center Column */}
          <div className="flex flex-col justify-between gap-3 min-h-0 relative pb-2">
            <div className="flex-1 min-h-[300px] max-h-[460px] relative">
              <CameraPanel
                videoRef={videoRef}
                canvasRef={canvasRef}
                detection={detection}
                cameraError={cameraError}
                onRequestCamera={requestCamera}
                matchBanner={matchBanner}
                missedBanner={missedBanner}
                lastMatchPoints={lastMatchPoints}
              />
            </div>
            
            {/* Controls Area below camera */}
            <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
              {phase === 'idle' || isGameOver ? (
                <button
                  onClick={handleStartClick}
                  className="w-[380px] sm:w-[440px] h-[46px] flex items-center justify-center gap-3 bg-gradient-to-r from-[#00f0ff] via-[#b845ff] to-[#ff00c8] text-black font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(0,240,255,0.7),0_0_25px_rgba(255,0,200,0.7)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer select-none"
                  style={{ clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)' }}
                >
                  <span className="text-xl leading-none">📷</span>
                  <span className="text-[13px] sm:text-sm font-black tracking-widest text-black">
                    {isGameOver ? 'PLAY AGAIN' : 'START FACE RECOGNITION'}
                  </span>
                </button>
              ) : phase === 'countdown' ? (
                <div className="h-[46px] flex items-center justify-center">
                  <div className="text-5xl font-black neon-text-cyan animate-countDown" key={countdownNum}>
                    {countdownNum > 0 ? countdownNum : 'GO!'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 h-[46px]">
                  {/* Live Matched Count */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#00ff88]/60 bg-[#02150c]/90 shadow-[0_0_12px_rgba(0,255,136,0.3)]">
                    <span className="text-[10px] font-black text-white/70 uppercase">✔ Matched:</span>
                    <span className="text-sm font-black font-mono text-[#00ff88]">{matchedCount}</span>
                  </div>

                  {/* Live Missed Count */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-500/60 bg-red-950/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                    <span className="text-[10px] font-black text-white/70 uppercase">✖ Missed:</span>
                    <span className="text-sm font-black font-mono text-red-400">{missedCount}</span>
                  </div>

                  {/* 1-Minute Session Timer */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-neon-cyan/60 bg-black/70 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                    <span className="text-[10px] font-black text-white/70 uppercase">⏱ Session:</span>
                    <span className="text-sm font-black font-mono neon-text-cyan">{formatTime(totalTimeLeft)}</span>
                  </div>

                  {/* Pause / Resume Button */}
                  <button 
                    onClick={handlePauseToggle} 
                    className="flex items-center justify-center gap-1 px-4 py-1.5 border border-neon-magenta text-neon-magenta text-xs font-bold uppercase tracking-widest hover:bg-neon-magenta/10 transition-colors"
                    style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                  >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                </div>
              )}

              {/* Feature Badges below controls */}
              <FeatureBadges />
            </div>

            {/* Game Over Modal */}
            {isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center z-50 animate-fadeUp">
                <div className="w-[350px] h-[450px]">
                  <CyberFrame cut="all" color="cyan" className="h-full">
                    <div className="flex flex-col items-center justify-center p-8 h-full text-center bg-[#020718]/90 backdrop-blur-lg">
                      <div className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">🏆</div>
                      <h2 className="text-2xl font-black neon-text-cyan uppercase tracking-widest mb-1">Game Complete</h2>
                      <p className="text-[10px] text-white/50 tracking-[0.3em] uppercase mb-8">Final Results</p>
                      
                      <div className="w-full border border-white/10 rounded-lg bg-black/40 p-4 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                        <p className="text-[10px] text-neon-cyan tracking-widest uppercase mb-1">Final Score</p>
                        <p className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{score}</p>
                      </div>

                      <div className="w-full space-y-2.5 mb-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/50 font-bold tracking-widest uppercase flex items-center gap-2"><span className="text-neon-cyan">⏱</span> Total Time</span>
                          <span className="text-neon-cyan font-black text-lg">{formatTime(gameTime)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/50 font-bold tracking-widest uppercase flex items-center gap-2"><span className="text-neon-cyan">⚡</span> Best Combo</span>
                          <span className="text-neon-cyan font-black text-lg">x{streak}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/50 font-bold tracking-widest uppercase flex items-center gap-2"><span className="text-[#00ff88]">✔</span> Matched</span>
                          <span className="text-[#00ff88] font-black text-lg">{matchedCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/50 font-bold tracking-widest uppercase flex items-center gap-2"><span className="text-red-400">✖</span> Missed</span>
                          <span className="text-red-400 font-black text-lg">{missedCount}</span>
                        </div>
                      </div>

                      <button onClick={handleStartClick} className="w-full btn-cyber justify-center py-3 text-sm">
                        <span>PLAY AGAIN</span>
                      </button>
                    </div>
                  </CyberFrame>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="hidden lg:flex flex-col min-h-0 gap-4">
            <ExpressionGuide currentTarget={target} matchedExpression={matchedFlash ? target : null} />
            <AIStatusPanel isDetecting={phase === 'detecting' && !isPaused} faceDetected={detection.detected} isMatched={matchedFlash} />
          </div>
        </div>
      </main>

      {/* Decorative Bottom-Left Corner Text */}
      <div className="absolute bottom-5 left-8 z-10 pointer-events-none select-none">
        <p className="text-[11px] font-black tracking-[0.25em] uppercase leading-[1.3] text-left">
          <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">YOUR</span><br />
          <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">EXPRESSIONS</span><br />
          <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">POWER</span><br />
          <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">THE GAME</span>
        </p>
      </div>

      {/* Decorative Bottom-Right Corner: THINK EXPRESS PLAY and MORE GAMES */}
      <div className="absolute bottom-5 right-8 z-30 flex items-center gap-4">
        <div className="text-right pointer-events-none select-none hidden sm:block">
          <p className="text-[11px] font-black tracking-[0.25em] uppercase leading-[1.3]">
            <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">THINK</span><br />
            <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">EXPRESS</span><br />
            <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">PLAY</span>
          </p>
        </div>
        <a
          href="https://game.arenesha.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hud-pill-btn hub-pill-btn flex items-center gap-1.5 px-3 py-1.5 border border-neon-cyan/70 bg-[#020718]/90 hover:bg-neon-cyan/20 transition-all text-neon-cyan text-[11px] font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105"
          title="Explore More AI Games on Arenesha"
        >
          <span className="hud-btn-icon text-sm leading-none">🌐</span>
          <span>MORE GAMES</span>
        </a>
      </div>
    </div>
  );
};
