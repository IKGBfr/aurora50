-- Migration pour ajouter les colonnes de vérification email custom
-- Système indépendant de Supabase Auth

-- Ajouter les colonnes nécessaires à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Créer un index pour améliorer les performances de recherche par token
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token 
ON profiles(email_verification_token) 
WHERE email_verification_token IS NOT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN profiles.email_verified IS 'Indique si l''email a été vérifié via notre système custom';
COMMENT ON COLUMN profiles.email_verification_token IS 'Token unique pour la vérification email (UUID)';
COMMENT ON COLUMN profiles.email_verified_at IS 'Date et heure de la vérification de l''email';
