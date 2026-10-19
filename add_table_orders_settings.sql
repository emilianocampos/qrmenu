-- add_table_orders_settings.sql
-- Columnas para habilitar/deshabilitar pedidos desde la mesa y seguimiento de pedidos

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS table_orders_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS order_status_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_sound_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_vibrate_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_sound_tone TEXT DEFAULT 'chime_classic';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_sound_duration INTEGER DEFAULT 5;
