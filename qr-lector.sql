-- Crear tabla de visitas únicas al menú
CREATE TABLE IF NOT EXISTS menu_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Índices para optimizar las consultas del Dashboard
CREATE INDEX IF NOT EXISTS idx_menu_visits_business_id ON menu_visits(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_visits_visit_date ON menu_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_menu_visits_visitor_id ON menu_visits(visitor_id);

-- Restricción UNIQUE para asegurar solo 1 registro por visitante por negocio por día
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_visit_per_day'
  ) THEN
    ALTER TABLE menu_visits ADD CONSTRAINT unique_visit_per_day UNIQUE(business_id, visitor_id, visit_date);
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE menu_visits ENABLE ROW LEVEL SECURITY;

-- Política: Los dueños de los negocios pueden leer sus propias estadísticas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Dueños pueden ver estadísticas de sus negocios' AND tablename = 'menu_visits'
  ) THEN
    CREATE POLICY "Dueños pueden ver estadísticas de sus negocios"
      ON menu_visits FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM businesses
          WHERE businesses.id = menu_visits.business_id
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Política: Permitir inserción anónima (validado por constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Permitir insertar visitas anónimas' AND tablename = 'menu_visits'
  ) THEN
    CREATE POLICY "Permitir insertar visitas anónimas"
      ON menu_visits FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
