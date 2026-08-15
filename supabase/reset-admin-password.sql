-- ============================================================
-- SUNU CONTENU — Réinitialisation du mot de passe ADMIN (garanti)
-- Supabase → SQL Editor → New query → Run
-- ============================================================
-- Fixe un mot de passe connu sur le(s) compte(s) admin et garantit
-- le rôle "admin" dans public.profiles.
-- Identifiants après exécution :
--   admin@sunucontenu.sn  → Admin1234!   (compte créé par create-users.sql)
--   admin1@sunucontenu.sn → Admin1234!   (compte créé via le dashboard)

create extension if not exists pgcrypto;

-- 1) Compte admin principal (script create-users.sql)
update auth.users
set encrypted_password = crypt('Admin1234!', gen_salt('bf', 10)),
    email_confirmed_at  = coalesce(email_confirmed_at, now()),
    raw_user_meta_data  = raw_user_meta_data
                          || '{"full_name":"Administrateur SUNU","role":"admin"}'::jsonb,
    updated_at          = now()
where email = 'admin@sunucontenu.sn';

-- 2) (Optionnel) Compte admin1@ créé depuis le dashboard
update auth.users
set encrypted_password = crypt('Admin1234!', gen_salt('bf', 10)),
    email_confirmed_at  = coalesce(email_confirmed_at, now()),
    raw_user_meta_data  = raw_user_meta_data
                          || '{"full_name":"Administrateur SUNU","role":"admin"}'::jsonb,
    updated_at          = now()
where email = 'admin1@sunucontenu.sn';

-- 3) Rôle "admin" garanti dans public.profiles (crée le profil s'il manque)
insert into public.profiles (id, full_name, role)
select id, 'Administrateur SUNU', 'admin'::public.user_role
from auth.users
where email in ('admin@sunucontenu.sn', 'admin1@sunucontenu.sn')
on conflict (id) do update
set role = 'admin', full_name = 'Administrateur SUNU';

-- 4) Vérification : la colonne "role" doit valoir "admin"
select u.email, p.role, p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
where u.email in ('admin@sunucontenu.sn', 'admin1@sunucontenu.sn')
order by u.email;
