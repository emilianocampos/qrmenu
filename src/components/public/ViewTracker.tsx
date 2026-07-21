'use client';

import { useEffect, useRef } from 'react';
import { registerBusinessView } from '@/actions/views';

export function ViewTracker({ businessId }: { businessId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      registerBusinessView(businessId).catch(console.error);
    }
  }, [businessId]);

  return null;
}
