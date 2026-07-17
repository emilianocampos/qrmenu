'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-24 space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 mx-auto" />
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-1/2 mx-auto" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-3/4 mx-auto" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-14 bg-neutral-200 dark:bg-neutral-800 rounded-2xl max-w-xl mx-auto" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 space-y-4 bg-neutral-100/50 dark:bg-neutral-900/30">
            <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
            <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-2/3" />
            <div className="space-y-2">
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-4/5" />
            </div>
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
