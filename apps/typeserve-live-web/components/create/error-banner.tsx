'use client';

import { motion } from 'motion/react';

interface ErrorBannerProps {
  error: string | null;
  capacityCountdown: number | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ErrorBanner({ error, capacityCountdown }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='mb-8'
    >
      <div className='p-4 rounded border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 font-mono text-sm'>
        <div className='flex items-center justify-between w-full'>
          <span>{error}</span>
          {capacityCountdown !== null && capacityCountdown > 0 && (
            <span className='text-sm font-mono ml-4 shrink-0'>
              {formatTime(capacityCountdown)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
