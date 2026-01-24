'use client';

import { Github, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className='py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative z-10'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row items-center justify-between'>
          <Link href='/' className='mb-4 sm:mb-0'>
            <Image
              src='/typeserve-logo-full.png'
              alt='TypeServe Logo'
              width={150}
              height={40}
              className='h-8 sm:h-10 w-auto object-contain'
            />
          </Link>
          <div className='flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400'>
            <Link href='/docs' className='hover:text-white transition-colors'>
              Documentation
            </Link>
            <a
              href='https://github.com/emmanueltaiwo/typeserve'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-white transition-colors flex items-center space-x-1.5'
            >
              <Github className='w-3 h-3 sm:w-4 sm:h-4' />
              <span>GitHub</span>
            </a>
            <a
              href='https://www.npmjs.com/package/typeserve'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-white transition-colors flex items-center space-x-1.5'
            >
              <Package className='w-3 h-3 sm:w-4 sm:h-4' />
              <span>npm</span>
            </a>
          </div>
        </div>
        <div className='mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500'>
          <p>AGPL-3.0 License © {new Date().getFullYear()} TypeServe</p>
        </div>
      </div>
    </footer>
  );
}
