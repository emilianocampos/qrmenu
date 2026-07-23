'use client';

import React from 'react';
import { QrCode } from 'lucide-react';

interface VisitStatsCardProps {
  today: number;
  month: number;
  total: number;
}

export function VisitStatsCard({ today, month, total }: VisitStatsCardProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <QrCode className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-white">Escaneos QR (Únicos)</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 mb-1">Hoy</span>
          <span className="text-2xl font-bold text-white">{today}</span>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-4">
          <span className="text-xs text-gray-400 mb-1">Este mes</span>
          <span className="text-2xl font-bold text-white">{month}</span>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-4">
          <span className="text-xs text-gray-400 mb-1">Total</span>
          <span className="text-2xl font-bold text-white">{total}</span>
        </div>
      </div>
    </div>
  );
}
