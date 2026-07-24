'use client';

import React, { useState } from 'react';
import { Business } from '@/types';
import { toggleBusinessTrial } from '@/actions/super-admin/toggle-business-trial';

interface BusinessRowProps {
  business: Business;
}

export function BusinessRow({ business }: BusinessRowProps) {
  const [loading, setLoading] = useState(false);
  const trialActive = business.trial_enabled !== false; // Defaults to true

  const handleToggle = async () => {
    setLoading(true);
    await toggleBusinessTrial(business.id, trialActive);
    setLoading(false);
  };

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
      <td className="p-4">
        {business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logo_url} alt={business.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400">
            {business.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </td>
      <td className="p-4 font-medium text-white">{business.name}</td>
      <td className="p-4 text-gray-400">{business.slug}</td>
      <td className="p-4 text-gray-400">{business.plan || 'Free'}</td>
      <td className="p-4">
        {trialActive ? (
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg font-medium">Activo</span>
        ) : (
          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg font-medium">Expirado</span>
        )}
      </td>
      <td className="p-4 font-mono text-sm text-gray-400">
        {trialActive ? 'TRUE' : 'FALSE'}
      </td>
      <td className="p-4 text-sm text-gray-400">
        {new Date(business.created_at).toLocaleDateString()}
      </td>
      <td className="p-4 text-right">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
            trialActive
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {loading ? '...' : trialActive ? 'Desactivar Trial' : 'Activar Trial'}
        </button>
      </td>
    </tr>
  );
}
