'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface TerminalButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function TerminalButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  type,
  disabled,
}: TerminalButtonProps) {
  const baseClasses =
    'cursor-pointer inline-flex items-center justify-center font-mono border transition-all';

  const variantClasses = {
    primary:
      'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:opacity-90',
    secondary:
      'bg-transparent text-black dark:text-white border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600',
  };

  const sizeClasses = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-10 px-6 text-sm',
    lg: 'h-12 px-8 text-sm',
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
