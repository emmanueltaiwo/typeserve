'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Github, Star, Terminal } from 'lucide-react';

export function NavHeader() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('https://api.github.com/repos/emmanueltaiwo/typeserve')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setGithubStars(data.stargazers_count || null);
      })
      .catch(() => {
        setGithubStars(null);
      });
  }, []);

  if (!mounted) {
    return (
      <nav className='border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black sticky top-0 z-50'>
        <div className='container mx-auto px-6'>
          <div className='flex h-14 items-center justify-between font-mono text-sm'>
            <div className='h-6 w-32 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded' />
            <div className='h-6 w-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded' />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black sticky top-0 z-50'>
      <div className='container mx-auto px-6'>
        <div className='flex h-14 items-center justify-between font-mono text-sm'>
          {/* Left: Terminal prompt style */}
          <Link
            href='/'
            className='flex items-center gap-2 hover:opacity-80 transition-opacity'
          >
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-500' />
              <span className='text-neutral-500 dark:text-neutral-500'>
                user@typeserve-live
              </span>
            </div>
            <span className='text-neutral-400 dark:text-neutral-600 mx-2'>
              :
            </span>
            <span className='text-blue-600 dark:text-blue-400'>~</span>
            <span className='text-neutral-400 dark:text-neutral-600 mx-2'>
              $
            </span>
            <span className='text-black dark:text-white font-medium'>
              typeserve-live
            </span>
          </Link>

          {/* Right: Actions */}
          <div className='flex items-center gap-4'>
            {githubStars !== null && (
              <a
                href='https://github.com/emmanueltaiwo/typeserve'
                target='_blank'
                rel='noopener noreferrer'
                className='hidden sm:flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-xs'
              >
                <Github className='h-3.5 w-3.5' />
                <Star className='h-3.5 w-3.5 fill-current' />
                <span>
                  {githubStars >= 1000
                    ? `${(githubStars / 1000).toFixed(1)}k`
                    : githubStars}
                </span>
              </a>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
