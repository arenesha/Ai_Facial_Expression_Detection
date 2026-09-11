import React from 'react';
import { CyberFrame } from './CyberFrame';
import type { TargetExpression } from '@/types/game';
import { TARGET_EXPRESSIONS, ALL_TARGET_EXPRESSIONS } from '@/types/game';

interface ExpressionGuideProps {
  currentTarget?: TargetExpression | null;
  matchedExpression?: TargetExpression | null;
}

export const ExpressionGuide: React.FC<ExpressionGuideProps> = ({
  currentTarget,
  matchedExpression,
}) => {
  const activeExpr = currentTarget || 'happy';

  return (
    <div className="flex-1 min-h-0 relative flex flex-col">
      <CyberFrame cut="all" color="cyan" className="h-full">
        <div className="p-4 h-full flex flex-col justify-between bg-[#020718]/45 backdrop-blur-md">
          {/* Title Tab */}
          <div className="text-center pt-1 pb-3">
            <div className="text-[11px] font-black tracking-[0.25em] text-neon-cyan uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
              EXPRESSION GUIDE
            </div>
          </div>

          {/* 3x2 Grid */}
          <div className="grid grid-cols-3 gap-2.5 my-auto">
            {ALL_TARGET_EXPRESSIONS.map((expr) => {
              const data = TARGET_EXPRESSIONS[expr];
              const isActive = activeExpr === expr;
              const isMatched = matchedExpression === expr;
              
              return (
                <div
                  key={expr}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md transition-all duration-200 ${
                    isActive
                      ? 'border-2 border-neon-cyan bg-cyan-950/50 shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-[1.02]'
                      : isMatched
                      ? 'border border-[#00ff88] bg-[#00ff88]/20 shadow-[0_0_12px_rgba(0,255,136,0.4)]'
                      : 'border border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <span className="text-3xl select-none leading-none mb-1.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {data.emoji}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      isActive ? 'neon-text-cyan' : isMatched ? 'text-[#00ff88]' : 'text-white/60'
                    }`}
                  >
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CyberFrame>
    </div>
  );
};
