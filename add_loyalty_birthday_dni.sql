-- add_loyalty_birthday_dni.sql
-- Migración para agregar DNI y Fecha de Nacimiento (cumpleaños) al sistema de fidelización,
-- además del beneficio y mensaje de WhatsApp de cumpleaños configurable por el negocio.

-- 1. Columnas en customer_loyalty (DNI como contraseña + fecha de nacimiento)
ALTER TABLE public.customer_loyalty
  ADD COLUMN IF NOT EXISTS customer_dni TEXT,
  ADD COLUMN IF NOT EXISTS customer_birthday DATE;

-- 2. Columnas en businesses (Beneficio y mensaje personalizado de WhatsApp para cumpleaños)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS loyalty_birthday_benefit TEXT,
  ADD COLUMN IF NOT EXISTS loyalty_birthday_message TEXT;

-- 3. Índices para búsquedas rápidas por DNI y cumpleaños
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_dni
  ON public.customer_loyalty (business_id, customer_dni);

CREATE INDEX IF NOT EXISTS idx_customer_loyalty_birthday
  ON public.customer_loyalty (business_id, customer_birthday);
