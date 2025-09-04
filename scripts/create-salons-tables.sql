-- ============================================
-- CRÉATION DES TABLES POUR LE SYSTÈME DE SALONS
-- ============================================
-- IMPORTANT: Ce script ajoute le système de salons
-- en RÉUTILISANT le chat existant à 95%
-- ============================================

-- 1. Table principale des salons (SIMPLIFIÉE pour MVP)
CREATE TABLE IF NOT EXISTS public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'local', 'business', 'wellness', 'hobby', 'dating', 'other')),
  city TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE NOT NULL,
  member_count INTEGER DEFAULT 1,
  message_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  color_theme TEXT DEFAULT '#8B5CF6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des membres des salons
CREATE TABLE IF NOT EXISTS public.salon_members (
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT true,
  PRIMARY KEY (salon_id, user_id)
);

-- 3. IMPORTANT : Ajouter salon_id à chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id) ON DELETE CASCADE;

-- 4. Table des invitations (pour tracking viral)
CREATE TABLE IF NOT EXISTS public.salon_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- 5. Ajouter colonnes manquantes au profil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_salon_id UUID REFERENCES salons(id),
ADD COLUMN IF NOT EXISTS salons_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS salons_joined INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- ============================================
-- INDEXES POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_salons_share_code ON salons(share_code);
CREATE INDEX IF NOT EXISTS idx_salons_owner ON salons(owner_id);
CREATE INDEX IF NOT EXISTS idx_salons_active ON salons(is_active);

CREATE INDEX IF NOT EXISTS idx_salon_members_user ON salon_members(user_id);
CREATE INDEX IF NOT EXISTS idx_salon_members_salon ON salon_members(salon_id);

CREATE INDEX IF NOT EXISTS idx_messages_salon_created ON chat_messages(salon_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invitations_code ON salon_invitations(code);
CREATE INDEX IF NOT EXISTS idx_invitations_salon ON salon_invitations(salon_id);

-- ============================================
-- FONCTIONS RPC
-- ============================================

-- Fonction pour créer un salon avec code unique
CREATE OR REPLACE FUNCTION create_salon_with_code(
  p_name TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_city TEXT DEFAULT NULL
) RETURNS salons AS $$
DECLARE
  v_salon salons;
  v_code TEXT;
  v_slug TEXT;
BEGIN
  -- Vérifier que l'utilisateur est premium
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND subscription_type IN ('premium', 'trial', 'founder')
  ) THEN
    RAISE EXCEPTION 'Seuls les membres premium peuvent créer des salons';
  END IF;

  -- Générer slug et code unique
  v_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_code := v_slug || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
  
  -- Créer le salon
  INSERT INTO salons (name, description, category, city, owner_id, share_code)
  VALUES (p_name, p_description, p_category, p_city, auth.uid(), v_code)
  RETURNING * INTO v_salon;
  
  -- Ajouter le créateur comme owner
  INSERT INTO salon_members (salon_id, user_id, role)
  VALUES (v_salon.id, auth.uid(), 'owner');
  
  -- Incrémenter le compteur dans profiles
  UPDATE profiles 
  SET salons_created = COALESCE(salons_created, 0) + 1,
      current_salon_id = v_salon.id
  WHERE id = auth.uid();
  
  RETURN v_salon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rejoindre un salon via code
CREATE OR REPLACE FUNCTION join_salon_via_code(
  p_code TEXT
) RETURNS JSONB AS $$
DECLARE
  v_salon_id UUID;
  v_salon_name TEXT;
  v_member_count INTEGER;
  v_result JSONB;
BEGIN
  -- Trouver le salon
  SELECT id, name, member_count 
  INTO v_salon_id, v_salon_name, v_member_count 
  FROM salons 
  WHERE share_code = p_code AND is_active = true;
  
  IF v_salon_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Salon introuvable ou inactif');
  END IF;
  
  -- Vérifier si déjà membre
  IF EXISTS (SELECT 1 FROM salon_members WHERE salon_id = v_salon_id AND user_id = auth.uid()) THEN
    RETURN jsonb_build_object('success', true, 'salon_id', v_salon_id, 'already_member', true);
  END IF;
  
  -- Vérifier limite membres (100 pour freemium)
  IF v_member_count >= 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Salon complet (limite 100 membres)');
  END IF;
  
  -- Ajouter le membre
  INSERT INTO salon_members (salon_id, user_id)
  VALUES (v_salon_id, auth.uid());
  
  -- Mettre à jour les stats
  UPDATE salons 
  SET member_count = member_count + 1,
      updated_at = NOW()
  WHERE id = v_salon_id;
  
  UPDATE profiles 
  SET salons_joined = COALESCE(salons_joined, 0) + 1,
      current_salon_id = v_salon_id
  WHERE id = auth.uid();
  
  RETURN jsonb_build_object(
    'success', true, 
    'salon_id', v_salon_id,
    'salon_name', v_salon_name,
    'member_count', v_member_count + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une invitation
CREATE OR REPLACE FUNCTION create_salon_invitation(
  p_salon_id UUID
) RETURNS salon_invitations AS $$
DECLARE
  v_invitation salon_invitations;
  v_code TEXT;
BEGIN
  -- Vérifier que l'utilisateur est membre du salon
  IF NOT EXISTS (
    SELECT 1 FROM salon_members 
    WHERE salon_id = p_salon_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorisé à créer une invitation pour ce salon';
  END IF;
  
  -- Générer code unique
  v_code := 'INV-' || SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 8);
  
  -- Créer l'invitation
  INSERT INTO salon_invitations (
    salon_id, 
    code, 
    created_by
  )
  VALUES (
    p_salon_id, 
    v_code, 
    auth.uid()
  )
  RETURNING * INTO v_invitation;
  
  RETURN v_invitation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLICIES RLS
-- ============================================

-- SALONS
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salons visibles par tous les membres connectés" ON salons
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Premium peut créer des salons" ON salons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND subscription_type IN ('premium', 'trial', 'founder')
    )
  );

CREATE POLICY "Owner peut modifier son salon" ON salons
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner peut supprimer son salon" ON salons
  FOR DELETE USING (owner_id = auth.uid());

-- SALON_MEMBERS
ALTER TABLE salon_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membres visibles dans le salon" ON salon_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salon_members sm 
      WHERE sm.salon_id = salon_members.salon_id 
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Peut rejoindre un salon" ON salon_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Peut quitter un salon" ON salon_members
  FOR DELETE USING (user_id = auth.uid());

-- INVITATIONS
ALTER TABLE salon_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invitations visibles par les membres" ON salon_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = salon_invitations.salon_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membres peuvent créer des invitations" ON salon_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = salon_invitations.salon_id 
      AND user_id = auth.uid()
    )
  );

-- MESSAGES (mise à jour pour salons)
DROP POLICY IF EXISTS "Messages visibles à tous les utilisateurs connectés" ON chat_messages;
DROP POLICY IF EXISTS "Utilisateurs connectés peuvent envoyer des messages" ON chat_messages;

CREATE POLICY "Messages visibles selon le salon" ON chat_messages
  FOR SELECT USING (
    salon_id IS NULL -- Messages du chat général
    OR EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = chat_messages.salon_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membres peuvent envoyer des messages dans leur salon" ON chat_messages
  FOR INSERT WITH CHECK (
    (salon_id IS NULL AND auth.uid() IS NOT NULL) -- Chat général pour tous
    OR EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = chat_messages.salon_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- CRÉER UN SALON GÉNÉRAL PAR DÉFAUT
-- ============================================

-- Salon général (ID fixe pour faciliter les références)
INSERT INTO salons (
  id, 
  name, 
  description, 
  share_code,
  category,
  owner_id
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Chat Général Aurora50',
  'Espace de discussion ouvert à toutes les membres',
  'general',
  'general',
  (SELECT id FROM auth.users LIMIT 1) -- Premier user comme owner temporaire
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue pour lister les salons avec infos complètes
CREATE OR REPLACE VIEW salons_with_details AS
SELECT 
  s.*,
  p.full_name as owner_name,
  p.avatar_url as owner_avatar,
  COUNT(DISTINCT sm.user_id) as actual_member_count,
  COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > NOW() - INTERVAL '24 hours') as messages_today
FROM salons s
LEFT JOIN profiles p ON s.owner_id = p.id
LEFT JOIN salon_members sm ON s.id = sm.salon_id
LEFT JOIN chat_messages m ON s.id = m.salon_id
GROUP BY s.id, p.full_name, p.avatar_url;

-- Vue pour les salons d'un utilisateur
CREATE OR REPLACE VIEW my_salons AS
SELECT 
  s.*,
  sm.role,
  sm.joined_at,
  sm.last_seen_at
FROM salons s
JOIN salon_members sm ON s.id = sm.salon_id
WHERE sm.user_id = auth.uid();

-- Donner les permissions sur les vues
GRANT SELECT ON salons_with_details TO authenticated;
GRANT SELECT ON my_salons TO authenticated;
