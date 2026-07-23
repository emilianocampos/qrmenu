'use server';

import { createClient } from '@/lib/supabase/server';

export async function getVisitStatistics(businessId: string) {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Today
  const { count: todayCount, error: todayError } = await supabase
    .from('menu_visits')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('visit_date', startOfToday.toISOString().split('T')[0]);

  // Month
  const { count: monthCount, error: monthError } = await supabase
    .from('menu_visits')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('visit_date', startOfMonth.toISOString().split('T')[0]);

  // Total
  const { count: totalCount, error: totalError } = await supabase
    .from('menu_visits')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  // Last 7 days chart data
  const { data: weekVisits, error: weekError } = await supabase
    .from('menu_visits')
    .select('visit_date')
    .eq('business_id', businessId)
    .gte('visit_date', sevenDaysAgo.toISOString().split('T')[0]);

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateString = d.toISOString().split('T')[0];

    const count = (weekVisits || []).filter(v => v.visit_date === dateString).length;

    chartData.push({
      label: days[d.getDay()],
      value: count,
    });
  }

  const firstError = todayError || monthError || totalError || weekError;
  if (firstError) {
    // Si la tabla no existe (42P01), es porque falta correr la migración. Ignoramos silenciosamente.
    if (firstError.code !== '42P01') {
      console.error('Error fetching statistics:', JSON.stringify(firstError));
    }
  }

  return {
    today: todayCount || 0,
    month: monthCount || 0,
    total: totalCount || 0,
    chartData
  };
}
