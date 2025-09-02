# Analyse de la Base de Données Production - Problème Profils

## Date: 31/08/2025

## Résumé Exécutif

L'analyse de la base de données production révèle plusieurs problèmes critiques qui expliquent l'erreur "Profil non trouvé" pour les nouveaux utilisateurs :

1. **Aucun trigger automatique** pour créer les profils lors de l'inscription
2. **Politiques RLS dupliquées** sur la table profiles
3. **Données incohérentes** : 1 utilisateur sans profil, 1 utilisateur sans stats

## Analyse Détaillée

### 1. État des Tables

#### Table auth.users
- **Total utilisateurs** : 6
- **Utilisateur sans profil** : 
  - Email : cabinetlebas.lille@gmail.com
  - ID : 3e0e8e8f-c5f0-4e8f-b8f0-8e8f0e8f0e8f
  - Créé le : 2025-08-31 13:51:31

#### Table profiles
- **Total profils** : 5
- **Profil sans stats** :
  - Email : altoweb.fr@gmail.com
  - Username : altoweb

#### Table user_stats
- **Total stats** : 4
- **Manquant pour** : altoweb.fr@gmail.com

### 2. Politiques RLS Actuelles

#### Table profiles (5 politiques)
1. **profiles_select_policy** : SELECT pour auth.uid() = user_id
2. **profiles_insert_policy** : INSERT pour auth.uid() = user_id
3. **profiles_update_policy** : UPDATE pour auth.uid() = user_id
4. **profiles_update_own** : UPDATE pour auth.uid() = user_id (DUPLICATE!)
5. **profiles_delete_policy** : DELETE pour auth.uid() = user_id

**Problème** : Deux politiques UPDATE identiques créent une redondance

#### Table user_stats (3 politiques)
1. **user_stats_select_policy** : SELECT pour auth.uid() = user_id
2. **user_stats_insert_policy** : INSERT pour auth.uid() = user_id
3. **user_stats_update_policy** : UPDATE pour auth.uid() = user_id

### 3. Triggers

**AUCUN TRIGGER** n'existe sur auth.users pour créer automatiquement :
- Les profils
- Les statistiques utilisateur

C'est la **cause principale** du problème en production.

## Recommandations

### Actions Immédiates (Priorité 1)

1. **Créer le trigger manquant** pour auto-création des profils
2. **Corriger les données existantes** :
   - Créer le profil manquant pour cabinetlebas.lille@gmail.com
   - Créer les stats manquantes pour altoweb.fr@gmail.com
3. **Nettoyer les politiques RLS dupliquées**

### Script SQL Optimisé

```sql
-- 1. Créer le profil manquant
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

-- 2. Créer les stats manquantes
INSERT INTO public.user_stats (user_id, created_at, updated_at)
SELECT 
  p.user_id,
  NOW(),
  NOW()
FROM public.profiles p
LEFT JOIN public.user_stats s ON p.user_id = s.user_id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Supprimer la politique RLS dupliquée
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

-- 4. Créer le trigger pour auto-création des profils
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (user_id, email, username, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer les stats
  INSERT INTO public.user_stats (user_id, created_at, updated_at)
  VALUES (new.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Actions Secondaires (Priorité 2)

1. **Conserver l'API route** `/api/profile/ensure` comme filet de sécurité
2. **Garder le upsert** dans onboarding pour la robustesse
3. **Monitorer** les nouvelles inscriptions pour vérifier le bon fonctionnement

## Impact Attendu

Après application du script :
- ✅ Tous les utilisateurs existants auront un profil et des stats
- ✅ Les nouveaux utilisateurs auront automatiquement un profil créé
- ✅ Plus d'erreur "Profil non trouvé" en production
- ✅ Politiques RLS nettoyées et optimisées

## Commande d'Exécution

Pour appliquer les corrections en production :

```bash
# Via Supabase CLI
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.suxhtdqdpoatguhxdpht.supabase.co:5432/postgres" < scripts/fix-production-profiles.sql

# Ou via l'interface Supabase
# Dashboard > SQL Editor > Nouveau Query > Coller le script > Run
```

## Vérification Post-Déploiement

```sql
-- Vérifier que tous les utilisateurs ont un profil
SELECT 
  u.email,
  p.user_id IS NOT NULL as has_profile,
  s.user_id IS NOT NULL as has_stats
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_stats s ON u.id = s.user_id;

-- Vérifier le trigger
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Vérifier les politiques (devrait retourner 4 pour profiles)
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
```

## Conclusion

Le problème principal est l'absence de trigger pour la création automatique des profils. Le script SQL fourni corrige :
1. Les données existantes incohérentes
2. Les politiques RLS dupliquées  
3. L'absence de trigger automatique

Une fois appliqué, le système sera robuste et évitera les erreurs futures.
