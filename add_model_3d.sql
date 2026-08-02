-- Agregar columnas a la tabla products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS model_3d_url text,
ADD COLUMN IF NOT EXISTS model_3d_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS model_3d_generated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS model_3d_task_id text;

-- Crear el bucket de storage (si no existe)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-models', 'product-models', true)
ON CONFLICT (id) DO NOTHING;
