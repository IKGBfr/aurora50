-- ============================================
-- SCRIPT: Création/Réparation de profil pour utilisateurs (Version Corrigée)
-- Date: 03/09/2025
-- Description: Corrige le trigger de création de profil et répare les utilisateurs existants sans profil, basé sur le schéma réel de la DB.
-- ============================================

-- 1. Créer la fonction pour gérer automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Créer le profil pour le nouvel utilisateur avec les colonnes existantes
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        onboarding_completed,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        false,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne bloque pas la création de l'utilisateur
        RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer le trigger existant s'il existe pour éviter les doublons
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Créer les profils manquants pour les utilisateurs existants
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    onboarding_completed,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'display_name',
        split_part(u.email, '@', 1)
    ) as full_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    false as onboarding_completed,
    u.created_at,
    NOW() as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Vérification finale
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) as users_without_profile;
