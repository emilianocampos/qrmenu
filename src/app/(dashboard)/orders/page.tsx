import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrdersClient } from './OrdersClient';
import { getOrders } from '@/actions/orders';

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

  const initialOrders = await getOrders(business.id);

  return <OrdersClient businessId={business.id} initialOrders={initialOrders || []} orderMode={business.order_mode || 'menu_only'} />;
}
