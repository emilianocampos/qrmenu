-- 1. Agregar campos de promociones a la tabla businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS promo_active boolean DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS promo_title text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS promo_description text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS promo_image text;

-- 2. Crear el bucket 'promotions' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Crear politicas de seguridad para el bucket 'promotions'
-- Dar acceso publico de lectura
CREATE POLICY "Public Access Promotions"
ON storage.objects FOR SELECT
USING (bucket_id = 'promotions');

-- Permitir a usuarios autenticados subir imagenes de promo
CREATE POLICY "Authenticated Users can upload promotions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'promotions');

-- Permitir a usuarios autenticados actualizar imagenes de promo
CREATE POLICY "Users can update their own promotions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'promotions');

-- Permitir a usuarios autenticados borrar imagenes de promo
CREATE POLICY "Users can delete their own promotions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'promotions');

-- 4. Refrescar el esquema (Ya no es necesario NOTIFY)
