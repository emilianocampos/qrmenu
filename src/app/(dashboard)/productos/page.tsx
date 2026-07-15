import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProductsClient } from './ProductsClient';
import { Product, Category, Business } from '@/types';

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('item_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .eq('business_id', business.id)
      .order('item_order', { ascending: true }),
  ]);

  return (
    <ProductsClient
      initialProducts={(products ?? []) as Product[]}
      categories={(categories ?? []) as Category[]}
      business={business as Business}
    />
  );
}
