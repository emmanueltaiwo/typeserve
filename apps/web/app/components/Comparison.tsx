'use client';

import { motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';

const comparisons = [
  {
    feature: 'TypeScript Native',
    typeserve: true,
    others: false,
  },
  {
    feature: 'No Schema Files',
    typeserve: true,
    others: false,
  },
  {
    feature: 'Hot Reload',
    typeserve: true,
    others: false,
  },
  {
    feature: 'Nested Types',
    typeserve: true,
    others: 'Limited',
  },
  {
    feature: 'Type-Safe Config',
    typeserve: true,
    others: false,
  },
  {
    feature: 'Zero Config',
    typeserve: true,
    others: false,
  },
];

export function Comparison() {
  return (
    <section className='py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative bg-white/5 z-10'>
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12 sm:mb-16'
        >
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4'>
            Why TypeServe?
          </h2>
          <p className='text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4'>
            Compare TypeServe with other mock API solutions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='overflow-x-auto -mx-4 sm:mx-0'
        >
          <div className='min-w-full inline-block px-4 sm:px-0'>
            <table className='w-full border-collapse text-sm sm:text-base'>
              <thead>
                <tr className='border-b border-white/10'>
                  <th className='text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-300 text-xs sm:text-sm'>
                    Feature
                  </th>
                  <th className='text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm'>
                    <span className='bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'>
                      TypeServe
                    </span>
                  </th>
                  <th className='text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-400 text-xs sm:text-sm'>
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className='border-b border-white/5 hover:bg-white/5 transition-colors'
                  >
                    <td className='py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm'>
                      {item.feature}
                    </td>
                    <td className='py-3 sm:py-4 px-3 sm:px-6 text-center'>
                      {item.typeserve === true ? (
                        <CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mx-auto' />
                      ) : (
                        <XCircle className='w-5 h-5 sm:w-6 sm:h-6 text-red-400 mx-auto' />
                      )}
                    </td>
                    <td className='py-3 sm:py-4 px-3 sm:px-6 text-center text-gray-400 text-xs sm:text-sm'>
                      {item.others === true ? (
                        <CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mx-auto' />
                      ) : item.others === false ? (
                        <XCircle className='w-5 h-5 sm:w-6 sm:h-6 text-red-400 mx-auto' />
                      ) : (
                        <span className='text-yellow-400'>{item.others}</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
