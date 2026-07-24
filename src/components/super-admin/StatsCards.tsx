import React from 'react';
import { Store, CheckCircle, XCircle } from 'lucide-react';
import { Business } from '@/types';

interface StatsCardsProps {
  businesses: Business[];
}

export function StatsCards({ businesses }: StatsCardsProps) {
  const total = businesses.length;
  const active = businesses.filter(b => b.trial_enabled !== false).length;
  const inactive = total - active;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Store className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Negocios</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Trial Activo</p>
          <p className="text-2xl font-bold text-white">{active}</p>
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <XCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Trial Inactivo</p>
          <p className="text-2xl font-bold text-white">{inactive}</p>
        </div>
      </div>
    </div>
  );
}
