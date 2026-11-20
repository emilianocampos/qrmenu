'use client';

import React, { useState } from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AlwaysOnTopMonitor } from '@/components/notifications/AlwaysOnTopMonitor';
import { ModulesInfoModal, InfoButton } from '@/components/dashboard/ModulesInfoModal';

export function DashboardTopNav({ businessId, businessSlug }: { businessId: string; businessSlug?: string }) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <AlwaysOnTopMonitor businessId={businessId} />
        <InfoButton onClick={() => setInfoOpen(true)} variant="compact" />
        <NotificationBell businessId={businessId} />
      </div>

      <ModulesInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        businessSlug={businessSlug}
      />
    </>
  );
}
