-- add_orders_module.sql

-- 1. Añadir order_mode a businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS order_mode text DEFAULT 'menu_only';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS order_mode_tour_seen boolean DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notification_sound_enabled boolean DEFAULT true;

-- 2. Crear restaurant_tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    table_number integer,
    table_name text,
    table_code text UNIQUE,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Crear orders
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL,
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

-- 4. Crear order_items
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1,
    unit_price numeric DEFAULT 0,
    observations text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Crear notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    type text, -- new_order, order_ready, order_cancelled, new_review, low_stock, trial_expiring, system
    title text,
    description text,
    reference_id uuid,
    reference_type text,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_business_id ON restaurant_tables(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- RLS
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies

-- Tables
CREATE POLICY "Public read active tables" ON restaurant_tables FOR SELECT USING (active = true);
CREATE POLICY "Business owners can manage tables" ON restaurant_tables FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));

-- Orders
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own orders by ID" ON orders FOR SELECT USING (true);
CREATE POLICY "Business owners can manage orders" ON orders FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));

-- Order Items
CREATE POLICY "Public insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Business owners can manage order items" ON order_items FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = (SELECT business_id FROM orders WHERE id = order_id)));

-- Notifications
CREATE POLICY "Business owners can read notifications" ON notifications FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Business owners can update notifications" ON notifications FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Business owners can delete notifications" ON notifications FOR DELETE USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);


-- Habilitar Supabase Realtime para las tablas necesarias
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table notifications;

