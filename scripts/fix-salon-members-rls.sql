-- ============================================
-- FIX POUR LA RÉCURSION INFINIE DANS RLS SALON_MEMBERS
-- ============================================
-- Problème : La politique originale créait une récursion infinie
-- en référençant salon_members dans sa propre condition
-- Solution : Utiliser des politiques simples sans auto-référence
-- ============================================

-- 1. Créer les tables si elles n'existent pas
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

CREATE TABLE IF NOT EXISTS public.salon_members (
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT true,
  PRIMARY KEY (salon_id, user_id)
);

-- 2. Ajouter les autres tables nécessaires
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

-- 3. Ajouter salon_id à chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id) ON DELETE CASCADE;

-- 4. Ajouter colonnes au profil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_salon_id UUID REFERENCES salons(id),
ADD COLUMN IF NOT EXISTS salons_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS salons_joined INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- 5. Créer les indexes
CREATE INDEX IF NOT EXISTS idx_salons_share_code ON salons(share_code);
CREATE INDEX IF NOT EXISTS idx_salons_owner ON salons(owner_id);
CREATE INDEX IF NOT EXISTS idx_salons_active ON salons(is_active);
CREATE INDEX IF NOT EXISTS idx_salon_members_user ON salon_members(user_id);
CREATE INDEX IF NOT EXISTS idx_salon_members_salon ON salon_members(salon_id);
CREATE INDEX IF NOT EXISTS idx_messages_salon_created ON chat_messages(salon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON salon_invitations(code);
CREATE INDEX IF NOT EXISTS idx_invitations_salon ON salon_invitations(salon_id);

-- ============================================
-- POLITIQUES RLS CORRIGÉES (SANS RÉCURSION)
-- ============================================

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Membres visibles dans le salon" ON salon_members;
DROP POLICY IF EXISTS "Peut rejoindre un salon" ON salon_members;
DROP POLICY IF EXISTS "Peut quitter un salon" ON salon_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON salon_members;
DROP POLICY IF EXISTS "Members can view salon members" ON salon_members;
DROP POLICY IF EXISTS "Users can join salons" ON salon_members;
DROP POLICY IF EXISTS "Users can leave salons" ON salon_members;
DROP POLICY IF EXISTS "Users can update their membership" ON salon_members;
DROP POLICY IF EXISTS "Authenticated users can view all members" ON salon_members;

-- Activer RLS
ALTER TABLE salon_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_invitations ENABLE ROW LEVEL SECURITY;

-- POLITIQUES POUR SALON_MEMBERS (SIMPLES, SANS RÉCURSION)
CREATE POLICY "Authenticated users can view all members" ON salon_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join salons" ON salon_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave salons" ON salon_members
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can update their membership" ON salon_members
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- POLITIQUES POUR SALONS
DROP POLICY IF EXISTS "Anyone can view active salons" ON salons;
DROP POLICY IF EXISTS "Users can create salons" ON salons;
DROP POLICY IF EXISTS "Owners can update their salons" ON salons;
DROP POLICY IF EXISTS "Owners can delete their salons" ON salons;

CREATE POLICY "Anyone can view active salons" ON salons
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can create salons" ON salons
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their salons" ON salons
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their salons" ON salons
  FOR DELETE USING (owner_id = auth.uid());

-- POLITIQUES POUR INVITATIONS
CREATE POLICY "Members can view invitations" ON salon_invitations
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_id = salon_invitations.salon_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create invitations" ON salon_invitations
  FOR INSERT WITH CHECK (created_by = auth.uid());

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
  
  -- Mettre à jour le profil
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
  
  -- Vérifier limite membres
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

-- ============================================
-- SALON GÉNÉRAL PAR DÉFAUT
-- ============================================

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
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;
