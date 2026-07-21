-- Agregar columna layout_style a businesses
alter table public.businesses add column if not exists layout_style text default 'grid';
