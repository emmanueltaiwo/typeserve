'use client';

import { motion } from 'motion/react';
import { Package, Github } from 'lucide-react';

export function CTA() {
  return (
    <section className='py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className='max-w-4xl mx-auto text-center'
      >
        <div className='p-8 sm:p-12 rounded-2xl bg-linear-to-br from-emerald-500/20 via-teal-500/20 to-green-500/20 border border-white/10 backdrop-blur-sm'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6'>
            Ready to Build Faster?
          </h2>
          <p className='text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto'>
            Start generating mock APIs from your TypeScript types today. No
            backend needed.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4'>
            <motion.a
              href='https://www.npmjs.com/package/typeserve'
              target='_blank'
              rel='noopener noreferrer'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold text-base sm:text-lg shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all'
            >
              <Package className='w-4 h-4 sm:w-5 sm:h-5' />
              <span>Install from npm</span>
            </motion.a>
            <motion.a
              href='https://github.com/emmanueltaiwo/typeserve'
              target='_blank'
              rel='noopener noreferrer'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/10 transition-all'
            >
              <Github className='w-4 h-4 sm:w-5 sm:h-5' />
              <span>Star on GitHub</span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
