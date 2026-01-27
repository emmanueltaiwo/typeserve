'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

const EXPIRATION_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
] as const;

interface APIConfigSectionProps {
  name: string;
  setName: (name: string) => void;
  expiration: string;
  setExpiration: (expiration: string) => void;
  subdomain: string;
}

export function APIConfigSection({
  name,
  setName,
  expiration,
  setExpiration,
  subdomain,
}: APIConfigSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-8 space-y-6'
    >
      {/* Terminal-style header */}
      <div className='flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-3 flex-1'>
          <div className='h-8 w-8 rounded border border-neutral-300 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
            <Globe className='h-4 w-4 text-neutral-700 dark:text-white' />
          </div>
          <div>
            <h2 className='text-xl font-semibold mb-1 text-neutral-900 dark:text-white font-mono'>
              API Configuration
            </h2>
            <p className='text-sm text-neutral-600 dark:text-neutral-400 font-mono'>
              Set up your API name and expiration time
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label
              htmlFor='name'
              className='text-neutral-700 dark:text-neutral-300 font-mono text-sm'
            >
              API Name
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='my-api'
              pattern='[a-z0-9-]+'
              required
              className='font-mono bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:border-neutral-500 dark:focus:border-neutral-700'
            />
            <p className='text-xs text-neutral-600 dark:text-neutral-500 font-mono'>
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>
          <div className='space-y-2'>
            <Label
              htmlFor='expiration'
              className='text-neutral-700 dark:text-neutral-300 font-mono text-sm'
            >
              Expiration
            </Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger
                id='expiration'
                className='w-full font-mono bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-black border-neutral-300 dark:border-neutral-800'>
                {EXPIRATION_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    className='font-mono text-neutral-900 dark:text-white focus:bg-neutral-100 dark:focus:bg-neutral-900'
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Terminal-style preview */}
        <div className='p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-xs text-green-600 dark:text-green-400'>
              $
            </span>
            <span className='text-xs text-neutral-600 dark:text-neutral-400 font-mono'>
              Preview URL
            </span>
          </div>
          <p className='font-mono text-base text-neutral-900 dark:text-white font-semibold pl-4'>
            https://{subdomain}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
