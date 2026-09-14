import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrdersClient } from './OrdersClient';
import { getOrders } from '@/actions/orders';
import { getWaiterSettings } from '@/actions/waiters';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, order_mode')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return <div className="p-8 text-center">Debes configurar tu negocio primero.</div>;
  }

  const [initialOrders, waiterSettings] = await Promise.all([
    getOrders(business.id),
    getWaiterSettings(business.id),
  ]);

  return (
    <OrdersClient
      businessId={business.id}
      initialOrders={initialOrders || []}
      orderMode={business.order_mode || 'menu_only'}
      waiterSettings={waiterSettings}
    />
  );
}
