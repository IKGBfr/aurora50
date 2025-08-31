-- ============================================
-- Script de vérification de la migration freemium
-- Aurora50 - 31/08/2025
-- ============================================

-- Ce script vérifie que tous les éléments de la migration freemium
-- ont été correctement créés dans la base de données

-- 1. VÉRIFICATION DES COLONNES
-- Vérifie que les 9 nouvelles colonnes ont été ajoutées à la table profiles
WITH column_check AS (
  SELECT 
    'Colonnes profiles' as check_type,
    COUNT(*) as found,
    9 as expected,
    array_agg(column_name ORDER BY column_name) as found_items
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN (
      'onboarding_completed',
      'onboarding_answers',
      'subscription_type',
      'subscription_started_at',
      'trial_ends_at',
      'conversion_triggers',
      'daily_chat_count',
      'daily_profile_views',
      'last_activity_reset'
    )
),

-- 2. VÉRIFICATION DES FONCTIONS
function_check AS (
  SELECT 
    'Fonctions helper' as check_type,
    COUNT(*) as found,
    4 as expected,
    array_agg(routine_name ORDER BY routine_name) as found_items
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'reset_daily_limits',
      'check_freemium_limit',
      'increment_usage_counter',
      'log_conversion_trigger'
    )
),

-- 3. VÉRIFICATION DES INDEX
index_check AS (
  SELECT 
    'Index créés' as check_type,
    COUNT(*) as found,
    3 as expected,
    array_agg(indexname ORDER BY indexname) as found_items
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND indexname IN (
      'idx_profiles_subscription',
      'idx_profiles_trial_ends',
      'idx_profiles_onboarding'
    )
),

-- 4. VÉRIFICATION DE LA VUE
view_check AS (
  SELECT 
    'Vue premium_users' as check_type,
    COUNT(*) as found,
    1 as expected,
    array_agg(table_name) as found_items
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name = 'premium_users'
),

-- 5. VÉRIFICATION DU TRIGGER
trigger_check AS (
  SELECT 
    'Trigger conversion' as check_type,
    COUNT(*) as found,
    1 as expected,
    array_agg(trigger_name) as found_items
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND event_object_table = 'profiles'
    AND trigger_name = 'ensure_conversion_triggers'
)

-- RAPPORT FINAL
SELECT 
  check_type,
  found,
  expected,
  CASE 
    WHEN found = expected THEN '✅ OK'
    ELSE '❌ MANQUANT'
  END as status,
  CASE 
    WHEN found < expected THEN 
      'Il manque ' || (expected - found) || ' élément(s)'
    WHEN found > expected THEN 
      'Trop d''éléments trouvés (' || found || ')'
    ELSE 
      'Tous les éléments sont présents'
  END as message,
  found_items::text as elements_trouvés
FROM column_check

UNION ALL
SELECT * FROM (
  SELECT 
    check_type,
    found,
    expected,
    CASE 
      WHEN found = expected THEN '✅ OK'
      ELSE '❌ MANQUANT'
    END as status,
    CASE 
      WHEN found < expected THEN 
        'Il manque ' || (expected - found) || ' fonction(s)'
      WHEN found > expected THEN 
        'Trop de fonctions trouvées (' || found || ')'
      ELSE 
        'Toutes les fonctions sont présentes'
    END as message,
    found_items::text as elements_trouvés
  FROM function_check
) f

UNION ALL
SELECT * FROM (
  SELECT 
    check_type,
    found,
    expected,
    CASE 
      WHEN found = expected THEN '✅ OK'
      ELSE '❌ MANQUANT'
    END as status,
    CASE 
      WHEN found < expected THEN 
        'Il manque ' || (expected - found) || ' index'
      WHEN found > expected THEN 
        'Trop d''index trouvés (' || found || ')'
      ELSE 
        'Tous les index sont présents'
    END as message,
    found_items::text as elements_trouvés
  FROM index_check
) i

UNION ALL
SELECT * FROM (
  SELECT 
    check_type,
    found,
    expected,
    CASE 
      WHEN found = expected THEN '✅ OK'
      ELSE '❌ MANQUANT'
    END as status,
    CASE 
      WHEN found < expected THEN 
        'La vue n''existe pas'
      ELSE 
        'La vue est présente'
    END as message,
    found_items::text as elements_trouvés
  FROM view_check
) v

UNION ALL
SELECT * FROM (
  SELECT 
    check_type,
    found,
    expected,
    CASE 
      WHEN found = expected THEN '✅ OK'
      ELSE '❌ MANQUANT'
    END as status,
    CASE 
      WHEN found < expected THEN 
        'Le trigger n''existe pas'
      ELSE 
        'Le trigger est présent'
    END as message,
    found_items::text as elements_trouvés
  FROM trigger_check
) t

ORDER BY 
  CASE check_type
    WHEN 'Colonnes profiles' THEN 1
    WHEN 'Fonctions helper' THEN 2
    WHEN 'Index créés' THEN 3
    WHEN 'Vue premium_users' THEN 4
    WHEN 'Trigger conversion' THEN 5
  END;

-- ============================================
-- RÉSUMÉ GLOBAL
-- ============================================
SELECT 
  '=== RÉSUMÉ MIGRATION FREEMIUM ===' as titre,
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM (
        SELECT found = expected as ok FROM column_check
        UNION ALL
        SELECT found = expected FROM function_check
        UNION ALL
        SELECT found = expected FROM index_check
        UNION ALL
        SELECT found = expected FROM view_check
        UNION ALL
        SELECT found = expected FROM trigger_check
      ) checks
      WHERE ok = false
    ) = 0 
    THEN '✅ MIGRATION COMPLÈTE - Tous les éléments sont en place!'
    ELSE '❌ MIGRATION INCOMPLÈTE - Exécutez le script freemium-migration.sql'
  END as statut_global;

-- ============================================
-- DÉTAILS DES COLONNES (pour debug)
-- ============================================
-- Décommentez cette section pour voir le détail des colonnes
/*
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN (
    'onboarding_completed',
    'onboarding_answers',
    'subscription_type',
    'subscription_started_at',
    'trial_ends_at',
    'conversion_triggers',
    'daily_chat_count',
    'daily_profile_views',
    'last_activity_reset'
  )
ORDER BY column_name;
*/

-- ============================================
-- VÉRIFICATION DES CONTRAINTES
-- ============================================
-- Vérifie que la contrainte CHECK sur subscription_type existe
/*
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%subscription_type%';
*/
