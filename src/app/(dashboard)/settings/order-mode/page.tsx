import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ModeSelector } from '@/components/orders/ModeSelector';
import { Store } from 'lucide-react';

export default async function OrderModePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, order_mode')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return (
      <div className="p-8 text-center text-gray-400">
        Debes configurar tu negocio primero.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Store className="w-8 h-8 text-indigo-400" />
          Modo de Pedidos
        </h1>
        <p className="text-gray-400 mt-2 text-sm max-w-2xl">
          Selecciona cómo quieres que tus clientes realicen pedidos desde la carta digital. Toda la aplicación (tanto el menú público como este panel) se adaptará automáticamente al modo que elijas.
        </p>
      </div>

      <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Modo Activo</h2>
        <ModeSelector businessId={business.id} initialMode={business.order_mode || 'menu_only'} />
      </div>
    </div>
  );
}
