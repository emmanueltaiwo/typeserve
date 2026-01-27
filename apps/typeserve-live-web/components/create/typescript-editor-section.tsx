'use client';

import { CodeEditor } from '@/components/code-editor';
import { FileCode } from 'lucide-react';
import { motion } from 'motion/react';

interface TypeScriptEditorSectionProps {
  types: string;
  setTypes: (types: string) => void;
}

export function TypeScriptEditorSection({
  types,
  setTypes,
}: TypeScriptEditorSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className='rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-8 space-y-6'
    >
      {/* Terminal-style header */}
      <div className='flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-3 flex-1'>
          <div className='h-8 w-8 rounded border border-neutral-300 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
            <FileCode className='h-4 w-4 text-neutral-700 dark:text-white' />
          </div>
          <div>
            <h2 className='text-xl font-semibold mb-1 text-neutral-900 dark:text-white font-mono'>
              TypeScript Types
            </h2>
            <p className='text-sm text-neutral-600 dark:text-neutral-400 font-mono'>
              Define your types (no logic required)
            </p>
          </div>
        </div>
      </div>
      <CodeEditor
        value={types}
        onChange={setTypes}
        height='400px'
        language='typescript'
      />
    </motion.div>
  );
}
