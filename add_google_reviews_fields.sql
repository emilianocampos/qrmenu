-- Agregar columnas para Reseñas de Google y Sobre Nosotros en la tabla businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS show_about_us BOOLEAN DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS google_reviews_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS google_reviews_url TEXT;
