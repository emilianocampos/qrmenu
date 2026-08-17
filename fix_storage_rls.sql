-- fix_storage_rls.sql
-- =========================================================================
-- CONFIGURACIÓN DE POLÍTICAS DE RLS PARA EL BUCKET DE MODELOS 3D ('product-models')
-- Ejecutar en tu Panel de Supabase -> SQL Editor -> Run
-- =========================================================================

-- 1. Asegurar que el bucket 'product-models' existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-models', 'product-models', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permitir lectura pública de los modelos 3D (.glb)
DROP POLICY IF EXISTS "Public Read Product Models" ON storage.objects;
CREATE POLICY "Public Read Product Models" ON storage.objects
FOR SELECT USING (bucket_id = 'product-models');

-- 3. Permitir a usuarios autenticados subir modelos 3D (.glb)
DROP POLICY IF EXISTS "Authenticated Upload Product Models" ON storage.objects;
CREATE POLICY "Authenticated Upload Product Models" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-models');

-- 4. Permitir a usuarios autenticados actualizar modelos 3D (.glb)
DROP POLICY IF EXISTS "Authenticated Update Product Models" ON storage.objects;
CREATE POLICY "Authenticated Update Product Models" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-models');

-- 5. Permitir a usuarios autenticados eliminar modelos 3D (.glb)
DROP POLICY IF EXISTS "Authenticated Delete Product Models" ON storage.objects;
CREATE POLICY "Authenticated Delete Product Models" ON storage.objects
FOR DELETE USING (bucket_id = 'product-models');
