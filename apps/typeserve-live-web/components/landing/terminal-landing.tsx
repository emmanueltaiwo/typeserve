'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TerminalButton } from './terminal-button';
import {
  Play,
  Terminal,
  Zap,
  Clock,
  Shield,
  Code,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface CommandOutput {
  command: string;
  output: React.ReactNode;
}

export function TerminalLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const commands: CommandOutput[] = [
    {
      command: 'cat README.md',
      output: (
        <div className='space-y-6'>
          <div>
            <div className='text-4xl sm:text-5xl lg:text-6xl font-bold font-mono mb-3'>
              Typeserve Live
            </div>
            <div className='text-xl sm:text-2xl text-neutral-500 dark:text-neutral-500 font-mono'>
              Mock APIs from TypeScript types
            </div>
          </div>
          <div className='text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl'>
            Generate temporary mock APIs instantly from your TypeScript type
            definitions. Perfect for testing, prototyping, and demos. No
            authentication, no accounts, everything auto-expires. Powered by{' '}
            <a
              href='https://typeserve.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 dark:text-blue-400 underline hover:opacity-80 transition-opacity'
            >
              TypeServe
            </a>{' '}
            for intelligent data generation.
          </div>
          <div className='pt-2'>
            <TerminalButton href='/create' variant='primary' size='lg'>
              <Play className='mr-2 h-4 w-4' />
              Create API
            </TerminalButton>
          </div>
        </div>
      ),
    },
    {
      command: 'typeserve-live --help',
      output: (
        <div className='space-y-4 font-mono text-sm'>
          <div className='text-neutral-600 dark:text-neutral-400'>
            Usage: typeserve-live [options]
          </div>
          <div className='space-y-3 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800'>
            <div className='flex items-start gap-4'>
              <span className='text-blue-600 dark:text-blue-400 font-medium shrink-0 w-32'>
                --instant
              </span>
              <span className='text-neutral-700 dark:text-neutral-300'>
                Get your API running in less than 5 seconds. No configuration
                needed.
              </span>
            </div>
            <div className='flex items-start gap-4'>
              <span className='text-blue-600 dark:text-blue-400 font-medium shrink-0 w-32'>
                --no-auth
              </span>
              <span className='text-neutral-700 dark:text-neutral-300'>
                No sign-up required. No accounts. No credit cards. Just create
                and use.
              </span>
            </div>
            <div className='flex items-start gap-4'>
              <span className='text-blue-600 dark:text-blue-400 font-medium shrink-0 w-32'>
                --auto-expire
              </span>
              <span className='text-neutral-700 dark:text-neutral-300'>
                APIs automatically expire after 5 minutes to 2 hours. No cleanup
                needed.
              </span>
            </div>
            <div className='flex items-start gap-4'>
              <span className='text-blue-600 dark:text-blue-400 font-medium shrink-0 w-32'>
                --typescript
              </span>
              <span className='text-neutral-700 dark:text-neutral-300'>
                TypeScript-first approach. Define your types, we generate the
                mock data.
              </span>
            </div>
            <div className='flex items-start gap-4'>
              <span className='text-blue-600 dark:text-blue-400 font-medium shrink-0 w-32'>
                --restful
              </span>
              <span className='text-neutral-700 dark:text-neutral-300'>
                Full REST support with GET, POST, PUT, DELETE methods and custom
                routes.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      command: 'ls -la features/',
      output: (
        <div className='space-y-4'>
          <div className='text-neutral-600 dark:text-neutral-400 font-mono text-xs mb-4'>
            total 6
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm'>
            {[
              {
                icon: Zap,
                name: 'instant-setup',
                desc: 'Get running in seconds',
                details: 'No deployment, no configuration',
              },
              {
                icon: Clock,
                name: 'auto-expiration',
                desc: '5 min - 2 hours',
                details: 'Automatic cleanup, no manual deletion',
              },
              {
                icon: Terminal,
                name: 'typescript-first',
                desc: 'Define types, get APIs',
                details: 'TypeScript types → Mock data',
              },
              {
                icon: Shield,
                name: 'no-auth',
                desc: 'No accounts needed',
                details: 'Completely anonymous and disposable',
              },
              {
                icon: Code,
                name: 'restful-apis',
                desc: 'GET, POST, PUT, DELETE',
                details: 'Full REST API support',
              },
              {
                icon: Sparkles,
                name: 'smart-generation',
                desc: 'Powered by TypeServe',
                details: 'Intelligent mock data generation',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className='flex items-start gap-3 p-4 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all'
              >
                <feature.icon className='h-5 w-5 text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <div className='text-black dark:text-white font-medium mb-1'>
                    {feature.name}
                  </div>
                  <div className='text-neutral-600 dark:text-neutral-400 text-xs mb-1'>
                    {feature.desc}
                  </div>
                  <div className='text-neutral-500 dark:text-neutral-500 text-xs'>
                    {feature.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      command: 'cat workflow.ts',
      output: (
        <div className='space-y-8 font-mono text-sm'>
          <div>
            <div className='text-neutral-600 dark:text-neutral-400 mb-3'>
              {'// Step 1: Define your TypeScript types'}
            </div>
            <div className='pl-4 space-y-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 rounded'>
              <div>
                <span className='text-purple-600 dark:text-purple-400'>
                  interface
                </span>{' '}
                <span className='text-blue-600 dark:text-blue-400'>User</span>{' '}
                {'{'}
              </div>
              <div className='pl-4'>
                <span className='text-neutral-700 dark:text-neutral-300'>
                  id
                </span>
                :{' '}
                <span className='text-green-600 dark:text-green-400'>
                  string
                </span>
                ;
              </div>
              <div className='pl-4'>
                <span className='text-neutral-700 dark:text-neutral-300'>
                  name
                </span>
                :{' '}
                <span className='text-green-600 dark:text-green-400'>
                  string
                </span>
                ;
              </div>
              <div className='pl-4'>
                <span className='text-neutral-700 dark:text-neutral-300'>
                  email
                </span>
                :{' '}
                <span className='text-green-600 dark:text-green-400'>
                  string
                </span>
                ;
              </div>
              <div>{'}'}</div>
            </div>
          </div>

          <div>
            <div className='text-neutral-600 dark:text-neutral-400 mb-3'>
              {'// Step 2: Define your API routes'}
            </div>
            <div className='pl-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 rounded'>
              <div className='space-y-2'>
                <div>
                  GET{' '}
                  <span className='text-blue-600 dark:text-blue-400'>
                    /users
                  </span>{' '}
                  →{' '}
                  <span className='text-blue-600 dark:text-blue-400'>User</span>
                  []
                </div>
                <div>
                  GET{' '}
                  <span className='text-blue-600 dark:text-blue-400'>
                    /users/:id
                  </span>{' '}
                  →{' '}
                  <span className='text-blue-600 dark:text-blue-400'>User</span>
                </div>
                <div>
                  POST{' '}
                  <span className='text-blue-600 dark:text-blue-400'>
                    /users
                  </span>{' '}
                  →{' '}
                  <span className='text-blue-600 dark:text-blue-400'>User</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className='text-neutral-600 dark:text-neutral-400 mb-3'>
              {'// Step 3: Deploy and use'}
            </div>
            <div className='pl-4 space-y-2'>
              <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                <CheckCircle2 className='h-4 w-4' />
                <span>API deployed successfully</span>
              </div>
              <div className='text-neutral-700 dark:text-neutral-300'>
                Endpoint:{' '}
                <span className='text-blue-600 dark:text-blue-400 font-mono'>
                  https://my-api.typeserve.live
                </span>
              </div>
              <div className='text-neutral-500 dark:text-neutral-500 text-xs'>
                Expires in 2 hours • Auto-cleanup enabled
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      command: 'curl my-api.typeserve.live/users',
      output: (
        <div className='font-mono text-sm space-y-3'>
          <div className='text-neutral-600 dark:text-neutral-400'>
            HTTP/1.1 200 OK
          </div>
          <div className='text-neutral-600 dark:text-neutral-400'>
            Content-Type: application/json
          </div>
          <div className='bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 rounded'>
            <div className='text-neutral-700 dark:text-neutral-300 whitespace-pre leading-relaxed'>{`[
  {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": "2",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  {
    "id": "3",
    "name": "Bob Johnson",
    "email": "bob@example.com"
  }
]`}</div>
          </div>
          <div className='text-neutral-500 dark:text-neutral-500 text-xs pt-2'>
            ✓ Mock data generated automatically from TypeScript types
          </div>
        </div>
      ),
    },
    {
      command: 'cat limits.txt',
      output: (
        <div className='space-y-4'>
          <div className='text-neutral-600 dark:text-neutral-400 font-mono text-xs mb-4'>
            Limits and constraints for temporary APIs
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm'>
            {[
              {
                label: 'EXPIRATION TIME',
                value: '5 min - 2 hours',
                desc: 'Choose expiration when creating API',
              },
              {
                label: 'ACTIVE SERVERS',
                value: '10 maximum',
                desc: 'Per user session',
              },
              {
                label: 'AUTO-CLEANUP',
                value: 'Automatic',
                desc: 'No manual deletion required',
              },
              {
                label: 'SUBDOMAIN',
                value: 'Unique per API',
                desc: 'Custom subdomain for each API',
              },
            ].map((limit, idx) => (
              <div
                key={idx}
                className='border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors'
              >
                <div className='text-neutral-500 dark:text-neutral-500 text-xs uppercase mb-2 font-medium'>
                  {limit.label}
                </div>
                <div className='text-black dark:text-white font-medium mb-1'>
                  {limit.value}
                </div>
                <div className='text-neutral-500 dark:text-neutral-500 text-xs'>
                  {limit.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      command: 'echo "Ready to build?"',
      output: (
        <div className='space-y-6'>
          <div className='text-3xl sm:text-4xl font-bold font-mono'>
            Ready to build?
          </div>
          <div className='text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-xl'>
            Create your first live mock API in seconds. No credit card, no
            sign-up required. Just your TypeScript types and a live endpoint.
          </div>
          <div className='flex flex-col sm:flex-row gap-4'>
            <TerminalButton href='/create' variant='primary' size='lg'>
              <Play className='mr-2 h-4 w-4' />
              Create Live API
              <ArrowRight className='ml-2 h-4 w-4' />
            </TerminalButton>
            <div className='flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500 font-mono'>
              <div className='flex items-center gap-2'>
                <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
                <span>No sign-up</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                <span>&lt; 5s setup</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div ref={containerRef} className='min-h-screen py-12 sm:py-20'>
      <div className='max-w-4xl mx-auto px-6'>
        {commands.map((cmd, index) => (
          <motion.div
            key={index}
            data-command-section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className='mb-20 last:mb-0'
          >
            <div className='relative'>
              {/* Command prompt */}
              <div className='flex items-center gap-3 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800'>
                <div className='flex items-center gap-2 shrink-0'>
                  <div className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-xs font-mono text-neutral-500 dark:text-neutral-500'>
                    user@typeserve-live
                  </span>
                </div>
                <div className='flex-1 font-mono text-sm text-neutral-600 dark:text-neutral-400 overflow-x-auto'>
                  <span className='text-green-600 dark:text-green-400'>$</span>{' '}
                  <span className='text-black dark:text-white'>
                    {cmd.command}
                  </span>
                </div>
              </div>
              {/* Output */}
              <div className='pl-0 sm:pl-6 text-black dark:text-white'>
                {cmd.output}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className='fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10'
        initial={{ opacity: 1 }}
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
        }}
      >
        <div className='flex flex-col items-center gap-2 text-neutral-400 dark:text-neutral-600 text-xs font-mono'>
          <div>Scroll to explore</div>
          <div className='animate-bounce'>↓</div>
        </div>
      </motion.div>
    </div>
  );
}
