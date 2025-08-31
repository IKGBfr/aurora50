-- ============================================
-- Script d'initialisation des tables de chat
-- Aurora50 LMS - Chat Communautaire
-- ============================================

-- 1. Créer la table chat_messages si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent envoyer des messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres messages" ON public.chat_messages;

-- 5. Créer les nouvelles policies RLS
-- Lecture : tous les utilisateurs authentifiés peuvent lire tous les messages
CREATE POLICY "Les utilisateurs peuvent voir tous les messages"
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- Création : les utilisateurs authentifiés peuvent créer des messages
CREATE POLICY "Les utilisateurs authentifiés peuvent envoyer des messages"
    ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Modification : les utilisateurs peuvent modifier leurs propres messages
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres messages"
    ON public.chat_messages
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Suppression : les utilisateurs peuvent supprimer leurs propres messages
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres messages"
    ON public.chat_messages
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Créer la fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Vérifier que la table profiles existe et a les bonnes colonnes
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Activer RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Policies pour profiles
DROP POLICY IF EXISTS "Les profils sont visibles par tous" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles;

CREATE POLICY "Les profils sont visibles par tous"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 11. Créer la table de présence pour le chat
CREATE TABLE IF NOT EXISTS public.presence (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Index pour la présence
CREATE INDEX IF NOT EXISTS idx_presence_status ON public.presence(status);
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON public.presence(last_seen DESC);

-- 13. RLS pour presence
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "La présence est visible par tous" ON public.presence;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre présence" ON public.presence;

CREATE POLICY "La présence est visible par tous"
    ON public.presence
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre présence"
    ON public.presence
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 14. Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
        )
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 16. Activer Realtime pour les tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.presence;

-- 17. Créer quelques messages de test (optionnel)
-- Décommenter si vous voulez des données de test
/*
INSERT INTO public.chat_messages (user_id, content)
SELECT 
    auth.uid(),
    'Bienvenue dans le chat communautaire Aurora50! 🌿'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Pour exécuter ce script :
-- 1. Allez dans le dashboard Supabase
-- 2. SQL Editor
-- 3. Copiez-collez ce script
-- 4. Cliquez sur "Run"
-- ============================================
