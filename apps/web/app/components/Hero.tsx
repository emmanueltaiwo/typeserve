'use client';

import { motion } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export function Hero() {
  return (
    <section className='relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden'>
      <div className='max-w-7xl mx-auto relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center'
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8'
          >
            <Sparkles className='w-3 h-3 sm:w-4 sm:h-4 text-emerald-400' />
            <span className='text-xs sm:text-sm text-gray-300'>
              <span className='hidden sm:inline'>
                The First and Only TypeScript Mock API Generator
              </span>
              <span className='sm:hidden'>First & Only TS Mock API</span>
            </span>
          </motion.div>

          <h1 className='text-3xl sm:text-5xl font-black mb-4 sm:mb-6 leading-tight px-2 tracking-tight'>
            <span className='block'>Generate Live Mock APIs</span>
            <span className='block bg-linear-to-r from-emerald-400 via-teal-400 to-green-500 bg-clip-text text-transparent mt-2'>
              from TypeScript Types
            </span>
          </h1>

          <p className='text-base sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 sm:mb-12 leading-normal px-4 tracking-normal'>
            No backend needed. No schema files. Just your TypeScript types.
            <br className='hidden sm:block' />
            <span className='text-white'> Build faster, ship sooner.</span>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4'
          >
            <motion.a
              href='#installation'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='group w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold text-base sm:text-lg shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all'
            >
              <span>Get Started</span>
              <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform' />
            </motion.a>
            <motion.a
              href='/docs'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/10 transition-all'
            >
              <BookOpen className='w-4 h-4 sm:w-5 sm:h-5' />
              <span>Documentation</span>
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto px-4'
          >
            {[
              { label: 'Zero Config', value: 'Setup' },
              { label: '2ms-200ms', value: 'Response Time' },
              { label: 'TypeScript', value: 'Native' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className='p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm'
              >
                <div className='text-xl sm:text-2xl font-bold text-white mb-1'>
                  {stat.label}
                </div>
                <div className='text-xs sm:text-sm text-gray-400'>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
