import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ModelsClient } from './ModelsClient';
import { Product, Business } from '@/types';
import { getProductsWithModels } from '@/actions/models';

export default async function ModelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const { data: products } = await getProductsWithModels(business.id);

  return (
    <ModelsClient
      initialProducts={(products ?? []) as Product[]}
      business={business as Business}
    />
  );
}
