# SUNU CONTENU — Spécification fonctionnelle

> **Plateforme sénégalaise de vente de contenus numériques.**
> Ebooks, cours, vidéos, documents et audios, créés et vendus par des talents locaux.

---

## 1. Vision

SUNU CONTENU (en wolof : « notre contenu ») est un SaaS qui connecte des
**auteurs/créateurs** et des **clients** autour de contenus numériques
pédagogiques et professionnels, avec une **équipe éditoriale** qui garantit la
qualité et un **administrateur** qui pilote la plateforme.

Le paiement est assuré par **PayDunya** (Orange Money, Wave, carte…) — il sera
intégré en dernière phase, une fois le compte marchand validé.

---

## 2. Les 4 rôles et leurs fonctionnalités

> **Connexion** : chaque rôle a sa propre page (`/connexion/admin`,
> `/connexion/editeur`, `/connexion/auteur`, `/connexion/client`). À la
> connexion, le serveur vérifie que le compte possède bien le rôle attendu —
> un compte Client ne peut pas se connecter via l'espace Admin et inversement.

### 🛡️ 1. Administrateur
Pilote la plateforme.

| Fonctionnalité | Statut |
| --- | --- |
| Tableau de bord (utilisateurs, contenus, revenus) | ✅ Implémenté |
| Gestion des utilisateurs (attribution/changement de rôle) | ✅ Implémenté |
| Vue de tous les contenus et de leur statut | ✅ Implémenté |
| Modération des contenus (publier / rejeter / archiver) | ✅ Implémenté |
| Gestion des catégories (CRUD) | ✅ Implémenté |
| Historique des transactions + reversements | ⏳ Avec PayDunya |

### ✍️ 2. Éditeur
Garantit la qualité du contenu.

| Fonctionnalité | Statut |
| --- | --- |
| File de relecture des contenus soumis | ✅ Implémenté |
| Publication / rejet d'un contenu | ✅ Implémenté |
| Page d'analyse avant décision (description, couverture, fichier) | ✅ Implémenté |
| Motif de rejet obligatoire, transmis à l'auteur | ✅ Implémenté |
| Compteurs (en attente, publiés) | ✅ Implémenté |
| Commentaires/annotations sur un contenu | ⏳ Prochaine étape |
| Gestion des catégories (partagée avec l'admin) | ✅ Implémenté |

### 🖋️ 3. Auteur
Crée et vend ses contenus.

| Fonctionnalité | Statut |
| --- | --- |
| Créer un contenu (titre, type, prix, description, catégorie) | ✅ Implémenté |
| Modifier les métadonnées (titre, description, prix…) | ✅ Implémenté |
| Brouillon → soumission à la relecture | ✅ Implémenté |
| Re-soumission après rejet (avec motif visible) | ✅ Implémenté |
| Supprimer un contenu | ✅ Implémenté |
| Statistiques (contenus, publiés, revenus) | ✅ Implémenté |
| Upload du fichier + image de couverture (stockage) | ✅ Implémenté |
| Lecteur in-app sécurisé (PDF, vidéo, audio) | ✅ Implémenté |
| Page publique « boutique de l'auteur » | ✅ Implémenté |
| Répondre aux avis clients | ⏳ Prochaine étape |

### 📚 4. Client
Découvre et achète.

| Fonctionnalité | Statut |
| --- | --- |
| Parcourir le catalogue (recherche + filtres par type) | ✅ Implémenté |
| Fiche détaillée d'un contenu | ✅ Implémenté |
| Ma bibliothèque (contenus achetés) | ✅ Implémenté |
| Favoris / liste de souhaits | ✅ Implémenté (ajout/retrait depuis cartes & fiches) |
| Achat via PayDunya (sandbox) | ✅ Implémenté (mode test) |
| Avis et notes (1–5 étoiles) | ✅ Implémenté (réservé aux acheteurs) |

---

## 3. Workflow éditorial

```
brouillon ──soumission──▶ soumis ──validation éditeur──▶ publie
                            │
                            └──rejet──▶ rejete
```

- Seul l'**auteur** (ou le staff) crée un contenu → `brouillon`.
- L'**auteur** le **soumet** → `soumis`.
- L'**éditeur** le **publie** (`publie`, visible au public) ou le **rejette**.
- L'**admin** peut archiver n'importe quel contenu.

---

## 4. Modèle de données (Supabase / PostgreSQL)

| Table | Rôle |
| --- | --- |
| `profiles` | Étend `auth.users` : nom, **rôle**, bio, avatar, téléphone |
| `categories` | Catégories de contenus |
| `contents` | Produits : titre, slug, type, prix (FCFA), statut, auteur |
| `purchases` | Achats (alimentée par PayDunya) |
| `reviews` | Avis et notes |
| `favorites` | Favoris |

Types énumérés : `user_role` (admin/editeur/auteur/client),
`content_type` (ebook/cours/video/document/audio),
`content_status` (brouillon/soumis/publie/rejete/archive).

**Sécurité** : les permissions de chaque rôle sont appliquées **au niveau de la
base** grâce au *Row-Level Security* (RLS) — voir `supabase/schema.sql`.

---

## 5. Architecture technique

- **Frontend & backend** : Next.js 16 (App Router, Server Components, Server Actions) + TypeScript
- **Base de données & auth** : Supabase (PostgreSQL, Auth, RLS)
- **Style** : Tailwind CSS v4
- **Paiement (phase finale)** : PayDunya — SDK Node ou API HTTP/JSON, avec une
  « porte de paiement » générique pour brancher PayDunya sans toucher au reste.

```
src/
├── app/                 # routes (pages, layouts, routes API)
│   ├── (auth)/          # login, signup
│   ├── auth/            # callback + signout
│   ├── catalogue/       # liste + fiche contenu
│   └── dashboard/       # espaces admin / editeur / auteur / client
├── components/          # UI partagée
├── lib/                 # logique métier (auth, données, actions serveur)
└── proxy.ts             # protection des routes (ex-middleware, Next 16)
supabase/
├── schema.sql           # tables + RLS + triggers
└── seed.sql             # catégories de départ
```

---

## 6. Feuille de route (phases)

1. ✅ **Fondations** : identité, stack, schéma BDD, auth, navigation par rôle.
2. ✅ **Fonctionnalités de base de chaque rôle** (cette livraison).
3. ✅ **Upload de fichiers & couvertures** : Supabase Storage (buckets
   `covers` public + `contents` privé), téléversement côté auteur,
   téléchargement signé côté client.
4. ✅ **Avis & notes clients** (notation 1–5 étoiles, réservée aux acheteurs).
   ✅ **Boutique publique par auteur** (`/auteurs/[id]`).
   ✅ **Favoris fonctionnels** (cœur sur les cartes et les fiches).
   ✅ **Catégories (CRUD)** — espace dédié admin/éditeur, sans SQL.
5. ✅ **Paiement PayDunya** : bouton « Acheter » → facture PayDunya (sandbox),
   IPN + retour → déblocage du téléchargement et des avis. Bascule en
   production en passant `PAYDUNYA_MODE=live` + clés live.
6. ⏳ **Notifications** (email), statistiques avancées, abonnements.

---

## 7. Mise en route

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Exécuter `supabase/schema.sql` (puis `supabase/seed.sql`) dans le SQL Editor.
3. Copier `.env.example` → `.env.local` et renseigner les clés.
4. `npm install` puis `npm run dev`.
5. Créer le premier compte, puis le passer admin :

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users order by created_at asc limit 1);
```
