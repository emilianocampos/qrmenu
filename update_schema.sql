-- update_schema.sql - Migración Incremental Segura

-- 1. Añadir columnas de personalización faltantes a la tabla de businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS about_title text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS about_description text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS banner_image text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS order_mode text DEFAULT 'menu_only';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS order_mode_tour_seen boolean DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_sound_enabled boolean DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS notification_vibrate_enabled boolean DEFAULT true;

-- 2. Añadir icono opcional a categorías
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon text;

-- 3. Crear tabla de reviews si no existe
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  comment text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de mesas de restaurante (si no existe)
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  table_number integer,
  table_name text,
  table_code text UNIQUE,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Tabla de pedidos (si no existe)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  customer_first_name text,
  customer_last_name text,
  customer_phone text,
  customer_identifier text,
  comments text,
  status text DEFAULT 'pending', -- pending, accepted, preparing, ready, delivered, cancelled
  total numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Tabla de items de pedidos (si no existe)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price numeric DEFAULT 0,
  observations text,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Tabla de notificaciones (si no existe)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  type text, -- new_order, order_ready, order_cancelled, new_review, low_stock, trial_expiring, waiter_call, system
  title text,
  description text,
  reference_id uuid,
  reference_type text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 8. Tabla settings (si no existe) y campos adicionales
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text,
  phone text,
  whatsapp text,
  instagram text,
  facebook text,
  address text,
  schedule text,
  language text DEFAULT 'Español',
  currency text DEFAULT 'ARS',
  plan text DEFAULT 'Demo',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS vintage_color text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS vintage_color_mode text DEFAULT 'multicolor';

-- 9. Índices para optimizar rendimiento de consultas
CREATE INDEX IF NOT EXISTS reviews_business_id_idx ON public.reviews (business_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_business_id ON public.restaurant_tables(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON public.notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- 10. Habilitar RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11. Políticas de RLS con verificación IF NOT EXISTS
DO $$
BEGIN
  -- Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Reviews are viewable by everyone.') THEN
    CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert reviews.') THEN
    CREATE POLICY "Anyone can insert reviews." ON public.reviews FOR INSERT WITH CHECK (true);
  END IF;

  -- Restaurant Tables
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active tables') THEN
    CREATE POLICY "Public read active tables" ON public.restaurant_tables FOR SELECT USING (active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can manage tables') THEN
    CREATE POLICY "Business owners can manage tables" ON public.restaurant_tables FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
  END IF;

  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert orders') THEN
    CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read own orders by ID') THEN
    CREATE POLICY "Public read own orders by ID" ON orders FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can manage orders') THEN
    CREATE POLICY "Business owners can manage orders" ON orders FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
  END IF;

  -- Order Items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert order items') THEN
    CREATE POLICY "Public insert order items" ON order_items FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read order items') THEN
    CREATE POLICY "Public read order items" ON order_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can manage order items') THEN
    CREATE POLICY "Business owners can manage order items" ON order_items FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = (SELECT business_id FROM orders WHERE id = order_id)));
  END IF;

  -- Notifications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can read notifications') THEN
    CREATE POLICY "Business owners can read notifications" ON notifications FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can update notifications') THEN
    CREATE POLICY "Business owners can update notifications" ON notifications FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Business owners can delete notifications') THEN
    CREATE POLICY "Business owners can delete notifications" ON notifications FOR DELETE USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert notifications') THEN
    CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 12. Integración Mercado Pago y estado Paid
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS mp_access_token text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS mp_public_key text;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id text;

