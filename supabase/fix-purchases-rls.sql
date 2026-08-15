-- ============================================================
-- SUNU CONTENU — CORRECTION de la table purchases (paiement)
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- ============================================================
-- PROBLÈME : l'acheteur ne pouvait pas mettre à jour SA ligne d'achat
-- (stocker le token PayDunya, réinitialiser un achat en attente),
-- car il n'existait AUCUNE politique UPDATE sur "purchases".
-- Résultat : token jamais enregistré → paiement jamais confirmé,
-- et erreur "new row violates row-level security policy" au re-achat.
--
-- CORRECTION : on ajoute une politique UPDATE qui permet à l'acheteur
-- de modifier sa propre ligne, MAIS qui lui interdit de passer lui-même
-- le statut en "complete" (cette transition reste réservée au serveur,
-- via la clé service_role). SCRIPT IDEMPOTENT.

drop policy if exists "purchases_update_buyer" on public.purchases;
create policy "purchases_update_buyer" on public.purchases
  for update to authenticated
  using (buyer_id = auth.uid())
  with check (
    buyer_id = auth.uid()
    and status in ('pending', 'cancelled', 'fail')
  );

-- VÉRIFICATION : les politiques "purchases_*" doivent apparaître ci-dessous,
-- y compris la nouvelle "purchases_update_buyer".
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and policyname like 'purchases_%'
order by policyname;
