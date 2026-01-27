'use client';

import { Code, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className='border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black py-12'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-6'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded border border-neutral-300 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
              <Code className='h-4 w-4 text-neutral-700 dark:text-neutral-300' />
            </div>
            <span className='text-sm font-mono text-neutral-700 dark:text-neutral-300'>
              Typeserve Live
            </span>
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-4 text-sm font-mono'>
            <p className='text-neutral-500 dark:text-neutral-500'>
              Built for developers, by developers
            </p>
            <span className='hidden sm:inline text-neutral-300 dark:text-neutral-700'>
              •
            </span>
            <div className='flex items-center gap-2'>
              <span className='text-neutral-500 dark:text-neutral-500'>
                Powered by
              </span>
              <a
                href='https://typeserve.com'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors underline'
              >
                TypeServe
                <ExternalLink className='h-3 w-3' />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
