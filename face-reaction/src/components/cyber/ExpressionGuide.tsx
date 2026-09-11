import React from 'react';
import { Expression } from '@/types/game';

interface ExpressionGuideProps {
  detectedExpression?: Expression | 'unknown';
  targetExpression?: Expression;
}

interface GuideItem {
  id: Expression;
  label: string;
  emoji: string;
}

const GUIDE_ITEMS: GuideItem[] = [
  { id: 'smile', label: 'HAPPY', emoji: '😊' },
  { id: 'wink', label: 'WINK', emoji: '😉' },
  { id: 'surprised', label: 'SURPRISED', emoji: '😮' },
  { id: 'angry', label: 'ANGRY', emoji: '😠' },
  { id: 'kiss', label: 'KISSY', emoji: '😗' },
  { id: 'sleepy', label: 'SLEEPY', emoji: '😴' },
];

export const ExpressionGuide: React.FC<ExpressionGuideProps> = ({
  targetExpression = 'smile',
}) => {
  return (
    <div className="relative w-full h-[185px] mx-auto p-[1.5px] clip-cyber-chamfer bg-[#4ce3ff]/80 shadow-[0_0_18px_rgba(76,227,255,0.3)]">
      <div className="relative clip-cyber-chamfer p-2.5 flex flex-col justify-between w-full h-full bg-[#05060f]/92 backdrop-blur-md overflow-hidden">
        {/* Viewfinder corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#4ce3ff]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#4ce3ff]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#4ce3ff]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#4ce3ff]" />

        {/* Header */}
        <div className="w-full text-center pb-1 flex items-center justify-center gap-1.5">
          <span className="text-[#00e5ff] text-xs">😊</span>
          <h3 className="font-orbitron font-black text-[11px] tracking-[0.2em] text-[#00e5ff] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,1)]">
            EXPRESSION GUIDE
          </h3>
        </div>

        {/* 2x3 Grid of 6 Easy Expressions */}
        <div className="grid grid-cols-3 gap-1.5 my-auto w-full px-0.5">
          {GUIDE_ITEMS.map((item) => {
            const isTarget = targetExpression === item.id;

            return (
              <div
                key={item.id}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                  isTarget
                    ? 'bg-[#4ce3ff]/20 border-2 border-[#4ce3ff] shadow-[0_0_18px_rgba(76,227,255,0.9),inset_0_0_10px_rgba(76,227,255,0.35)] scale-[1.02] z-10'
                    : 'bg-[#060e20]/60 border border-[#4ce3ff]/30 opacity-90 hover:opacity-100 hover:border-[#4ce3ff]/60'
                }`}
              >
                <span
                  className={`text-2xl select-none mb-0.5 filter transition-transform duration-200 ${
                    isTarget
                      ? 'scale-110 drop-shadow-[0_0_12px_rgba(76,227,255,0.9)]'
                      : 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  {item.emoji}
                </span>
                <span
                  className={`font-orbitron text-[8px] tracking-wider font-extrabold uppercase transition-colors ${
                    isTarget ? 'text-[#4ce3ff] text-glow-cyan font-black' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
