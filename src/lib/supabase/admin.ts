import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con Service Role Key para saltarse RLS en operaciones de Super Admin
export const createAdminClient = () => {
  // Asegurarnos de que las variables de entorno existan
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Advertencia: Faltan variables de entorno para el cliente de Supabase Admin (SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
