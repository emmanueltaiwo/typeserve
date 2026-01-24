'use client';

import { motion } from 'motion/react';
import { Package, Play, FileText, ArrowRight } from 'lucide-react';
import { TypingCode } from './TypingCode';
import { TypingLog } from './TypingLog';

const codeExample = `// 1. Install TypeServe
npm install -D typeserve

// 2. Initialize config
npx typeserve init

// 3. Define your types (src/types.ts)
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
}

// 4. Edit typeserve.config.ts
import { defineMock } from '@typeserve/core';

export default defineMock({
  port: 7002,
  basePath: '/api',
  routes: [
    {
      path: '/users',
      method: 'GET',
      type: 'User[]',
    },
  ],
});

// 5. Start the server
npx typeserve dev`;

export function Installation() {
  return (
    <section
      id='installation'
      className='py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10'
    >
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12 sm:mb-16'
        >
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4'>
            Get Started in Seconds
          </h2>
          <p className='text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4'>
            Install, configure, and start building. It&apos;s that simple.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
          {/* Installation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='space-y-4 sm:space-y-6'
          >
            <div className='flex items-center space-x-3 mb-4 sm:mb-6'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
                <Package className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
              </div>
              <h3 className='text-xl sm:text-2xl font-bold'>Installation</h3>
            </div>
            <div className='p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm'>
              <TypingCode code='npm install -D typeserve' />
            </div>
            <div className='p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm'>
              <TypingLog />
            </div>
          </motion.div>

          {/* Usage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='space-y-4 sm:space-y-6'
          >
            <div className='flex items-center space-x-3 mb-4 sm:mb-6'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
                <Play className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
              </div>
              <h3 className='text-xl sm:text-2xl font-bold'>Quick Start</h3>
            </div>
            <div className='p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm'>
              <TypingCode code={codeExample} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='mt-8 sm:mt-12 text-center'
        >
          <motion.a
            href='/docs'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/10 transition-all'
          >
            <FileText className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>Read Full Documentation</span>
            <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5' />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
