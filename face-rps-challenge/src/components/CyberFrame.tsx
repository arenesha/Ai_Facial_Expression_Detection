import React from 'react';

export type CyberCut = 'none' | 'br' | 'bl' | 'all';
export type CyberColor = 'cyan' | 'magenta' | 'green' | 'none';

interface CyberFrameProps {
  children: React.ReactNode;
  cut?: CyberCut;
  color?: CyberColor;
  className?: string;
  contentClassName?: string;
  glow?: boolean;
}

export const CyberFrame: React.FC<CyberFrameProps> = ({
  children,
  cut = 'none',
  color = 'cyan',
  className = '',
  contentClassName = '',
  glow = true,
}) => {
  // Determine clip-path polygons based on cut type.
  // We use a 16px chamfer for outer, and 15px for inner to keep border tight.
  let outerPolygon = '';
  let innerPolygon = '';
  
  if (cut === 'br') {
    outerPolygon = 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)';
    innerPolygon = 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)';
  } else if (cut === 'bl') {
    outerPolygon = 'polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px))';
    innerPolygon = 'polygon(0 0, 100% 0, 100% 100%, 15px 100%, 0 calc(100% - 15px))';
  } else if (cut === 'all') {
    outerPolygon = 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)';
    innerPolygon = 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)';
  }

  // Map colors to CSS variables
  const colorMap = {
    cyan: 'var(--neon-cyan)',
    magenta: 'var(--neon-magenta)',
    green: 'var(--neon-green)',
    none: 'transparent'
  };

  const glowShadows = {
    cyan: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.4))',
    magenta: 'drop-shadow(0 0 6px rgba(255, 0, 255, 0.4))',
    green: 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.4))',
    none: 'none'
  };

  const outerStyle: React.CSSProperties = {
    background: colorMap[color],
    padding: color === 'none' ? '0' : '1px',
    clipPath: outerPolygon || 'none',
    filter: glow ? glowShadows[color] : 'none',
  };

  const innerStyle: React.CSSProperties = {
    background: 'rgba(3, 8, 22, 0.55)',
    backdropFilter: 'blur(8px)',
    clipPath: innerPolygon || 'none',
    width: '100%',
    height: '100%',
  };

  return (
    <div style={outerStyle} className={`relative flex flex-col ${className}`}>
      <div style={innerStyle} className={`relative flex-1 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
