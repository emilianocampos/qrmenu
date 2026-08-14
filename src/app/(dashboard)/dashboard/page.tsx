import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Package, Tags, TrendingUp, Eye, Star, LayoutGrid, ShoppingBag, DollarSign, Trophy } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { BarChartCard } from '@/components/ui/BarChartCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { getVisitStatistics } from '@/actions/visits/get-statistics';
import { getSalesStatistics } from '@/actions/statistics/get-sales-stats';

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

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    visitStats,
    salesStats,
    { count: productsCount },
    { count: categoriesCount },
    { count: ordersTodayCount },
    { count: ordersMonthCount },
    { data: recentProducts },
    { data: topCategories },
  ] = await Promise.all([
    getVisitStatistics(business.id),
    getSalesStatistics(business.id),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', startOfToday.toISOString()),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', startOfMonth.toISOString()),
    supabase.from('products').select('*, category:categories(name)').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('categories').select('*, products(count)').eq('business_id', business.id).order('item_order').limit(5),
  ]);

  const medals = ['🥇', '🥈', '🥉', '4º', '5º'];

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

      {/* Main Stats Grid (Ventas & Pedidos en Principal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Ganado hoy"
          value={`$${salesStats.todayEarnings.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          href="/orders"
        />
        <StatCard
          title="Ganado del mes"
          value={`$${salesStats.monthEarnings.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          href="/orders"
        />
        <StatCard
          title="Pedidos hoy"
          value={ordersTodayCount ?? 0}
          icon={<ShoppingBag className="w-5 h-5 text-orange-400" />}
          href="/orders"
        />
        <StatCard
          title="Pedidos del mes"
          value={ordersMonthCount ?? 0}
          icon={<ShoppingBag className="w-5 h-5 text-orange-400" />}
          href="/orders"
        />
      </div>

      {/* Main Section: Gráfico de Barras de Ganancias + Productos Más Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico Principal de Ventas */}
        <div className="lg:col-span-2">
          <BarChartCard
            title="Ingresos por Ventas (Últimos 7 días)"
            description="Total acumulado de pedidos entregados ($)"
            data={salesStats.earningsChartData}
            color="#10b981"
            valuePrefix="$"
          />
        </div>

        {/* Ranking Productos Más Pedidos */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/8">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Productos más pedidos
            </h3>
          </div>

          {salesStats.topProducts && salesStats.topProducts.length > 0 ? (
            <ul className="space-y-3">
              {salesStats.topProducts.map((p, idx) => (
                <li key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="w-7 text-sm font-bold flex items-center justify-center text-gray-300">
                    {medals[idx] || `${idx + 1}º`}
                  </span>
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.count} pedido{p.count !== 1 ? 's' : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Trophy className="w-8 h-8 text-gray-600" />}
              title="Sin pedidos registrados"
              description="A medida que entregues pedidos verás aquí el ranking de tus productos estrella."
            />
          )}
        </div>
      </div>

      {/* Secondary Stats Section (Escaneos & Gestión de Carta) */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Resumen de Tráfico y Menú
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Escaneos hoy"
            value={visitStats.today}
            icon={<Eye className="w-5 h-5 text-indigo-400" />}
          />
          <StatCard
            title="Escaneos del mes"
            value={visitStats.month}
            icon={<TrendingUp className="w-5 h-5 text-violet-400" />}
          />
          <StatCard
            title="Productos en carta"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Visitas / Escaneos */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Escaneos de QR (Últimos 7 días)"
              description="Visitas de clientes a la carta digital"
              data={visitStats.chartData}
              color="#6366f1"
            />
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Últimos productos añadidos</h3>
            {recentProducts && recentProducts.length > 0 ? (
              <ul className="space-y-3">
                {recentProducts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{(p as any).category?.name ?? 'Sin categoría'}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
                      ${Number(p.price).toFixed(2)}
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
      </div>
    </div>
  );
}
