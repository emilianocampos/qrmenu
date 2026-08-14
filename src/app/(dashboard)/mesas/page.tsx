import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TablesClient } from './TablesClient';
import { getTables } from '@/actions/tables';
import { Business } from '@/types';

export default async function MesasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const tables = await getTables(business.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const publicUrl = `${siteUrl}/c/${business.slug}`;

  return (
    <TablesClient
      initialTables={tables}
      business={business as Business}
      publicUrl={publicUrl}
    />
  );
}
