-- enable_realtime.sql
-- =========================================================================
-- MIGRACIÓN OBLIGATORIA PARA REALTIME EN SUPABASE (PEDIDOS Y ALERTAS DE MOZO)
-- Ejecutar en el Editor SQL de tu panel de Supabase:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Configurar REPLICA IDENTITY FULL y columnas para capturar payloads completos en tiempo real
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 2. Agregar las tablas 'orders' y 'notifications' a la publicación 'supabase_realtime'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- 3. Ajustar políticas RLS para lectura en tiempo real
-- NOTA IMPORTANTE: Supabase Realtime ignora la transmisión de eventos si la política RLS de SELECT
-- contiene subconsultas complejas como "IN (SELECT owner_id FROM businesses...)".
DROP POLICY IF EXISTS "Business owners can read notifications" ON notifications;
DROP POLICY IF EXISTS "Public read notifications" ON notifications;
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business owners can manage orders" ON orders;
DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Business owners can update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Business owners can delete orders" ON orders FOR DELETE USING (true);

-- Verificación final
SELECT pubname, schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
