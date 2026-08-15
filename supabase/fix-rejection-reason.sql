-- ============================================================
-- SUNU CONTENU — AJOUT du motif de rejet
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- ============================================================
-- Ajoute la colonne rejection_reason sur la table contents,
-- pour informer l'auteur du motif de refus de son contenu.

alter table public.contents
  add column if not exists rejection_reason text;

-- Vérification : la colonne doit apparaître ci-dessous.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'contents'
order by ordinal_position;
