'use client';

import { NavHeader } from '@/components/nav-header';
import { TerminalLanding } from '@/components/landing/terminal-landing';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className='min-h-screen bg-white dark:bg-black text-black dark:text-white'>
      <NavHeader />
      <TerminalLanding />
      <Footer />
    </div>
  );
}
