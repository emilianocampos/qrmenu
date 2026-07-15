'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  description?: string;
  data: { label: string; value: number }[];
  color?: string;
}

export function ChartCard({ title, description, data, color = '#6366f1' }: ChartCardProps) {
  const chartData = data.map(d => ({ name: d.label, Visitas: d.value }));

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="Visitas"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color.replace('#', '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
