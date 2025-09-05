-- Script pour vérifier et ajouter les colonnes manquantes dans la table salons

-- 1. Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    -- Vérifier et ajouter visibility
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salons' 
        AND column_name = 'visibility'
    ) THEN
        ALTER TABLE public.salons 
        ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));
        RAISE NOTICE 'Colonne visibility ajoutée';
    ELSE
        RAISE NOTICE 'Colonne visibility existe déjà';
    END IF;

    -- Vérifier et ajouter cover_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salons' 
        AND column_name = 'cover_url'
    ) THEN
        ALTER TABLE public.salons 
        ADD COLUMN cover_url TEXT;
        RAISE NOTICE 'Colonne cover_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne cover_url existe déjà';
    END IF;

    -- Vérifier et ajouter emoji
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salons' 
        AND column_name = 'emoji'
    ) THEN
        ALTER TABLE public.salons 
        ADD COLUMN emoji TEXT DEFAULT '💬';
        RAISE NOTICE 'Colonne emoji ajoutée';
    ELSE
        RAISE NOTICE 'Colonne emoji existe déjà';
    END IF;

    -- Vérifier et ajouter theme_color
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salons' 
        AND column_name = 'theme_color'
    ) THEN
        ALTER TABLE public.salons 
        ADD COLUMN theme_color TEXT DEFAULT '#8B5CF6';
        RAISE NOTICE 'Colonne theme_color ajoutée';
    ELSE
        RAISE NOTICE 'Colonne theme_color existe déjà';
    END IF;

    -- Vérifier et ajouter tags
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salons' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.salons 
        ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Colonne tags ajoutée';
    ELSE
        RAISE NOTICE 'Colonne tags existe déjà';
    END IF;
END $$;

-- 2. Mettre à jour les valeurs par défaut pour les lignes existantes
UPDATE salons 
SET 
  visibility = COALESCE(visibility, 'public'),
  emoji = COALESCE(emoji, '💬'),
  theme_color = COALESCE(theme_color, color_theme, '#8B5CF6'),
  tags = COALESCE(tags, '{}')
WHERE visibility IS NULL 
   OR emoji IS NULL 
   OR theme_color IS NULL 
   OR tags IS NULL;

-- 3. Afficher les colonnes de la table salons pour vérification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'salons'
ORDER BY ordinal_position;
