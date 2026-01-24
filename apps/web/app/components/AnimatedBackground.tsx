'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

export function AnimatedBackground() {
  const [particles] = useState<
    Array<{ id: number; x: number; y: number; delay: number; duration: number }>
  >(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
    }))
  );

  return (
    <div className='fixed inset-0 overflow-hidden pointer-events-none z-0'>
      {/* Animated Grid */}
      <div className='absolute inset-0 opacity-20'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className='absolute w-1 h-1 bg-emerald-400 rounded-full opacity-30'
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Animated Geometric Shapes */}
      <motion.div
        className='absolute top-20 left-10 w-32 h-32 border border-emerald-500/20 rounded-lg'
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className='absolute bottom-20 right-10 w-24 h-24 border border-teal-500/20 rounded-full'
        animate={{
          rotate: [360, 270, 180, 90, 0],
          scale: [1, 0.9, 1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className='absolute top-1/2 right-1/4 w-16 h-16 border border-green-500/20 rotate-45'
        animate={{
          rotate: [45, 135, 225, 315, 45],
          y: [0, -20, 0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated Lines */}
      <svg
        className='absolute inset-0 w-full h-full opacity-10'
        style={{ zIndex: -1 }}
      >
        <motion.line
          x1='0'
          y1='0'
          x2='100%'
          y2='100%'
          stroke='url(#gradient1)'
          strokeWidth='2'
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1='100%'
          y1='0'
          x2='0'
          y2='100%'
          stroke='url(#gradient2)'
          strokeWidth='2'
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 1,
          }}
        />
        <defs>
          <linearGradient id='gradient1' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#10b981' stopOpacity='0.5' />
            <stop offset='100%' stopColor='#14b8a6' stopOpacity='0.5' />
          </linearGradient>
          <linearGradient id='gradient2' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#14b8a6' stopOpacity='0.5' />
            <stop offset='100%' stopColor='#10b981' stopOpacity='0.5' />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
