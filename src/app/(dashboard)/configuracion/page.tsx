import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './SettingsClient';
import { Business } from '@/types';

export default async function ConfiguracionPage() {
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
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
  ]);

  return (
    <SettingsClient
      business={business as Business}
      productsCount={productsCount ?? 0}
      categoriesCount={categoriesCount ?? 0}
      userEmail={user.email ?? ''}
    />
  );
}
