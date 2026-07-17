-- 1. Añadir columnas de personalización faltantes a la tabla de businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS about_title text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS about_description text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS banner_image text;

-- 2. Crear tabla de reviews si no existe
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  comment text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS reviews_business_id_idx ON public.reviews (business_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);

-- 4. Habilitar RLS en reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews." ON public.reviews FOR INSERT WITH CHECK (true);
