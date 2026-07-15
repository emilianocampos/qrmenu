import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Package, Tags, TrendingUp, Eye, Star, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

// Generate mock chart data for the last 7 days
function getWeekData() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return days.map(label => ({
    label,
    value: Math.floor(Math.random() * 80) + 10,
  }));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const [
    { count: productsCount },
    { count: categoriesCount },
    { data: featuredProducts },
    { data: recentProducts },
    { data: topCategories },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('products').select('*').eq('business_id', business.id).eq('is_featured', true).limit(3),
    supabase.from('products').select('*, category:categories(name)').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('categories').select('*, products(count)').eq('business_id', business.id).order('item_order').limit(5),
  ]);

  const chartData = getWeekData();

  return (
    <div>
      <PageHeader
        title={`¡Hola! 👋`}
        description={`Bienvenido al panel de ${business.name}`}
        action={
          <Link
            href={`/c/${business.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25"
          >
            <Eye className="w-4 h-4" />
            Ver Carta Pública
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Productos"
          value={productsCount ?? 0}
          icon={<Package className="w-5 h-5 text-blue-400" />}
          href="/productos"
        />
        <StatCard
          title="Categorías"
          value={categoriesCount ?? 0}
          icon={<Tags className="w-5 h-5 text-violet-400" />}
          href="/categorias"
        />
        <StatCard
          title="Escaneos hoy"
          value="—"
          icon={<Eye className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Escaneos del mes"
          value="—"
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ChartCard
            title="Visitas esta semana"
            description="Accesos a tu carta pública"
            data={chartData}
          />
        </div>

        {/* Activity */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Actividad reciente</h3>
          {recentProducts && recentProducts.length > 0 ? (
            <ul className="space-y-3">
              {recentProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{(p as any).category?.name ?? 'Sin categoría'}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-500 flex-shrink-0">
                    ${p.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Package className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">No hay productos aún</p>
              <Link href="/productos" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors">
                Crear primer producto →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Top Productos</h3>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          {featuredProducts && featuredProducts.length > 0 ? (
            <ul className="space-y-3">
              {featuredProducts.map((p, idx) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-gray-600 font-mono">{idx + 1}</span>
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="flex-1 text-sm text-gray-300 truncate">{p.name}</span>
                  <span className="text-xs font-medium text-amber-400">Destacado</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Star className="w-8 h-8 text-gray-600" />}
              title="Sin destacados"
              description="Marca productos como destacados para verlos aquí"
            />
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Categorías</h3>
            <LayoutGrid className="w-4 h-4 text-violet-400" />
          </div>
          {topCategories && topCategories.length > 0 ? (
            <ul className="space-y-3">
              {topCategories.map((cat, idx) => {
                const count = (cat as any).products?.[0]?.count ?? 0;
                return (
                  <li key={cat.id} className="flex items-center gap-3">
                    <span className="w-6 text-xs text-gray-600 font-mono">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base">
                      {cat.icon ?? '📋'}
                    </div>
                    <span className="flex-1 text-sm text-gray-300 truncate">{cat.name}</span>
                    <span className="text-xs text-gray-500">{count} productos</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={<Tags className="w-8 h-8 text-gray-600" />}
              title="Sin categorías"
              description="Crea categorías para organizar tu menú"
            />
          )}
        </div>
      </div>
    </div>
  );
}
