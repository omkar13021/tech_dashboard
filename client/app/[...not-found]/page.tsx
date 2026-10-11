'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Home, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

export default function NotFoundPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
            <AlertTriangle className="h-8 w-8 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Page Not Available
        </h1>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          The page you're looking for is currently unavailable. This could be due to maintenance, 
          restricted access, or the page may not exist yet.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
          
          <Link href="/dashboard">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Additional Options */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Looking for something else?
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/my-day"
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              My Day
            </Link>
            <Link
              href="/important"
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Important
            </Link>
            <Link
              href="/planned"
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Planned
            </Link>
            <Link
              href="/tasks"
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              All Tasks
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
