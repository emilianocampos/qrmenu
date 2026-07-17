import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QRPageClient } from './QRPageClient';
import { Business } from '@/types';

export default async function QRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://myqrmenu-sweet.vercel.app'}/c/${business.slug}`;

  return <QRPageClient business={business as Business} publicUrl={publicUrl} />;
}
