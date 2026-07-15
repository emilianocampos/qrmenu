-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BUSINESSES
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  logo_url text,
  color_primary text default '#000000',
  color_secondary text default '#ffffff',
  typography text default 'Inter',
  theme text default 'light',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  item_order integer default 0,
  is_visible boolean default true,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  item_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Policies for Businesses
create policy "Businesses are viewable by everyone." on public.businesses for select using (true);
create policy "Users can insert their own business." on public.businesses for insert with check (auth.uid() = owner_id);
create policy "Users can update own business." on public.businesses for update using (auth.uid() = owner_id);
create policy "Users can delete own business." on public.businesses for delete using (auth.uid() = owner_id);

-- Policies for Categories
create policy "Categories are viewable by everyone." on public.categories for select using (true);
create policy "Users can insert categories for their businesses." on public.categories for insert with check (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Users can update categories for their businesses." on public.categories for update using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Users can delete categories for their businesses." on public.categories for delete using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);

-- Policies for Products
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Users can insert products for their businesses." on public.products for insert with check (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Users can update products for their businesses." on public.products for update using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Users can delete products for their businesses." on public.products for delete using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);

-- TRIGGER for new user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SETTINGS
create table if not exists public.settings (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null unique,
  email text,
  whatsapp text,
  instagram text,
  facebook text,
  address text,
  schedule text,
  language text default 'Español',
  currency text default 'ARS',
  plan text default 'Demo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BUSINESS VIEWS
create table if not exists public.business_views (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCT VIEWS
create table if not exists public.product_views (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.settings enable row level security;
alter table public.business_views enable row level security;
alter table public.product_views enable row level security;

-- Policies for Settings
create policy "Settings are viewable by everyone." on public.settings for select using (true);
create policy "Users can update settings for their businesses." on public.settings for update using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Users can insert settings for their businesses." on public.settings for insert with check (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);

-- Policies for Business Views
create policy "Business views are viewable by business owners." on public.business_views for select using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Anyone can insert business views." on public.business_views for insert with check (true);

-- Policies for Product Views
create policy "Product views are viewable by business owners." on public.product_views for select using (
  business_id in (select id from public.businesses where owner_id = auth.uid())
);
create policy "Anyone can insert product views." on public.product_views for insert with check (true);

-- Trigger to auto-create settings when a business is created
create or replace function public.handle_new_business()
returns trigger as $$
begin
  insert into public.settings (business_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_business_created
  after insert on public.businesses
  for each row execute procedure public.handle_new_business();

