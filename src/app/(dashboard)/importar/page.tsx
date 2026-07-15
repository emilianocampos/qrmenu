import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ImportClient } from './ImportClient';
import { Business } from '@/types';

export default async function ImportarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  return <ImportClient business={business as Business} />;
}
