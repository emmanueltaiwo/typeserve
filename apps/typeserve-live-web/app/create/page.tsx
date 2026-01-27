/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NavHeader } from '@/components/nav-header';
import { SuccessModal } from '@/components/success-modal';
import { ErrorBanner } from '@/components/create/error-banner';
import { APIConfigSection } from '@/components/create/api-config-section';
import { TypeScriptEditorSection } from '@/components/create/typescript-editor-section';
import { RoutesSection } from '@/components/create/routes-section';
import { InfoPanel } from '@/components/create/info-panel';
import { TerminalButton } from '@/components/landing/terminal-button';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { createServer, type CreateRouteRequest } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const DEFAULT_TYPES = `export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
};`;

export default function CreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capacityCountdown, setCapacityCountdown] = useState<number | null>(
    null
  );
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    subdomain: string;
    expiresAt: string;
    routes: CreateRouteRequest[];
  } | null>(null);

  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<string>('30');
  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [routes, setRoutes] = useState<CreateRouteRequest[]>([
    { method: 'GET', path: '/users', responseType: 'User[]' },
  ]);

  const subdomain = name
    ? `${name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.typeserve.live`
    : 'your-api.typeserve.live';

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addRoute = () => {
    setRoutes([...routes, { method: 'GET', path: '/', responseType: 'User' }]);
  };

  const removeRoute = (index: number) => {
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const updateRoute = (
    index: number,
    field: keyof CreateRouteRequest,
    value: string
  ) => {
    const updated = [...routes];
    const currentRoute = updated[index];

    if (!currentRoute) return;

    // Type-safe update ensuring all required fields are present
    const updatedRoute: CreateRouteRequest = {
      method:
        field === 'method'
          ? (value as CreateRouteRequest['method'])
          : currentRoute.method,
      path: field === 'path' ? value : currentRoute.path,
      responseType:
        field === 'responseType' ? value : currentRoute.responseType,
    };

    updated[index] = updatedRoute;
    setRoutes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCapacityCountdown(null);
    setLoading(true);

    try {
      if (!name || !/^[a-z0-9-]+$/.test(name.toLowerCase())) {
        const errorMsg =
          'API name must contain only lowercase letters, numbers, and hyphens';
        setError(errorMsg);
        toast.error('Validation Error', { description: errorMsg });
        setLoading(false);
        return;
      }

      if (routes.length === 0) {
        const errorMsg = 'At least one route is required';
        setError(errorMsg);
        toast.error('Validation Error', { description: errorMsg });
        setLoading(false);
        return;
      }

      const expirationMinutes = parseInt(expiration);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes + 1);

      const response = await createServer({
        name: name.toLowerCase(),
        expiresAt: expiresAt.toISOString(),
        routes,
        types,
      });

      setSuccessData({
        subdomain: response.subdomain,
        expiresAt: response.expiresAt,
        routes: routes,
      });
      setSuccessModalOpen(true);
      toast.success('API created successfully!');
    } catch (err: any) {
      if (err.error === 'capacity_reached') {
        setCapacityCountdown(err.nextAvailableInSeconds);
        setError(
          `Server capacity reached. Next available in ${formatTime(err.nextAvailableInSeconds)}`
        );
        toast.error('Server capacity reached', {
          description: `Try again in ${formatTime(err.nextAvailableInSeconds)}`,
        });
      } else if (err.error === 'duplicate_subdomain') {
        setError(
          `Subdomain ${err.subdomain} is already taken. Please choose a different name.`
        );
        toast.error('Subdomain already taken');
      } else {
        const message = err.message || 'Failed to create server';
        setError(message);
        toast.error('Failed to create API', { description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (capacityCountdown !== null && capacityCountdown > 0) {
      const interval = setInterval(() => {
        setCapacityCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [capacityCountdown]);

  return (
    <div className='min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono'>
      <NavHeader />

      <main className='container mx-auto px-6 py-12 max-w-6xl'>
        {/* Terminal-style command prompt */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className='mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800'
        >
          <div className='flex items-center gap-3'>
            <span className='text-xs text-blue-600 dark:text-blue-400'>~</span>
            <span className='text-xs text-neutral-400 dark:text-neutral-600 mx-2'>
              $
            </span>
            <Link
              href='/'
              className='text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1'
            >
              <ArrowLeft className='h-3 w-3' />
              Back to Home
            </Link>
          </div>
        </motion.div>

        <ErrorBanner error={error} capacityCountdown={capacityCountdown} />

        <form onSubmit={handleSubmit} className='space-y-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 space-y-8'>
              <APIConfigSection
                name={name}
                setName={setName}
                expiration={expiration}
                setExpiration={setExpiration}
                subdomain={subdomain}
              />
              <TypeScriptEditorSection types={types} setTypes={setTypes} />
              <RoutesSection
                routes={routes}
                addRoute={addRoute}
                removeRoute={removeRoute}
                updateRoute={updateRoute}
              />
            </div>
            <div className='lg:col-span-1'>
              <InfoPanel />
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='flex items-center justify-end gap-4 pt-8 border-t border-neutral-200 dark:border-neutral-800'
          >
            <TerminalButton href='/' variant='secondary' size='lg'>
              Cancel
            </TerminalButton>
            <TerminalButton
              type='submit'
              variant='primary'
              size='lg'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Create API
                </>
              )}
            </TerminalButton>
          </motion.div>
        </form>
      </main>

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          subdomain={successData.subdomain}
          expiresAt={successData.expiresAt}
          routes={successData.routes}
        />
      )}
    </div>
  );
}
