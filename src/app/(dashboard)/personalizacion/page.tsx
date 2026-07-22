import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomizationClient } from './CustomizationClient';
import { Business } from '@/types';

export default async function PersonalizacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard');
  
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('business_id', business.id)
    .single();
    
  let businessData = { ...business };
  if (settings) {
    businessData = { ...businessData, ...settings, id: business.id };
  }

  return <CustomizationClient business={businessData as Business} />;
}
