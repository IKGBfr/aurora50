-- Script pour créer une Edge Function qui vérifie les utilisateurs inactifs
-- Cette fonction peut être appelée via un cron job ou manuellement

-- Créer une fonction Edge pour vérifier les utilisateurs inactifs
-- Note: Cette fonction doit être déployée comme Edge Function dans Supabase
-- Vous pouvez aussi utiliser pg_cron si disponible dans votre plan Supabase

-- Option 1: Utiliser pg_cron (si disponible dans votre plan)
-- Installer l'extension pg_cron si elle n'est pas déjà installée
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer un job cron qui s'exécute toutes les minutes
-- pour vérifier les utilisateurs inactifs
SELECT cron.schedule(
  'check-inactive-users', -- nom du job
  '* * * * *', -- toutes les minutes
  $$
    SELECT rpc_check_inactive_users();
  $$
);

-- Option 2: Si pg_cron n'est pas disponible, créer une fonction
-- qui peut être appelée depuis une Edge Function ou un webhook externe

-- Fonction améliorée pour vérifier les utilisateurs inactifs
CREATE OR REPLACE FUNCTION check_and_update_inactive_users()
RETURNS TABLE(
  updated_count INTEGER,
  updated_users UUID[]
) AS $$
DECLARE
  v_updated_count INTEGER;
  v_updated_users UUID[];
BEGIN
  -- Mettre à jour les utilisateurs inactifs et récupérer les IDs
  WITH updated AS (
    UPDATE profiles
    SET 
      status = 'offline',
      is_manual_status = false,
      status_updated_at = NOW()
    WHERE 
      is_manual_status = false
      AND status != 'offline'
      AND last_activity < NOW() - (auto_offline_after || ' minutes')::INTERVAL
    RETURNING id
  )
  SELECT 
    COUNT(*)::INTEGER,
    ARRAY_AGG(id)
  INTO 
    v_updated_count,
    v_updated_users
  FROM updated;
  
  -- Retourner les résultats
  RETURN QUERY SELECT 
    COALESCE(v_updated_count, 0),
    COALESCE(v_updated_users, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les statuts manuels après une longue inactivité
-- (par exemple, après 2 heures d'inactivité, même les statuts manuels passent hors ligne)
CREATE OR REPLACE FUNCTION cleanup_stale_manual_statuses()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    status = 'offline',
    is_manual_status = false,
    status_updated_at = NOW()
  WHERE 
    is_manual_status = true
    AND status != 'offline'
    AND last_activity < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC publique pour déclencher manuellement la vérification
CREATE OR REPLACE FUNCTION rpc_trigger_inactive_check()
RETURNS JSON AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Vérifier les utilisateurs inactifs
  SELECT * INTO v_result FROM check_and_update_inactive_users();
  
  -- Nettoyer aussi les statuts manuels très anciens
  PERFORM cleanup_stale_manual_statuses();
  
  -- Retourner le résultat en JSON
  RETURN json_build_object(
    'success', true,
    'updated_count', v_result.updated_count,
    'updated_users', v_result.updated_users,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_inactive_check 
ON profiles(is_manual_status, status, last_activity) 
WHERE is_manual_status = false AND status != 'offline';

-- Permissions pour les fonctions RPC
GRANT EXECUTE ON FUNCTION rpc_trigger_inactive_check() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_update_inactive_users() TO authenticated;

-- Commentaires
COMMENT ON FUNCTION check_and_update_inactive_users() IS 
'Vérifie et met à jour les utilisateurs inactifs selon leur paramètre auto_offline_after';

COMMENT ON FUNCTION cleanup_stale_manual_statuses() IS 
'Nettoie les statuts manuels après 2 heures d''inactivité';

COMMENT ON FUNCTION rpc_trigger_inactive_check() IS 
'Fonction RPC pour déclencher manuellement la vérification des utilisateurs inactifs';
