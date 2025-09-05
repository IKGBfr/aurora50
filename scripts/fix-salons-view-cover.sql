-- Script pour corriger la vue salons_with_details et inclure tous les nouveaux champs

-- 1. Supprimer l'ancienne vue si elle existe
DROP VIEW IF EXISTS salons_with_details CASCADE;

-- 2. Créer la nouvelle vue avec tous les champs nécessaires
CREATE OR REPLACE VIEW salons_with_details AS
SELECT 
  s.id,
  s.name,
  s.description,
  s.category,
  s.city,
  s.owner_id,
  s.share_code,
  s.member_count,
  s.message_count,
  s.avatar_url,
  s.color_theme,
  s.is_active,
  s.created_at,
  s.updated_at,
  -- Nouveaux champs ajoutés
  s.visibility,
  s.cover_url,
  s.emoji,
  s.theme_color,
  s.tags,
  -- Infos du propriétaire
  p.full_name as owner_name,
  p.avatar_url as owner_avatar,
  -- Compteurs réels
  COALESCE(
    (SELECT COUNT(*) FROM salon_members WHERE salon_id = s.id),
    0
  ) as real_member_count
FROM salons s
LEFT JOIN profiles p ON s.owner_id = p.id
WHERE s.is_active = true;

-- 3. Permissions pour la vue
GRANT SELECT ON salons_with_details TO authenticated;
GRANT SELECT ON salons_with_details TO anon;

-- 4. Créer aussi une vue pour "mes salons" avec tous les champs
DROP VIEW IF EXISTS my_salons CASCADE;

CREATE OR REPLACE VIEW my_salons AS
SELECT 
  s.id,
  s.name,
  s.description,
  s.category,
  s.city,
  s.owner_id,
  s.share_code,
  s.member_count,
  s.message_count,
  s.avatar_url,
  s.color_theme,
  s.is_active,
  s.created_at,
  s.updated_at,
  -- Nouveaux champs
  s.visibility,
  s.cover_url,
  s.emoji,
  s.theme_color,
  s.tags,
  -- Infos du propriétaire
  p.full_name as owner_name,
  p.avatar_url as owner_avatar,
  -- Info de membership
  sm.role,
  sm.joined_at
FROM salons s
INNER JOIN salon_members sm ON s.id = sm.salon_id
LEFT JOIN profiles p ON s.owner_id = p.id
WHERE sm.user_id = auth.uid()
  AND s.is_active = true;

-- 5. Permissions pour my_salons
GRANT SELECT ON my_salons TO authenticated;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Vues salons_with_details et my_salons mises à jour avec succès !';
  RAISE NOTICE 'Nouveaux champs inclus : cover_url, emoji, theme_color, tags, visibility';
END $$;
