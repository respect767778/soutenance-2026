-- ============================================================
-- SUNU CONTENU — Schéma de base de données (Supabase / PostgreSQL)
-- À exécuter dans le SQL Editor de Supabase (ou via `supabase db push`).
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Types énumérés
-- ------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'editeur', 'auteur', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_type as enum ('ebook', 'cours', 'video', 'document', 'audio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('brouillon', 'soumis', 'publie', 'rejete', 'archive');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2. Tables
-- ------------------------------------------------------------

-- Profils (étend la table auth.users de Supabase)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        public.user_role not null default 'client',
  bio         text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Catégories de contenus
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

-- Contenus numériques (produits)
create table if not exists public.contents (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete set null,
  title        text not null,
  slug         text not null unique,
  description  text,
  type         public.content_type not null default 'ebook',
  price        integer not null default 0 check (price >= 0), -- FCFA
  cover_url    text,
  file_url     text,
  status       public.content_status not null default 'brouillon',
  rejection_reason text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

-- Achats (sera alimenté par PayDunya à l'étape paiement)
create table if not exists public.purchases (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references public.profiles(id) on delete cascade,
  content_id     uuid not null references public.contents(id) on delete cascade,
  amount         integer not null,
  status         text not null default 'complete', -- complete | pending | fail
  paydunya_token text,
  created_at     timestamptz not null default now(),
  unique (buyer_id, content_id)
);

-- Avis / notes
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  unique (content_id, author_id)
);

-- Favoris (liste de souhaits)
create table if not exists public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- ------------------------------------------------------------
-- 3. Fonctions utilitaires (utilisées par les RLS)
-- ------------------------------------------------------------

create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

-- Personnel interne (admin + éditeur)
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('admin', 'editeur'), false);
$$;

-- ------------------------------------------------------------
-- 4. Trigger : création automatique du profil à l'inscription
--    (Le rôle "admin"/"editeur" ne peut PAS être auto-attribué ici,
--     afin d'éviter toute escalade de privilèges.)
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data->>'role' = 'auteur'
         then 'auteur'::public.user_role
         else 'client'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger : mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contents_updated on public.contents;
create trigger trg_contents_updated
  before update on public.contents
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5. Row-Level Security (permissions par rôle)
-- ------------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.categories enable row level security;
alter table public.contents   enable row level security;
alter table public.purchases  enable row level security;
alter table public.reviews    enable row level security;
alter table public.favorites  enable row level security;

-- --- profils ---
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true); -- le nom des auteurs est public

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated using (public.is_admin()) with check (true);

-- --- catégories ---
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
  for select using (true);

drop policy if exists "categories_manage_staff" on public.categories;
create policy "categories_manage_staff" on public.categories
  for all to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

-- --- contenus ---
drop policy if exists "contents_select_published" on public.contents;
create policy "contents_select_published" on public.contents
  for select using (status = 'publie');

drop policy if exists "contents_select_own" on public.contents;
create policy "contents_select_own" on public.contents
  for select to authenticated using (author_id = auth.uid());

drop policy if exists "contents_select_staff" on public.contents;
create policy "contents_select_staff" on public.contents
  for select to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

drop policy if exists "contents_insert_own" on public.contents;
create policy "contents_insert_own" on public.contents
  for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "contents_update_own" on public.contents;
create policy "contents_update_own" on public.contents
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "contents_update_staff" on public.contents;
create policy "contents_update_staff" on public.contents
  for update to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  ) with check (true);

drop policy if exists "contents_delete_own" on public.contents;
create policy "contents_delete_own" on public.contents
  for delete to authenticated using (author_id = auth.uid());

drop policy if exists "contents_delete_staff" on public.contents;
create policy "contents_delete_staff" on public.contents
  for delete to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

-- --- achats ---
drop policy if exists "purchases_select_buyer" on public.purchases;
create policy "purchases_select_buyer" on public.purchases
  for select to authenticated using (buyer_id = auth.uid());

drop policy if exists "purchases_select_author" on public.purchases;
create policy "purchases_select_author" on public.purchases
  for select to authenticated using (
    exists (
      select 1 from public.contents c
      where c.id = content_id and c.author_id = auth.uid()
    )
  );

drop policy if exists "purchases_select_staff" on public.purchases;
create policy "purchases_select_staff" on public.purchases
  for select to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

drop policy if exists "purchases_insert_buyer" on public.purchases;
create policy "purchases_insert_buyer" on public.purchases
  for insert to authenticated with check (buyer_id = auth.uid());

-- L'acheteur peut mettre à jour SA ligne (token PayDunya, réinitialisation),
-- mais ne peut JAMAIS passer lui-même le statut en "complete".
drop policy if exists "purchases_update_buyer" on public.purchases;
create policy "purchases_update_buyer" on public.purchases
  for update to authenticated
  using (buyer_id = auth.uid())
  with check (
    buyer_id = auth.uid()
    and status in ('pending', 'cancelled', 'fail')
  );

-- --- avis ---
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated using (
    author_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

-- --- favoris ---
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- 6. Index utiles
-- ------------------------------------------------------------
create index if not exists contents_status_idx    on public.contents(status);
create index if not exists contents_author_idx    on public.contents(author_id);
create index if not exists contents_category_idx  on public.contents(category_id);
create index if not exists purchases_buyer_idx    on public.purchases(buyer_id);
create index if not exists purchases_content_idx  on public.purchases(content_id);

-- ============================================================
-- À FAIRE APRÈS AVOIR CRÉÉ VOTRE PREMIER COMPTE ADMIN :
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users order by created_at asc limit 1);
-- ============================================================
