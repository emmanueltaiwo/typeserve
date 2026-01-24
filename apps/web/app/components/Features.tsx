'use client';

import { motion } from 'motion/react';
import { Zap, Code, Rocket, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Code,
    title: 'TypeScript-First',
    description: 'Uses your existing types, no OpenAPI or JSON Schema needed',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Pre-parses types at startup, responses in 50ms-5s',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Rocket,
    title: 'Hot Reload',
    description: 'Automatically reloads when your types or config change',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'Smart Data Generation',
    description: 'Auto-detects emails, dates, IDs, and more',
    color: 'from-emerald-500 to-green-500',
  },
];

export function Features() {
  return (
    <section className='py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12 sm:mb-16'
        >
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4'>
            Everything You Need
          </h2>
          <p className='text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4'>
            Built for modern TypeScript developers who want to move fast
          </p>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className='group p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm'
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold mb-2'>
                {feature.title}
              </h3>
              <p className='text-gray-400 text-xs sm:text-sm leading-relaxed'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
