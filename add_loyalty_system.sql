-- add_loyalty_system.sql
-- =========================================================================
-- MIGRACIÓN PARA SISTEMA DE FIDELIZACIÓN Y SELLOS DIGITALES
-- Ejecutar en el Editor SQL de Supabase (SQL Editor -> New Query -> Run)
-- =========================================================================

-- 1. Añadir campos de fidelización a la tabla de negocios
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS loyalty_enabled boolean DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS loyalty_stamps_required integer DEFAULT 5;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS loyalty_reward_title text DEFAULT '¡Premio de Fidelidad!';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS loyalty_reward_description text DEFAULT 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.';

-- 2. Tabla de clientes de fidelización por negocio
CREATE TABLE IF NOT EXISTS public.customer_loyalty (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  stamps_count integer DEFAULT 0 CHECK (stamps_count >= 0),
  total_stamps_earned integer DEFAULT 0 CHECK (total_stamps_earned >= 0),
  rewards_redeemed integer DEFAULT 0 CHECK (rewards_redeemed >= 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_business_customer_email UNIQUE (business_id, customer_email)
);

-- 3. Tabla de registro diario de sellos (garantiza máximo 1 sello por día)
CREATE TABLE IF NOT EXISTS public.loyalty_stamps_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  loyalty_id uuid REFERENCES public.customer_loyalty(id) ON DELETE CASCADE NOT NULL,
  stamp_date date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_loyalty_stamp_per_day UNIQUE (loyalty_id, stamp_date)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_business_id ON public.customer_loyalty(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_email ON public.customer_loyalty(customer_email);
CREATE INDEX IF NOT EXISTS idx_loyalty_stamps_log_loyalty_id ON public.loyalty_stamps_log(loyalty_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_stamps_log_date ON public.loyalty_stamps_log(stamp_date);

-- Habilitar RLS
ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_stamps_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Public select customer loyalty" ON public.customer_loyalty;
CREATE POLICY "Public select customer loyalty" ON public.customer_loyalty FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert customer loyalty" ON public.customer_loyalty;
CREATE POLICY "Public insert customer loyalty" ON public.customer_loyalty FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update customer loyalty" ON public.customer_loyalty;
CREATE POLICY "Public update customer loyalty" ON public.customer_loyalty FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public select loyalty stamps log" ON public.loyalty_stamps_log;
CREATE POLICY "Public select loyalty stamps log" ON public.loyalty_stamps_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert loyalty stamps log" ON public.loyalty_stamps_log;
CREATE POLICY "Public insert loyalty stamps log" ON public.loyalty_stamps_log FOR INSERT WITH CHECK (true);
