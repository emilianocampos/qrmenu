'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function ToastHelper({ message, type }: { message: string; type: 'success' | 'error' }) {
  useEffect(() => {
    if (message) {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }
  }, [message, type]);

  return null;
}
