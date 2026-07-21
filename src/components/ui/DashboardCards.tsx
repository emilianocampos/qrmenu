'use client';

import React from 'react';
import { Package, Tags, Eye, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

interface DashboardCardsProps {
  productsCount: number;
  categoriesCount: number;
  todayVisits: number;
  monthVisits: number;
}

export function DashboardCards({
  productsCount,
  categoriesCount,
  todayVisits,
  monthVisits,
}: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Productos"
        value={productsCount}
        icon={<Package className="w-5 h-5 text-blue-400" />}
        href="/productos"
      />
      <StatCard
        title="Total Categorías"
        value={categoriesCount}
        icon={<Tags className="w-5 h-5 text-violet-400" />}
        href="/categorias"
      />
      <StatCard
        title="Escaneos Hoy"
        value={todayVisits}
        icon={<Eye className="w-5 h-5 text-emerald-400" />}
      />
      <StatCard
        title="Escaneos del Mes"
        value={monthVisits}
        icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
      />
    </div>
  );
}
