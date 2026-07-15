import React from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  href?: string;
  gradient?: string;
}

export function StatCard({ title, value, icon, trend, href, gradient }: StatCardProps) {
  const content = (
    <div
      className={`
        p-6 rounded-2xl border border-white/10 flex flex-col justify-between
        hover:border-white/20 transition-all duration-300 group cursor-default
        ${gradient || 'bg-white/[0.03] hover:bg-white/[0.06]'}
        ${href ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
