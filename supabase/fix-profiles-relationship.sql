-- ============================================================
-- SUNU CONTENU — RÉPARATION de la relation contents → profiles
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- ============================================================
-- SYMPTÔME : les jointures "profiles(full_name)" (PostgREST) échouaient,
-- rendant vides les listes Éditeur / Admin, alors que les contenus
-- existaient bien (l'Auteur les voyait via la jointure "categories").
-- CAUSE : clé étrangère contents.author_id → profiles.id absente ou
-- mal déclarée. On la recrée + on rafraîchit le cache PostgREST.

-- 1) DIAGNOSTIC : clés étrangères actuellement présentes sur "contents"
--    (avant réparation). La colonne "author_id" doit y figurer après le Run.
select
  con.conname            as contrainte,
  att.attname            as colonne_locale,
  con.confrelid::regclass::text as table_referencee
from pg_constraint con
join pg_attribute att
  on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
where con.conrelid = 'public.contents'::regclass
  and con.contype = 'f';

-- 2) RÉPARATION : ajoute la FK author_id → profiles(id) si absente
do $$
begin
  if not exists (
    select 1
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where con.conrelid = 'public.contents'::regclass
      and con.contype = 'f'
      and att.attname = 'author_id'
  ) then
    alter table public.contents
      add constraint contents_author_id_fkey
      foreign key (author_id) references public.profiles(id) on delete cascade;
    raise notice 'FK author_id → profiles(id) créée.';
  else
    raise notice 'FK author_id déjà présente.';
  end if;
end $$;

-- 3) PAR SÉCURITÉ : recrée aussi la FK category_id → categories(id) si absente
do $$
begin
  if not exists (
    select 1
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where con.conrelid = 'public.contents'::regclass
      and con.contype = 'f'
      and att.attname = 'category_id'
  ) then
    alter table public.contents
      add constraint contents_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete set null;
    raise notice 'FK category_id → categories(id) créée.';
  else
    raise notice 'FK category_id déjà présente.';
  end if;
end $$;

-- 4) Rafraîchit le cache de schéma de PostgREST (recharge les relations)
notify pgrst, 'reload schema';

-- 5) VÉRIFICATION FINALE : la requête ci-dessous doit afficher vos
--    contenus "soumis" (en révision).
select c.title, c.status, c.author_id
from public.contents c
order by c.created_at desc;
