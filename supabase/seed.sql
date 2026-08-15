-- ============================================================
-- SUNU CONTENU — Données de démarrage (seed)
-- À exécuter après schema.sql dans le SQL Editor de Supabase.
-- ============================================================

insert into public.categories (name, slug, description) values
  ('Développement',      'developpement',      'Code, web et applications.'),
  ('Entrepreneuriat',    'entrepreneuriat',    'Créer et faire grandir son activité.'),
  ('Marketing digital',  'marketing-digital',  'Réseaux sociaux, SEO, publicité.'),
  ('Langues',            'langues',            'Wolof, français, anglais et plus.'),
  ('Design',             'design',             'UI/UX, graphisme, création visuelle.')
on conflict (slug) do nothing;

-- Pour insérer des contenus de démonstration, connectez-vous d'abord
-- avec un compte Auteur, puis utilisez le formulaire de l'espace Auteur.
-- Vous pouvez aussi insérer un contenu d'exemple ici :

-- insert into public.contents (author_id, category_id, title, slug, description, type, price, status, published_at)
-- select p.id, c.id, 'Mon premier contenu', 'mon-premier-contenu',
--        'Description de démonstration.', 'ebook', 5000, 'publie', now()
-- from public.profiles p, public.categories c
-- where p.role = 'auteur' and c.slug = 'developpement'
-- limit 1;
