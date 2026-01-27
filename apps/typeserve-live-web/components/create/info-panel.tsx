'use client';

import { Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function InfoPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className='sticky top-24 space-y-6'
    >
      <div className='rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 space-y-4'>
        <div className='flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800'>
          <div className='h-10 w-10 rounded border border-neutral-300 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
            <Clock className='h-5 w-5 text-neutral-700 dark:text-white' />
          </div>
          <div>
            <h3 className='font-semibold text-neutral-900 dark:text-white font-mono'>
              Expiration
            </h3>
            <p className='text-sm text-neutral-600 dark:text-neutral-400 font-mono'>
              Auto-deleted after expiration
            </p>
          </div>
        </div>
        <div className='p-4 rounded border border-amber-300 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20'>
          <p className='text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-mono'>
            ⚠️ APIs are automatically deleted after expiration. Make sure to
            save any important data.
          </p>
        </div>
      </div>

      <div className='rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 space-y-4'>
        <h3 className='font-semibold mb-4 text-neutral-900 dark:text-white font-mono'>
          Quick Tips
        </h3>
        <ul className='space-y-3 text-sm text-neutral-600 dark:text-neutral-400 font-mono'>
          <li className='flex items-start gap-3'>
            <span className='text-neutral-500 dark:text-neutral-500 mt-0.5 shrink-0'>
              •
            </span>
            <span>Use descriptive type names for clarity</span>
          </li>
          <li className='flex items-start gap-3'>
            <span className='text-neutral-500 dark:text-neutral-500 mt-0.5 shrink-0'>
              •
            </span>
            <span>Define routes that match your types</span>
          </li>
          <li className='flex items-start gap-3'>
            <span className='text-neutral-500 dark:text-neutral-500 mt-0.5 shrink-0'>
              •
            </span>
            <span>Arrays use [] syntax (e.g., User[])</span>
          </li>
          <li className='flex items-start gap-3'>
            <span className='text-neutral-500 dark:text-neutral-500 mt-0.5 shrink-0'>
              •
            </span>
            <span>Maximum 10 routes per API</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
