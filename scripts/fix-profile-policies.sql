-- ============================================
-- Script de correction des politiques RLS pour les profils
-- Résout le problème "Impossible de créer le profil" en production
-- ============================================

-- 1. S'assurer que RLS est activé sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 3. Créer la politique pour la lecture publique des profils
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 4. Créer la politique pour l'insertion du propre profil
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. Créer la politique pour la mise à jour du propre profil
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Créer la politique pour la suppression (si nécessaire)
CREATE POLICY "Users can delete their own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- 7. Vérifier que les colonnes nécessaires existent
-- (au cas où certaines colonnes manqueraient)
DO $$ 
BEGIN
    -- Vérifier et ajouter subscription_status si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles 
        ADD COLUMN subscription_status text DEFAULT 'free';
    END IF;
    
    -- Vérifier et ajouter subscription_plan si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles 
        ADD COLUMN subscription_plan text DEFAULT 'free';
    END IF;
    
    -- Vérifier et ajouter onboarding_completed si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles 
        ADD COLUMN onboarding_completed boolean DEFAULT false;
    END IF;
    
    -- Vérifier et ajouter daily_messages_count si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'daily_messages_count') THEN
        ALTER TABLE profiles 
        ADD COLUMN daily_messages_count integer DEFAULT 0;
    END IF;
    
    -- Vérifier et ajouter last_message_reset si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'last_message_reset') THEN
        ALTER TABLE profiles 
        ADD COLUMN last_message_reset timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- 8. Créer une fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at,
        subscription_status,
        subscription_plan,
        onboarding_completed,
        daily_messages_count,
        last_message_reset
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        now(),
        now(),
        'free',
        'free',
        false,
        0,
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = now();
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 10. Créer le trigger pour auto-créer le profil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 12. Vérifier que tout est en place
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'profiles';
    
    RAISE NOTICE 'Nombre de politiques RLS sur profiles: %', policy_count;
    
    IF policy_count < 4 THEN
        RAISE WARNING 'Attention: Moins de 4 politiques trouvées. Vérifiez la configuration.';
    ELSE
        RAISE NOTICE 'Configuration RLS correcte ✓';
    END IF;
END $$;

-- ============================================
-- FIN DU SCRIPT
-- 
-- Pour exécuter ce script :
-- 1. Aller dans Supabase Dashboard
-- 2. SQL Editor
-- 3. Copier-coller ce script
-- 4. Cliquer sur "Run"
-- ============================================
