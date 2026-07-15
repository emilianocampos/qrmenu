import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp, Eye, Package, Tags, Clock } from 'lucide-react';
import { Business } from '@/types';

function generateMockWeekData() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return days.map(label => ({ label, value: Math.floor(Math.random() * 120) + 20 }));
}

function generateMockMonthData() {
  return Array.from({ length: 30 }, (_, i) => ({
    label: `Día ${i + 1}`,
    value: Math.floor(Math.random() * 200) + 10,
  }));
}

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  // Check if plan is Demo
  const isDemoPlan = (business as Business & { plan?: string }).plan === 'demo';

  if (isDemoPlan) {
    return (
      <div>
        <PageHeader
          title="Estadísticas"
          description="Analíticas de tu carta digital"
          breadcrumb={[{ label: 'Dashboard' }, { label: 'Estadísticas' }]}
        />
        <EmptyState
          icon="📊"
          title="Estadísticas no disponibles en Demo"
          description="Actualizá tu plan para acceder a estadísticas detalladas de visitas, productos más vistos y mucho más."
          action={
            <a
              href="/dashboard/configuracion"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
            >
              Ver planes →
            </a>
          }
        />
      </div>
    );
  }

  const [
    { data: products },
    { data: categories },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('business_id', business.id).limit(10),
    supabase.from('categories').select('*, products(count)').eq('business_id', business.id).limit(10),
  ]);

  const weekData = generateMockWeekData();
  const monthData = generateMockMonthData();
  const todayVisits = Math.floor(Math.random() * 40) + 5;
  const weekVisits = weekData.reduce((s, d) => s + d.value, 0);
  const monthVisits = monthData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <PageHeader
        title="Estadísticas"
        description="Analíticas de tu carta digital"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Estadísticas' }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Visitas hoy"
          value={todayVisits}
          icon={<Eye className="w-5 h-5 text-indigo-400" />}
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title="Visitas esta semana"
          value={weekVisits}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          trend={{ value: '8%', isPositive: true }}
        />
        <StatCard
          title="Visitas este mes"
          value={monthVisits}
          icon={<TrendingUp className="w-5 h-5 text-violet-400" />}
        />
        <StatCard
          title="Promedio diario"
          value={Math.round(weekVisits / 7)}
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Visitas esta semana"
          data={weekData}
          color="#6366f1"
        />
        <ChartCard
          title="Visitas este mes"
          data={monthData.slice(0, 14)}
          color="#8b5cf6"
        />
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Top 10 Productos</h3>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          {products && products.length > 0 ? (
            <ul className="space-y-3">
              {products.map((p, idx) => {
                const views = Math.floor(Math.random() * 100) + 1;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-gray-600 font-mono text-right">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{p.name}</p>
                      <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          style={{ width: `${(views / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{views} vistas</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Package className="w-8 h-8 text-gray-600" />} title="Sin datos" />
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Top 10 Categorías</h3>
            <Tags className="w-4 h-4 text-violet-400" />
          </div>
          {categories && categories.length > 0 ? (
            <ul className="space-y-3">
              {categories.map((cat, idx) => {
                const views = Math.floor(Math.random() * 100) + 1;
                return (
                  <li key={cat.id} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-gray-600 font-mono text-right">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{cat.name}</p>
                      <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                          style={{ width: `${(views / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{views} vistas</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Tags className="w-8 h-8 text-gray-600" />} title="Sin datos" />
          )}
        </div>
      </div>
    </div>
  );
}
