import React from 'react';

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>
        <LoadingSkeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
        <LoadingSkeleton className="h-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LoadingSkeleton className="lg:col-span-2 h-72" />
        <LoadingSkeleton className="h-72" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <LoadingSkeleton className="h-10 w-64" />
        <LoadingSkeleton className="h-10 w-36" />
      </div>
      <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 flex items-center gap-4">
            <LoadingSkeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-1/3" />
              <LoadingSkeleton className="h-3 w-1/4" />
            </div>
            <LoadingSkeleton className="h-6 w-20 rounded-full" />
            <LoadingSkeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
