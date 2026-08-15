-- ============================================================
-- SUNU CONTENU — Stockage des fichiers (Supabase Storage)
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- (après avoir exécuté schema.sql)
-- ============================================================
--
-- 2 buckets :
--   - "covers"   : PUBLIC  (images de couverture, lisibles par tous)
--   - "contents" : PRIVÉ   (fichiers vendus, réservés à l'auteur et
--                           aux clients ayant acheté le contenu)
--
-- Organisation des fichiers :
--   covers/{content_id}/cover.{ext}
--   contents/{content_id}/{nom_fichier}

-- 1) Création des buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'covers', 'covers', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'contents', 'contents', false, 52428800, null
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- 2) Politiques de sécurité (RLS) sur storage.objects
-- ============================================================

-- ---------- COUVERTURES (publiques en lecture) ----------

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read"
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists "covers_insert_owner" on storage.objects;
create policy "covers_insert_owner"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'covers'
    and (
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      or public.is_staff()
    )
  );

drop policy if exists "covers_update_owner" on storage.objects;
create policy "covers_update_owner"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'covers'
    and (
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      or public.is_staff()
    )
  )
  with check (bucket_id = 'covers');

drop policy if exists "covers_delete_owner" on storage.objects;
create policy "covers_delete_owner"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'covers'
    and (
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      or public.is_staff()
    )
  );

-- ---------- CONTENUS (privés) ----------

drop policy if exists "contents_insert_owner" on storage.objects;
create policy "contents_insert_owner"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'contents'
    and (
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      or public.is_staff()
    )
  );

drop policy if exists "contents_select_authorized" on storage.objects;
create policy "contents_select_authorized"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'contents'
    and (
      -- l'auteur du contenu
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      -- un client ayant acheté le contenu
      or exists (
        select 1
        from public.contents c
        join public.purchases p on p.content_id = c.id
        where c.id::text = (storage.foldername(name))[1]
          and p.buyer_id = auth.uid()
      )
      -- le personnel interne
      or public.is_staff()
    )
  );

drop policy if exists "contents_update_owner" on storage.objects;
create policy "contents_update_owner"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'contents'
    and (
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      or public.is_staff()
    )
  )
  with check (bucket_id = 'contents');

drop policy if exists "contents_delete_owner" on storage.objects;
create policy "contents_delete_owner"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'contents'
    and (
      exists (
        select 1 from public.contents c
        where c.id::text = (storage.foldername(name))[1]
          and c.author_id = auth.uid()
      )
      or public.is_staff()
    )
  );
