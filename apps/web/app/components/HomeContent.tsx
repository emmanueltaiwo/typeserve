'use client';

import { AnimatedBackground } from './AnimatedBackground';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { Features } from './Features';
import { Comparison } from './Comparison';
import { Installation } from './Installation';
import { CTA } from './CTA';
import { Footer } from './Footer';

export function HomeContent() {
  return (
    <div className='min-h-screen bg-black text-white overflow-hidden relative'>
      <AnimatedBackground />
      <Navigation />
      <Hero />
      <Features />
      <Comparison />
      <Installation />
      <CTA />
      <Footer />
    </div>
  );
}
