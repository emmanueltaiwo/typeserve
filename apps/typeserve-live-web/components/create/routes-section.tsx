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
import { Plus, Route, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { CreateRouteRequest } from '@/lib/api';

interface RoutesSectionProps {
  routes: CreateRouteRequest[];
  addRoute: () => void;
  removeRoute: (index: number) => void;
  updateRoute: (
    index: number,
    field: keyof CreateRouteRequest,
    value: string
  ) => void;
}

export function RoutesSection({
  routes,
  addRoute,
  removeRoute,
  updateRoute,
}: RoutesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className='rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-8 space-y-6'
    >
      {/* Terminal-style header */}
      <div className='flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded border border-neutral-300 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950'>
              <Route className='h-4 w-4 text-neutral-700 dark:text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold mb-1 text-neutral-900 dark:text-white font-mono'>
                API Routes
              </h2>
              <p className='text-sm text-neutral-600 dark:text-neutral-400 font-mono'>
                Define your API endpoints
              </p>
            </div>
          </div>
        </div>
        <button
          type='button'
          onClick={addRoute}
          disabled={routes.length >= 10}
          className='inline-flex items-center justify-center font-mono border transition-all bg-transparent text-black dark:text-white border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 h-9 px-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Route
        </button>
      </div>

      {routes.length === 0 ? (
        <div className='text-center py-12 text-neutral-600 dark:text-neutral-500 font-mono'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <span className='text-xs text-neutral-400 dark:text-neutral-600'>
              $
            </span>
            <span>No routes yet. Add your first route to get started.</span>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          {routes.map((route, index) => (
            <div
              key={index}
              className='p-5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-4'
            >
              {/* Terminal-style route header */}
              <div className='flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800'>
                <span className='text-xs text-green-600 dark:text-green-400'>
                  $
                </span>
                <span className='text-xs text-neutral-600 dark:text-neutral-400'>
                  Route {index + 1}
                </span>
              </div>
              <div className='flex items-end justify-between gap-4'>
                <div className='flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label className='text-neutral-600 dark:text-neutral-400 text-xs font-mono'>
                      Method
                    </Label>
                    <Select
                      value={route.method}
                      onValueChange={(value) =>
                        updateRoute(
                          index,
                          'method',
                          value as CreateRouteRequest['method']
                        )
                      }
                    >
                      <SelectTrigger className='font-mono bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-white dark:bg-black border-neutral-300 dark:border-neutral-800'>
                        <SelectItem
                          value='GET'
                          className='font-mono text-neutral-900 dark:text-white focus:bg-neutral-100 dark:focus:bg-neutral-900'
                        >
                          GET
                        </SelectItem>
                        <SelectItem
                          value='POST'
                          className='font-mono text-neutral-900 dark:text-white focus:bg-neutral-100 dark:focus:bg-neutral-900'
                        >
                          POST
                        </SelectItem>
                        <SelectItem
                          value='PUT'
                          className='font-mono text-neutral-900 dark:text-white focus:bg-neutral-100 dark:focus:bg-neutral-900'
                        >
                          PUT
                        </SelectItem>
                        <SelectItem
                          value='DELETE'
                          className='font-mono text-neutral-900 dark:text-white focus:bg-neutral-100 dark:focus:bg-neutral-900'
                        >
                          DELETE
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-neutral-600 dark:text-neutral-400 text-xs font-mono'>
                      Path
                    </Label>
                    <Input
                      value={route.path}
                      onChange={(e) =>
                        updateRoute(index, 'path', e.target.value)
                      }
                      placeholder='/users'
                      required
                      className='font-mono bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-neutral-600 dark:text-neutral-400 text-xs font-mono'>
                      Response Type
                    </Label>
                    <Input
                      value={route.responseType}
                      onChange={(e) =>
                        updateRoute(index, 'responseType', e.target.value)
                      }
                      placeholder='User[]'
                      required
                      className='font-mono bg-white dark:bg-black border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500'
                    />
                  </div>
                </div>
                {routes.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeRoute(index)}
                    className='shrink-0 p-2 rounded border border-neutral-300 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
