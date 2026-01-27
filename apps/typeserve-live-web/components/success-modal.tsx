'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TerminalButton } from '@/components/landing/terminal-button';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
  Globe,
  Route as RouteIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { CreateRouteRequest } from '@/lib/api';

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subdomain: string;
  expiresAt: string;
  routes: CreateRouteRequest[];
}

export function SuccessModal({
  open,
  onOpenChange,
  subdomain,
  expiresAt,
  routes,
}: SuccessModalProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!open || !expiresAt) return;

    const updateCountdown = () => {
      const expiresAtDate = new Date(expiresAt);
      const now = new Date();
      const diff = Math.floor((expiresAtDate.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setExpired(true);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(diff);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [open, expiresAt]);

  const apiUrl = `https://${subdomain}`;

  const firstRoute: CreateRouteRequest =
    routes.length > 0 && routes[0]
      ? routes[0]
      : { method: 'GET', path: '/users', responseType: 'User[]' };
  const exampleCurl = `curl ${apiUrl}${firstRoute.path}`;
  const exampleFetch = `fetch('${apiUrl}${firstRoute.path}')`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 max-h-[90vh] flex flex-col p-0 font-mono'>
        {/* Terminal Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950'>
          <div className='flex items-center gap-3'>
            <div className='flex gap-1.5'>
              <div className='h-3 w-3 rounded-full bg-red-500' />
              <div className='h-3 w-3 rounded-full bg-yellow-500' />
              <div className='h-3 w-3 rounded-full bg-green-500' />
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-500' />
              <span className='text-xs text-neutral-500 dark:text-neutral-500'>
                user@typeserve-live
              </span>
            </div>
            <span className='text-xs text-neutral-400 dark:text-neutral-600 mx-2'>
              :
            </span>
            <span className='text-xs text-blue-600 dark:text-blue-400'>~</span>
            <span className='text-xs text-neutral-400 dark:text-neutral-600 mx-2'>
              $
            </span>
            <span className='text-xs text-black dark:text-white'>
              api-created
            </span>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto px-6 py-6 space-y-6'>
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-3'
          >
            <div className='flex items-center gap-3'>
              <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
              <div className='text-lg font-semibold text-black dark:text-white'>
                API Created Successfully
              </div>
            </div>
            <div className='text-sm text-neutral-600 dark:text-neutral-400 pl-8'>
              Your live mock API is ready to use. Start making requests right
              away.
            </div>
          </motion.div>

          {/* API URL */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400'>
              <Globe className='h-4 w-4' />
              <span>API Base URL</span>
            </div>
            <div className='relative'>
              <div className='flex items-center gap-2 p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950'>
                <code className='flex-1 text-sm text-black dark:text-white break-all'>
                  {apiUrl}
                </code>
                <div className='flex items-center gap-1 shrink-0'>
                  <button
                    onClick={() => copyToClipboard(apiUrl, 'API URL')}
                    className='p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors'
                  >
                    <Copy className='h-4 w-4' />
                  </button>
                  <a
                    href={apiUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors'
                  >
                    <ExternalLink className='h-4 w-4' />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Expiration Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950'>
              <div className='flex items-center gap-2 mb-2 text-xs text-neutral-600 dark:text-neutral-400 uppercase'>
                <Clock className='h-3.5 w-3.5' />
                <span>Expires At</span>
              </div>
              <p className='text-sm text-black dark:text-white'>
                {new Date(expiresAt).toLocaleString()}
              </p>
            </div>
            <div className='p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950'>
              <div className='text-xs text-neutral-600 dark:text-neutral-400 uppercase mb-2'>
                Time Remaining
              </div>
              {expired ? (
                <p className='text-lg text-red-600 dark:text-red-400 font-semibold'>
                  Expired
                </p>
              ) : timeRemaining !== null ? (
                <p className='text-2xl font-bold text-black dark:text-white'>
                  {formatTime(timeRemaining)}
                </p>
              ) : (
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  Calculating...
                </p>
              )}
            </div>
          </div>

          {/* Routes */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400'>
              <RouteIcon className='h-4 w-4' />
              <span>API Routes ({routes.length})</span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {routes.map((route, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors'
                >
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <span className='text-xs px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white shrink-0'>
                      {route.method}
                    </span>
                    <code className='text-sm text-neutral-700 dark:text-neutral-300 truncate'>
                      {route.path}
                    </code>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl ${apiUrl}${route.path}`,
                        `${route.method} ${route.path}`
                      )
                    }
                    className='p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors shrink-0'
                  >
                    <Copy className='h-3.5 w-3.5' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400'>
              <Sparkles className='h-4 w-4' />
              <span>Quick Start Examples</span>
            </div>
            <div className='space-y-2'>
              <div className='group flex items-center gap-2 p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all'>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs text-neutral-600 dark:text-neutral-500 mb-1'>
                    cURL
                  </div>
                  <code className='text-sm text-black dark:text-white break-all block'>
                    {exampleCurl}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(exampleCurl, 'cURL command')}
                  className='p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors shrink-0'
                >
                  <Copy className='h-4 w-4' />
                </button>
              </div>
              <div className='group flex items-center gap-2 p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all'>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs text-neutral-600 dark:text-neutral-500 mb-1'>
                    JavaScript
                  </div>
                  <code className='text-sm text-black dark:text-white break-all block'>
                    {exampleFetch}
                  </code>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(exampleFetch, 'JavaScript code')
                  }
                  className='p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors shrink-0'
                >
                  <Copy className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-black'
        >
          <TerminalButton
            variant='secondary'
            size='md'
            onClick={() => onOpenChange(false)}
          >
            Close
          </TerminalButton>
          <TerminalButton
            onClick={() => (window.location.href = '/create')}
            variant='primary'
            size='md'
          >
            Create Another API
          </TerminalButton>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
