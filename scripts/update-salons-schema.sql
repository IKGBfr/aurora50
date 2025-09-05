-- Script de mise à jour du schéma des salons pour Aurora50
-- Ajoute les nouvelles colonnes pour la refonte de la page de création

-- 1. Ajouter les colonnes manquantes à la table salons
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '💬',
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Créer un index pour la recherche par tags
CREATE INDEX IF NOT EXISTS idx_salons_tags ON public.salons USING GIN(tags);

-- 3. Créer un index pour la visibilité
CREATE INDEX IF NOT EXISTS idx_salons_visibility ON public.salons(visibility);

-- 4. Créer le bucket Storage pour les covers de salons (si pas déjà créé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-covers',
  'salon-covers',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 5. Policies RLS pour le bucket salon-covers
-- Permettre à tous de voir les images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'salon-covers');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload salon covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'salon-covers' 
  AND auth.role() = 'authenticated'
);

-- Permettre aux propriétaires de salons de modifier/supprimer leurs covers
CREATE POLICY "Salon owners can update/delete covers" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'salon-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Salon owners can delete covers" ON storage.objects
FOR DELETE USING (
  bucket_id = 'salon-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Mettre à jour la fonction RPC create_salon_with_code
CREATE OR REPLACE FUNCTION create_salon_with_code(
  p_name TEXT,
  p_description TEXT,
  p_category TEXT,
  p_city TEXT DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public',
  p_cover_url TEXT DEFAULT NULL,
  p_emoji TEXT DEFAULT '💬',
  p_theme_color TEXT DEFAULT '#8B5CF6',
  p_tags TEXT[] DEFAULT '{}'
)
RETURNS salons
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salon salons;
  v_share_code TEXT;
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur
  v_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vous devez être connecté pour créer un salon';
  END IF;
  
  -- Générer un code de partage unique
  v_share_code := LOWER(
    SUBSTRING(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '-', 'g'), 1, 20) || '-' || 
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)
  );
  
  -- S'assurer que le code est unique
  WHILE EXISTS (SELECT 1 FROM salons WHERE share_code = v_share_code) LOOP
    v_share_code := LOWER(
      SUBSTRING(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '-', 'g'), 1, 20) || '-' || 
      SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
    );
  END LOOP;
  
  -- Créer le salon
  INSERT INTO salons (
    name,
    description,
    category,
    city,
    owner_id,
    share_code,
    visibility,
    cover_url,
    emoji,
    theme_color,
    tags,
    color_theme -- Pour la compatibilité avec l'ancienne colonne
  )
  VALUES (
    p_name,
    p_description,
    p_category,
    p_city,
    v_user_id,
    v_share_code,
    p_visibility,
    p_cover_url,
    p_emoji,
    p_theme_color,
    p_tags,
    p_theme_color -- Utiliser theme_color pour color_theme aussi
  )
  RETURNING * INTO v_salon;
  
  -- Ajouter le créateur comme membre admin
  INSERT INTO salon_members (salon_id, user_id, role)
  VALUES (v_salon.id, v_user_id, 'admin')
  ON CONFLICT (salon_id, user_id) DO NOTHING;
  
  -- Mettre à jour le compteur de membres
  UPDATE salons 
  SET member_count = 1 
  WHERE id = v_salon.id;
  
  RETURN v_salon;
END;
$$;

-- 7. Créer une vue pour les salons avec tous les détails
CREATE OR REPLACE VIEW salons_with_full_details AS
SELECT 
  s.*,
  p.display_name as owner_name,
  p.avatar_url as owner_avatar,
  COALESCE(
    (SELECT COUNT(*) FROM salon_members WHERE salon_id = s.id),
    0
  ) as real_member_count,
  COALESCE(
    (SELECT COUNT(*) FROM messages WHERE salon_id = s.id),
    0
  ) as real_message_count
FROM salons s
LEFT JOIN profiles p ON s.owner_id = p.id;

-- 8. Permissions pour la vue
GRANT SELECT ON salons_with_full_details TO authenticated;
GRANT SELECT ON salons_with_full_details TO anon;

-- 9. Fonction pour rechercher des salons par tags
CREATE OR REPLACE FUNCTION search_salons_by_tags(p_tags TEXT[])
RETURNS SETOF salons
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM salons s
  WHERE s.tags && p_tags -- Opérateur && pour l'intersection d'arrays
    AND s.is_active = true
    AND s.visibility = 'public'
  ORDER BY 
    array_length(s.tags & p_tags, 1) DESC, -- Plus de tags en commun = plus pertinent
    s.member_count DESC;
END;
$$;

-- 10. Fonction pour obtenir des suggestions de salons
CREATE OR REPLACE FUNCTION get_salon_suggestions(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS SETOF salons
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM salons s
  WHERE s.is_active = true
    AND s.visibility = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM salon_members sm 
      WHERE sm.salon_id = s.id 
      AND sm.user_id = p_user_id
    )
  ORDER BY 
    s.member_count DESC,
    s.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 11. Mettre à jour les salons existants avec des valeurs par défaut
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

-- 12. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_salons_category ON salons(category);
CREATE INDEX IF NOT EXISTS idx_salons_city ON salons(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_salons_created_at ON salons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salons_member_count ON salons(member_count DESC);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration des salons terminée avec succès !';
  RAISE NOTICE 'Nouvelles colonnes ajoutées : visibility, cover_url, emoji, theme_color, tags';
  RAISE NOTICE 'Bucket Storage salon-covers créé avec policies RLS';
  RAISE NOTICE 'Fonction create_salon_with_code mise à jour';
END $$;
