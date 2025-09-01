-- Script pour ajouter les colonnes de statut utilisateur dans la table profiles
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter les colonnes status et status_updated_at
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline' 
  CHECK (status IN ('online', 'busy', 'dnd', 'offline')),
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Créer un index sur la colonne status pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Créer une fonction pour mettre à jour automatiquement status_updated_at
CREATE OR REPLACE FUNCTION update_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour appeler la fonction
DROP TRIGGER IF EXISTS update_profiles_status_timestamp ON profiles;
CREATE TRIGGER update_profiles_status_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_status_timestamp();

-- Mettre à jour les profils existants avec un statut par défaut
UPDATE profiles 
SET status = 'offline', 
    status_updated_at = NOW()
WHERE status IS NULL;

-- Activer RLS pour la table profiles si ce n'est pas déjà fait
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir tous les statuts
CREATE POLICY "Users can view all statuses" ON profiles
  FOR SELECT
  USING (true);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre statut
CREATE POLICY "Users can update own status" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Commentaire pour documenter les colonnes
COMMENT ON COLUMN profiles.status IS 'Statut de disponibilité de l''utilisateur: online, busy, dnd, offline';
COMMENT ON COLUMN profiles.status_updated_at IS 'Timestamp de la dernière mise à jour du statut';
