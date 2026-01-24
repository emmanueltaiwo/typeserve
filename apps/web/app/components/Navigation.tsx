'use client';

import { motion } from 'motion/react';
import { Github, Package, Menu, X, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/emmanueltaiwo/typeserve')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setGithubStars(data.stargazers_count || null);
      })
      .catch(() => {
        // Silently fail - don't show stars if fetch fails
        setGithubStars(null);
      });
  }, []);

  return (
    <nav className='fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-14 sm:h-16'>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href='/'
              className='text-xl sm:text-2xl font-black tracking-tight inline-flex items-center gap-2 group'
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className='relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center'
              >
                <Image
                  src='/typeserve-logo.png'
                  alt='TypeServe Logo'
                  width={48}
                  height={48}
                  className='object-contain w-full h-full'
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='hidden md:flex items-center space-x-4 lg:space-x-6'
          >
            <Link
              href='/docs'
              className='text-sm lg:text-base text-gray-400 hover:text-white transition-colors'
            >
              Docs
            </Link>
            <a
              href='https://github.com/emmanueltaiwo/typeserve'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm lg:text-base text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5'
            >
              <Github className='w-4 h-4' />
              {githubStars !== null && githubStars !== undefined && (
                <span className='flex items-center gap-1 text-xs font-medium'>
                  <Star className='w-3.5 h-3.5 fill-current' />
                  {githubStars >= 1000
                    ? `${(githubStars / 1000).toFixed(1)}k`
                    : githubStars}
                </span>
              )}
              <span className='hidden lg:inline'>GitHub</span>
            </a>
            <a
              href='https://www.npmjs.com/package/typeserve'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm lg:text-base text-gray-400 hover:text-white transition-colors flex items-center space-x-1.5'
            >
              <Package className='w-4 h-4' />
              <span className='hidden lg:inline'>npm</span>
            </a>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='md:hidden p-2 text-gray-400 hover:text-white transition-colors'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden py-4 border-t border-white/10'
          >
            <div className='flex flex-col space-y-4'>
              <Link
                href='/docs'
                onClick={() => setMobileMenuOpen(false)}
                className='text-base text-gray-400 hover:text-white transition-colors py-2'
              >
                Documentation
              </Link>
              <a
                href='https://github.com/emmanueltaiwo/typeserve'
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => setMobileMenuOpen(false)}
                className='text-base text-gray-400 hover:text-white transition-colors py-2 flex items-center gap-2'
              >
                <Github className='w-5 h-5' />
                <span>GitHub</span>
                {githubStars !== null && githubStars !== undefined && (
                  <span className='flex items-center gap-1 text-sm font-medium ml-auto'>
                    <Star className='w-4 h-4 fill-current' />
                    {githubStars >= 1000
                      ? `${(githubStars / 1000).toFixed(1)}k`
                      : githubStars}
                  </span>
                )}
              </a>
              <a
                href='https://www.npmjs.com/package/typeserve'
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => setMobileMenuOpen(false)}
                className='text-base text-gray-400 hover:text-white transition-colors py-2 flex items-center space-x-2'
              >
                <Package className='w-5 h-5' />
                <span>npm</span>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
