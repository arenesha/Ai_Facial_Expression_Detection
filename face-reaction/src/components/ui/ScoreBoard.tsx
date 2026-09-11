import React from 'react';
import { CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  matched: number;
  missed: number;
  gameTimeLeftMs: number;
  targetTimeLeftMs: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score, matched, missed, gameTimeLeftMs,
}) => {
  const totalSec = Math.floor(gameTimeLeftMs / 1000);
  const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const secs = (totalSec % 60).toString().padStart(2, '0');
  const isLow     = totalSec <= 10;
  const isVeryLow = totalSec <= 5;

  return (
    <div className="flex gap-3">

      {/* ── SCORE ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3 px-4"
        style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Trophy size={13} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 2 }} />
        <span className="text-2xl font-black text-white tabular-nums leading-none">{score}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Score</span>
      </div>

      {/* ── MATCHED ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3 px-4"
        style={{
          background: matched > 0
            ? 'linear-gradient(135deg,rgba(34,197,94,0.15) 0%,rgba(34,197,94,0.04) 100%)'
            : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)',
          border: matched > 0 ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.07)',
        }}>
        <CheckCircle size={13} style={{ color: matched > 0 ? '#22c55e' : 'rgba(255,255,255,0.25)', marginBottom: 2 }} />
        <span className="text-2xl font-black tabular-nums leading-none"
          style={{ color: matched > 0 ? '#22c55e' : '#ffffff' }}>{matched}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Matched</span>
      </div>

      {/* ── MISSED ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3 px-4"
        style={{
          background: missed > 0
            ? 'linear-gradient(135deg,rgba(239,68,68,0.12) 0%,rgba(239,68,68,0.03) 100%)'
            : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)',
          border: missed > 0 ? '1px solid rgba(239,68,68,0.28)' : '1px solid rgba(255,255,255,0.07)',
        }}>
        <XCircle size={13} style={{ color: missed > 0 ? '#ef4444' : 'rgba(255,255,255,0.25)', marginBottom: 2 }} />
        <span className="text-2xl font-black tabular-nums leading-none"
          style={{ color: missed > 0 ? '#ef4444' : '#ffffff' }}>{missed}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Missed</span>
      </div>

      {/* ── TIMER ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3 px-4 transition-all duration-300"
        style={{
          background: isVeryLow
            ? 'linear-gradient(135deg,rgba(239,68,68,0.25) 0%,rgba(239,68,68,0.08) 100%)'
            : isLow
              ? 'linear-gradient(135deg,rgba(239,68,68,0.15) 0%,rgba(239,68,68,0.04) 100%)'
              : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)',
          border: isVeryLow
            ? '1px solid rgba(239,68,68,0.55)'
            : isLow
              ? '1px solid rgba(239,68,68,0.35)'
              : '1px solid rgba(255,255,255,0.07)',
          boxShadow: isVeryLow ? '0 0 20px rgba(239,68,68,0.2)' : 'none',
          animation: isVeryLow ? 'pulse 1s ease-in-out infinite' : 'none',
        }}>
        <Clock size={13} style={{ color: isLow ? '#ef4444' : 'rgba(255,255,255,0.25)', marginBottom: 2 }} />
        <span className="text-2xl font-black tabular-nums leading-none font-mono"
          style={{ color: isVeryLow ? '#ef4444' : isLow ? '#f97316' : '#ffffff' }}>
          {mins}:{secs}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Time</span>
      </div>

    </div>
  );
};
