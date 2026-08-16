import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLoyaltySettings, getLoyaltySubscribers } from '@/actions/loyalty';
import { LoyaltyClient } from './LoyaltyClient';

export default async function LoyaltyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');

  const [settings, subscribers] = await Promise.all([
    getLoyaltySettings(business.id),
    getLoyaltySubscribers(business.id),
  ]);

  return (
    <LoyaltyClient
      businessId={business.id}
      businessSlug={business.slug}
      initialSettings={settings}
      initialSubscribers={subscribers}
    />
  );
}
