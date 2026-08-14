'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartCardProps {
  title: string;
  description?: string;
  data: { name: string; total: number }[];
  color?: string;
  valuePrefix?: string;
}

export function BarChartCard({ title, description, data, color = '#6366f1', valuePrefix = '$' }: BarChartCardProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="h-64">
        {data.length === 0 || data.every(d => d.total === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-sm">
            <p>No hay ventas registradas en los últimos días.</p>
            <p className="text-xs text-gray-600 mt-1">Los ingresos se registran al marcar pedidos como entregados.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${valuePrefix}${val}`}
              />
              <Tooltip
                formatter={(value) => [`${valuePrefix}${Number(value || 0).toLocaleString()}`, 'Ganancias']}
                contentStyle={{
                  backgroundColor: '#161616',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar
                dataKey="total"
                fill={color}
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
