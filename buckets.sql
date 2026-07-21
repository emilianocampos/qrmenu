-- CREACIÓN DE BUCKETS Y POLÍTICAS DE ALMACENAMIENTO (STORAGE)

-- 1. Crear el bucket de logos (si no existe)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- 2. Crear el bucket de products (si no existe)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 3. Políticas para el bucket "logos"
create policy "Logos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'logos' );

create policy "Users can upload logos"
  on storage.objects for insert
  with check ( bucket_id = 'logos' AND auth.role() = 'authenticated' );

create policy "Users can update logos"
  on storage.objects for update
  using ( bucket_id = 'logos' AND auth.role() = 'authenticated' );

create policy "Users can delete logos"
  on storage.objects for delete
  using ( bucket_id = 'logos' AND auth.role() = 'authenticated' );

-- 4. Políticas para el bucket "products"
create policy "Products are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Users can upload products"
  on storage.objects for insert
  with check ( bucket_id = 'products' AND auth.role() = 'authenticated' );

create policy "Users can update products"
  on storage.objects for update
  using ( bucket_id = 'products' AND auth.role() = 'authenticated' );

create policy "Users can delete products"
  on storage.objects for delete
  using ( bucket_id = 'products' AND auth.role() = 'authenticated' );
