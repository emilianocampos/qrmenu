-- add_waiters_system.sql
-- =========================================================================
-- MIGRACIÓN PARA GESTIÓN DE MOZOS Y VINCULACIÓN MAXIREST (MULTI-NEGOCIO)
-- Ejecutar en el Editor SQL de Supabase (SQL Editor -> New Query -> Run)
-- =========================================================================

-- 1. Añadir switch de mozos en la tabla de negocios
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS waiter_assignment_enabled boolean DEFAULT false;

-- 2. Crear tabla dedicada de mozos por negocio
CREATE TABLE IF NOT EXISTS public.waiters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  maxirest_code text, -- Código numérico de mozo en MaxiRest (ej: '01', '02', '15')
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_business_waiter_name UNIQUE (business_id, name)
);

-- 3. Índices para velocidad de consulta en panel de pedidos
CREATE INDEX IF NOT EXISTS idx_waiters_business_id ON public.waiters(business_id);
CREATE INDEX IF NOT EXISTS idx_waiters_is_active ON public.waiters(is_active);

-- 4. Habilitar Seguridad por Filas (RLS)
ALTER TABLE public.waiters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lectura y gestión
DROP POLICY IF EXISTS "Permitir lectura de mozos" ON public.waiters;
CREATE POLICY "Permitir lectura de mozos" ON public.waiters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion de mozos" ON public.waiters;
CREATE POLICY "Permitir insercion de mozos" ON public.waiters FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de mozos" ON public.waiters;
CREATE POLICY "Permitir actualizacion de mozos" ON public.waiters FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion de mozos" ON public.waiters;
CREATE POLICY "Permitir eliminacion de mozos" ON public.waiters FOR DELETE USING (true);

-- 5. Función reutilizable para precargar mozos por defecto a cualquier negocio
CREATE OR REPLACE FUNCTION public.seed_default_waiters(target_business_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.waiters (business_id, name, maxirest_code) VALUES
    (target_business_id, 'Agustina', '01'),
    (target_business_id, 'Camila', '02'),
    (target_business_id, 'Facundo', '03'),
    (target_business_id, 'Juan', '04'),
    (target_business_id, 'Lucas', '05'),
    (target_business_id, 'Sofía', '06')
  ON CONFLICT (business_id, name) DO UPDATE 
    SET is_active = true, maxirest_code = EXCLUDED.maxirest_code;
END;
$$;

-- 6. Precargar automáticamente los mozos por defecto en todos los negocios existentes
DO $$
DECLARE
  b_record RECORD;
BEGIN
  FOR b_record IN SELECT id FROM public.businesses LOOP
    PERFORM public.seed_default_waiters(b_record.id);
  END LOOP;
END;
$$;

-- =========================================================================
-- EJEMPLO: CÓMO CARGAR MOZOS PERSONALIZADOS PARA OTRO NEGOCIO EN EL FUTURO
-- Simplemente copia y ejecuta este bloque cambiando el slug ('muud')
-- y los nombres y códigos de MaxiRest:
-- =========================================================================
/*
WITH target_biz AS (
  SELECT id FROM public.businesses WHERE slug = 'muud' LIMIT 1
)
INSERT INTO public.waiters (business_id, name, maxirest_code)
SELECT 
  target_biz.id,
  w.name,
  w.maxirest_code
FROM target_biz
CROSS JOIN (
  VALUES
    ('Lucas', '01'),
    ('Sofía', '02'),
    ('Facundo', '03'),
    ('Camila', '04'),
    ('Juan', '05'),
    ('Agustina', '06'),
    ('Gonzalo', '07'),
    ('Martina', '08')
) AS w(name, maxirest_code)
ON CONFLICT (business_id, name) 
DO UPDATE SET maxirest_code = EXCLUDED.maxirest_code, is_active = true;
*/
