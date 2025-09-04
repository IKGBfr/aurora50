-- Script pour vérifier et corriger les colonnes de présence dans la base de données
-- Exécuter ce script dans Supabase SQL Editor

-- 1. Vérifier les colonnes existantes dans la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si nécessaire
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_manual_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS presence_status TEXT DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline';

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles(last_activity);

-- 4. Mettre à jour les valeurs NULL existantes
UPDATE public.profiles 
SET 
    last_activity = COALESCE(last_activity, NOW()),
    is_manual_status = COALESCE(is_manual_status, false),
    presence_status = COALESCE(presence_status, 'offline'),
    status = COALESCE(status, 'offline')
WHERE 
    last_activity IS NULL 
    OR is_manual_status IS NULL 
    OR presence_status IS NULL
    OR status IS NULL;

-- 5. Vérifier que les politiques RLS permettent la lecture
-- Politique pour permettre à tous les utilisateurs authentifiés de voir les profils
CREATE POLICY IF NOT EXISTS "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 6. Activer le realtime sur la table profiles si ce n'est pas déjà fait
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- 7. Test rapide pour vérifier que tout fonctionne
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN status = 'online' THEN 1 END) as online_count,
    COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline_count,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status_count
FROM public.profiles;

-- 8. Afficher un échantillon de données pour vérification
SELECT 
    id,
    full_name,
    status,
    presence_status,
    last_activity,
    is_manual_status
FROM public.profiles
LIMIT 10;
