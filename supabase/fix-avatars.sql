-- ============================================================
-- SUNU CONTENU — Photos de profil (avatars)
-- À exécuter EN ENTIER dans : Supabase → SQL Editor → New query → Run
-- (ne PAS exécuter seulement la création du bucket : les RULES
--  de sécurité ci-dessous sont OBLIGATOIRES pour l'upload)
-- ============================================================
-- Bucket "avatars" (public) + règles : chacun gère sa propre photo,
-- stockée sous {user_id}/avatar.{ext}.

-- 1) Création / mise à jour du bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2) RÈGLES DE SÉCURITÉ (sans elles, l'upload échoue avec
--    "new row violates row-level security policy")

-- Lecture publique (affichée sur les cartes, fiches, navbar…)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- L'utilisateur ne peut écrire que dans SON dossier {user_id}/...
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and name like auth.uid()::text || '/%'
  );

-- 3) VÉRIFICATION FINALE
--    Le bucket doit apparaître (public = true) :
select id, name, public, file_size_limit from storage.buckets order by id;

--    Les 4 politiques "avatars_*" doivent apparaître ici :
select tablename, policyname, cmd
from pg_policies
where schemaname = 'storage'
  and policyname like 'avatars_%'
order by policyname;
