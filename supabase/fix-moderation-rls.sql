-- ============================================================
-- SUNU CONTENU — CORRECTION de la modération (RLS staff)
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- ============================================================
-- PROBLÈME : l'éditeur et l'admin ne voyaient pas les contenus
-- "soumis" (en révision) alors que l'auteur les voyait.
-- CAUSE : la politique "contents_select_staff" reposait sur une
-- fonction security-definer. On la remplace par une vérification
-- DIRECTE sur public.profiles (plus robuste et sans dépendance).
-- SCRIPT IDEMPOTENT : réexécutable sans risque.

-- 0) (Re)crée les fonctions utilitaires (au cas où elles manqueraient)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('admin', 'editeur'), false);
$$;

-- ============================================================
-- 1) CONTENUS : lecture / modification par le personnel (admin + éditeur)
-- ============================================================
drop policy if exists "contents_select_staff" on public.contents;
create policy "contents_select_staff" on public.contents
  for select to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

drop policy if exists "contents_update_staff" on public.contents;
create policy "contents_update_staff" on public.contents
  for update to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  ) with check (true);

drop policy if exists "contents_delete_staff" on public.contents;
create policy "contents_delete_staff" on public.contents
  for delete to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

-- ============================================================
-- 2) CATÉGORIES : gestion par le personnel
-- ============================================================
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

-- ============================================================
-- 3) ACHATS : lecture par le personnel
-- ============================================================
drop policy if exists "purchases_select_staff" on public.purchases;
create policy "purchases_select_staff" on public.purchases
  for select to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

-- ============================================================
-- 4) AVIS : suppression par l'auteur OU le personnel
-- ============================================================
drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated using (
    author_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'editeur')
    )
  );

-- ============================================================
-- VÉRIFICATION (à lire après le Run)
-- ============================================================

-- A) Les contenus et leur statut : votre contenu "en révision" doit
--    apparaître ici avec status = 'soumis'.
select c.title, c.status, u.email as auteur
from public.contents c
join auth.users u on u.id = c.author_id
order by c.created_at desc;

-- B) Les rôles de chaque compte : editeur → editeur, admin → admin, etc.
select u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
order by p.role;

-- C) PREUVE DÉFINITIVE — simulation RLS en tant qu'éditeur.
--     La requête ci-dessous doit afficher le(s) contenu(s) "soumis".
do $$
declare editeur_id uuid;
begin
  select id into editeur_id from auth.users where email = 'editeur@sunucontenu.sn';
  perform set_config('request.jwt.claim.sub', editeur_id::text, false);
end $$;

set role authenticated;
select id, title, status
from public.contents
where status = 'soumis';
reset role;
