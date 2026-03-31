-- 004_catalog_entries.sql
-- Ingredient Catalog: per-user storage for ingredient metadata (price, store, type, etc.)

-- catalog_entries
create table public.catalog_entries (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null check (length(trim(name)) >= 1),
  price        numeric(12,0),
  unit         text,
  store_name   text,
  store_type   text check (
    store_type is null or store_type in ('fresh','frozen','dry','canned','other')
  ),
  seller_phone text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index: fast lookup by user + case-insensitive name (for Grocery List enrichment)
create index catalog_entries_user_name_idx
  on public.catalog_entries (user_id, lower(name));

-- RLS
alter table public.catalog_entries enable row level security;

create policy "Users can manage own catalog entries"
  on public.catalog_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_catalog_entries_updated_at
  before update on public.catalog_entries
  for each row execute function public.set_updated_at();
