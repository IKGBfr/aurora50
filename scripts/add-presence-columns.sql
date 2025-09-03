-- Script pour ajouter les colonnes de présence automatique dans la table profiles
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter les nouvelles colonnes pour la gestion de présence automatique
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_manual_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_offline_after INTEGER DEFAULT 15;

-- Créer un index sur last_activity pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity);
CREATE INDEX IF NOT EXISTS idx_profiles_is_manual_status ON profiles(is_manual_status);

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN profiles.last_activity IS 'Timestamp de la dernière activité détectée de l''utilisateur';
COMMENT ON COLUMN profiles.is_manual_status IS 'Indique si le statut actuel a été défini manuellement (true) ou automatiquement (false)';
COMMENT ON COLUMN profiles.auto_offline_after IS 'Nombre de minutes d''inactivité avant passage automatique hors ligne';

-- Fonction pour mettre à jour automatiquement last_activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne pas mettre à jour si c'est juste un changement de last_activity
  IF OLD IS DISTINCT FROM NEW AND 
     (OLD.last_activity IS DISTINCT FROM NEW.last_activity OR 
      OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.last_activity = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appeler la fonction (remplacer si existe)
DROP TRIGGER IF EXISTS update_profiles_last_activity ON profiles;
CREATE TRIGGER update_profiles_last_activity
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Fonction pour détecter et mettre à jour les utilisateurs inactifs
-- Cette fonction sera appelée régulièrement (via pg_cron ou Edge Function)
CREATE OR REPLACE FUNCTION check_inactive_users()
RETURNS void AS $$
BEGIN
  -- Passer en "hors ligne" les utilisateurs inactifs depuis plus de X minutes
  -- et dont le statut n'est pas manuel
  UPDATE profiles
  SET 
    status = 'offline',
    is_manual_status = false,
    status_updated_at = NOW()
  WHERE 
    is_manual_status = false
    AND status != 'offline'
    AND last_activity < NOW() - (auto_offline_after || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour gérer la connexion d'un utilisateur
CREATE OR REPLACE FUNCTION handle_user_signin(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Mettre à jour le statut à "online" si pas de statut manuel
  UPDATE profiles
  SET 
    status = 'online',
    is_manual_status = false,
    last_activity = NOW(),
    status_updated_at = NOW()
  WHERE 
    id = user_id
    AND (is_manual_status = false OR status = 'offline');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour gérer la déconnexion d'un utilisateur
CREATE OR REPLACE FUNCTION handle_user_signout(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Toujours passer en "offline" à la déconnexion
  UPDATE profiles
  SET 
    status = 'offline',
    is_manual_status = false,
    last_activity = NOW(),
    status_updated_at = NOW()
  WHERE 
    id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour l'activité d'un utilisateur (heartbeat)
CREATE OR REPLACE FUNCTION update_user_activity(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    last_activity = NOW()
  WHERE 
    id = user_id;
    
  -- Si l'utilisateur était hors ligne et n'a pas de statut manuel, le repasser en ligne
  UPDATE profiles
  SET 
    status = 'online',
    is_manual_status = false,
    status_updated_at = NOW()
  WHERE 
    id = user_id
    AND status = 'offline'
    AND is_manual_status = false;
END;
$$ LANGUAGE plpgsql;

-- Fonction RPC pour permettre aux utilisateurs de mettre à jour leur activité
CREATE OR REPLACE FUNCTION rpc_update_activity()
RETURNS void AS $$
BEGIN
  PERFORM update_user_activity(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC pour permettre de définir un statut manuel
CREATE OR REPLACE FUNCTION rpc_set_manual_status(new_status VARCHAR(20))
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    status = new_status,
    is_manual_status = true,
    status_updated_at = NOW(),
    last_activity = NOW()
  WHERE 
    id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC pour vérifier les utilisateurs inactifs (peut être appelée par un cron job)
CREATE OR REPLACE FUNCTION rpc_check_inactive_users()
RETURNS void AS $$
BEGIN
  PERFORM check_inactive_users();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour les profils existants avec les valeurs par défaut
UPDATE profiles 
SET 
  last_activity = COALESCE(status_updated_at, NOW()),
  is_manual_status = false,
  auto_offline_after = 15
WHERE last_activity IS NULL;

-- Permissions RLS pour les nouvelles colonnes
-- Les utilisateurs peuvent voir toutes les activités et statuts
CREATE POLICY "Users can view all presence data" ON profiles
  FOR SELECT
  USING (true);

-- Les utilisateurs peuvent uniquement mettre à jour leur propre présence
CREATE POLICY "Users can update own presence" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Activer Realtime pour les changements de présence
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
