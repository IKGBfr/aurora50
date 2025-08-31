-- ============================================
-- Script pour ajouter les colonnes manquantes
-- Migration Freemium Aurora50 - Partie 2
-- Date: 31/08/2025
-- ============================================

-- Ajouter les 3 colonnes manquantes pour les compteurs quotidiens
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_chat_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_reset TIMESTAMPTZ DEFAULT NOW();

-- Ajouter les commentaires pour documentation
COMMENT ON COLUMN profiles.daily_chat_count IS 'Nombre de messages chat envoyés aujourd''hui (limite: 10 pour freemium)';
COMMENT ON COLUMN profiles.daily_profile_views IS 'Nombre de profils consultés aujourd''hui (limite: 5 pour freemium)';
COMMENT ON COLUMN profiles.last_activity_reset IS 'Dernière réinitialisation des compteurs quotidiens';

-- Vérification que les colonnes ont bien été ajoutées
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN (
    'daily_chat_count',
    'daily_profile_views',
    'last_activity_reset'
  )
ORDER BY column_name;

-- Message de confirmation
SELECT '✅ Les 3 colonnes manquantes ont été ajoutées avec succès!' as message;
