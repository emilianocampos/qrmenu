-- add_subcategories.sql
-- Agrega soporte para subcategorías en los productos de la carta

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT DEFAULT NULL;

-- Índice para mejorar el filtrado y agrupamiento por subcategoría
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);

