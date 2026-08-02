import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { WelcomeEmptyState } from '@/components/dashboard/WelcomeEmptyState';
import { Business } from '@/types';
import { RealtimeProvider } from '@/providers/RealtimeProvider';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex">
      <Sidebar business={business as Business | null} />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden pt-16 md:pt-0 relative">
        <div className="absolute inset-0 flex items-start pt-4 justify-center pointer-events-none z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mambaqr.png" alt="" className="w-[600px] opacity-[0.15] object-contain" />
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col w-full h-full overflow-y-auto">
          {business ? (
            <RealtimeProvider businessId={business.id}>
              {/* Header with Bell */}
              <div className="sticky top-0 z-40 flex items-center justify-end px-6 py-4 md:px-8 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                 <NotificationBell businessId={business.id} />
              </div>
              
              <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </div>
            </RealtimeProvider>
          ) : (
            <WelcomeEmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
