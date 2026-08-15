-- ============================================================
-- SUNU CONTENU — Création des 4 comptes de test (VERSION CORRIGÉE)
-- Supabase → SQL Editor → New query → Run
-- ============================================================
--
-- Comptes créés (identifiant / mot de passe) :
--   admin@sunucontenu.sn    → Admin1234!
--   editeur@sunucontenu.sn  → Editeur1234!
--   auteur@sunucontenu.sn   → Auteur1234!
--   client@sunucontenu.sn   → Client1234!
--
-- CORRECTIONS (par rapport à la version précédente) :
--   1. Création des lignes auth.identities (sinon GoTrue ne peut
--      pas authentifier l'utilisateur : le compte apparaissait
--      avec "providers": []).
--   2. Les colonnes confirmation_token, email_change,
--      email_change_token_new et recovery_token sont mises à ''
--      (et non NULL), sinon erreur "Database error querying schema".
--
-- RÉEXÉCUTABLE : supprime puis recrée les 4 comptes à l'identique.

create extension if not exists pgcrypto;

-- 1) Nettoyage des anciens comptes de test.
--    (identities et profiles sont supprimés par ON DELETE CASCADE)
delete from auth.users
where email in (
  'admin@sunucontenu.sn',
  'editeur@sunucontenu.sn',
  'auteur@sunucontenu.sn',
  'client@sunucontenu.sn'
);

-- 2) Création des utilisateurs dans auth.users
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'admin@sunucontenu.sn',
    crypt('Admin1234!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Administrateur SUNU","role":"admin"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'editeur@sunucontenu.sn',
    crypt('Editeur1234!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Éditeur SUNU","role":"editeur"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'auteur@sunucontenu.sn',
    crypt('Auteur1234!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Auteur SUNU","role":"auteur"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'client@sunucontenu.sn',
    crypt('Client1234!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Client SUNU","role":"client"}',
    now(), now(), '', '', '', ''
  );

-- 3) Création des identités (INDISPENSABLE pour se connecter)
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', now(), now(), now()
from auth.users u
where u.email in (
  'admin@sunucontenu.sn',
  'editeur@sunucontenu.sn',
  'auteur@sunucontenu.sn',
  'client@sunucontenu.sn'
);

-- 4) Le trigger a déjà créé les profils ; on fixe maintenant les rôles
--    (admin/editeur ne peuvent pas être auto-attribués).
update public.profiles
set full_name = 'Administrateur SUNU', role = 'admin'
where id = (select id from auth.users where email = 'admin@sunucontenu.sn');

update public.profiles
set full_name = 'Éditeur SUNU', role = 'editeur'
where id = (select id from auth.users where email = 'editeur@sunucontenu.sn');

update public.profiles
set full_name = 'Auteur SUNU', role = 'auteur'
where id = (select id from auth.users where email = 'auteur@sunucontenu.sn');

update public.profiles
set full_name = 'Client SUNU', role = 'client'
where id = (select id from auth.users where email = 'client@sunucontenu.sn');

-- 5) Vérification : doit afficher 4 lignes, rôle correct et 1 identité chacun
select
  p.full_name,
  p.role,
  u.email,
  (select count(*) from auth.identities i where i.user_id = u.id) as nb_identites
from public.profiles p
join auth.users u on u.id = p.id
where u.email in (
  'admin@sunucontenu.sn',
  'editeur@sunucontenu.sn',
  'auteur@sunucontenu.sn',
  'client@sunucontenu.sn'
)
order by p.role;
