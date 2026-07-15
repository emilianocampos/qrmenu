import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CategoriesClient } from './CategoriesClient';
import { Category, Business } from '@/types';

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(count)')
    .eq('business_id', business.id)
    .order('item_order', { ascending: true });

  return (
    <CategoriesClient
      initialCategories={(categories ?? []) as Category[]}
      business={business as Business}
    />
  );
}
