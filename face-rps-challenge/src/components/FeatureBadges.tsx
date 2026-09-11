import React from 'react';

export const FeatureBadges: React.FC = () => {
  const badges = [
    { icon: '⚡', label: '5s PER ROUND' },
    { icon: '🎯', label: 'INSTANT MATCH' },
    { icon: '🛡️', label: '100% PRIVATE' },
  ];

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 px-3.5 py-1 rounded-sm border border-neon-cyan/50 bg-[#020718]/80 backdrop-blur-md shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          style={{ clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%, 0 6px)' }}
        >
          <span className="text-neon-cyan text-xs drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]">{badge.icon}</span>
          <span className="text-[10px] font-black tracking-widest text-neon-cyan uppercase drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]">
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
};
