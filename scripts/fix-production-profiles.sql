-- ============================================
-- Script de Correction Production - Profils
-- Date: 31/08/2025
-- Objectif: Corriger les problèmes de profils manquants
-- ============================================

-- 1. CORRECTION DES DONNÉES EXISTANTES
-- ============================================

-- Créer le profil manquant pour l'utilisateur sans profil
INSERT INTO public.profiles (user_id, email, username, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'cabinetlebas.lille@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Créer les stats manquantes pour tous les profils qui n'en ont pas
INSERT INTO public.user_stats (user_id, created_at, updated_at)
SELECT 
  p.user_id,
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN public.user_stats s ON p.user_id = s.user_id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. NETTOYAGE DES POLITIQUES RLS
-- ============================================

-- Supprimer la politique RLS dupliquée
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

-- 3. CRÉATION DU TRIGGER AUTOMATIQUE
-- ============================================

-- Fonction pour gérer la création automatique des profils et stats
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Créer le profil avec les valeurs par défaut
  INSERT INTO public.profiles (
    user_id, 
    email, 
    username, 
    created_at, 
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1)
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer les statistiques utilisateur
  INSERT INTO public.user_stats (
    user_id, 
    created_at, 
    updated_at
  )
  VALUES (
    new.id, 
    NOW(), 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. VÉRIFICATION FINALE
-- ============================================

-- Afficher le statut de tous les utilisateurs
DO $$
DECLARE
  missing_profiles INTEGER;
  missing_stats INTEGER;
  total_users INTEGER;
BEGIN
  -- Compter les utilisateurs sans profil
  SELECT COUNT(*) INTO missing_profiles
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL;
  
  -- Compter les utilisateurs sans stats
  SELECT COUNT(*) INTO missing_stats
  FROM auth.users u
  LEFT JOIN public.user_stats s ON u.id = s.user_id
  WHERE s.user_id IS NULL;
  
  -- Total utilisateurs
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  -- Afficher le résultat
  RAISE NOTICE '=== RÉSULTAT DE LA MIGRATION ===';
  RAISE NOTICE 'Total utilisateurs: %', total_users;
  RAISE NOTICE 'Profils manquants: %', missing_profiles;
  RAISE NOTICE 'Stats manquantes: %', missing_stats;
  
  IF missing_profiles = 0 AND missing_stats = 0 THEN
    RAISE NOTICE '✅ SUCCÈS: Tous les utilisateurs ont un profil et des stats!';
  ELSE
    RAISE WARNING '⚠️ ATTENTION: Il reste des données manquantes';
  END IF;
END $$;

-- Requête de vérification finale (à exécuter manuellement si besoin)
/*
SELECT 
  u.email,
  u.created_at as user_created,
  p.user_id IS NOT NULL as has_profile,
  s.user_id IS NOT NULL as has_stats,
  p.username,
  p.display_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_stats s ON u.id = s.user_id
ORDER BY u.created_at DESC;
*/
