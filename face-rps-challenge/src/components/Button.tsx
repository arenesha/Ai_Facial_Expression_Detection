import React from 'react';
import { useSound } from '@/hooks/useSound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-accent hover:bg-accent-light active:bg-accent-dark text-white shadow-lg shadow-accent/30 hover:shadow-accent/50',
  secondary:
    'bg-dark-600 hover:bg-dark-500 text-white border border-white/10 hover:border-white/20',
  danger:
    'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-600/30',
  ghost:
    'bg-transparent hover:bg-white/5 text-white/70 hover:text-white border border-white/10 hover:border-white/20',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl min-w-[100px]',
  lg: 'px-8 py-3.5 text-base rounded-xl min-w-[160px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  ...props
}) => {
  const { play } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    play('click');
    onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={[
        'font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-800 disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
};
