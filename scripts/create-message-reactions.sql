-- Script de migration pour créer le système de réactions emoji
-- Date: 2025-09-02

-- 1. Créer la table message_reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte unique pour éviter les doublons (un utilisateur = une réaction par message)
  UNIQUE(message_id, user_id)
);

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Politique pour voir toutes les réactions
CREATE POLICY "Users can view all reactions"
  ON public.message_reactions
  FOR SELECT
  USING (true);

-- Politique pour ajouter ses propres réactions
CREATE POLICY "Users can add their own reactions"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour modifier ses propres réactions
CREATE POLICY "Users can update their own reactions"
  ON public.message_reactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour supprimer ses propres réactions
CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Créer la fonction pour toggle une réaction
CREATE OR REPLACE FUNCTION public.toggle_message_reaction(
  p_message_id BIGINT,
  p_emoji TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing_reaction RECORD;
  v_result JSONB;
BEGIN
  -- Récupérer l'utilisateur actuel
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;
  
  -- Vérifier si le message existe
  IF NOT EXISTS (SELECT 1 FROM chat_messages WHERE id = p_message_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Message not found'
    );
  END IF;
  
  -- Vérifier si une réaction existe déjà
  SELECT * INTO v_existing_reaction
  FROM message_reactions 
  WHERE message_id = p_message_id 
    AND user_id = v_user_id
    AND emoji = p_emoji;
  
  IF v_existing_reaction.id IS NOT NULL THEN
    -- Supprimer la réaction existante
    DELETE FROM message_reactions 
    WHERE id = v_existing_reaction.id;
    
    v_result := jsonb_build_object(
      'success', true,
      'action', 'removed',
      'emoji', p_emoji
    );
  ELSE
    -- Ajouter une nouvelle réaction (remplace toute réaction existante de cet utilisateur)
    INSERT INTO message_reactions (message_id, user_id, emoji)
    VALUES (p_message_id, v_user_id, p_emoji)
    ON CONFLICT (message_id, user_id) 
    DO UPDATE SET emoji = EXCLUDED.emoji, created_at = NOW();
    
    v_result := jsonb_build_object(
      'success', true,
      'action', 'added',
      'emoji', p_emoji
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- 6. Créer la fonction pour récupérer toutes les réactions d'un message
CREATE OR REPLACE FUNCTION public.get_message_reactions(
  p_message_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_reactions JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', mr.id,
      'emoji', mr.emoji,
      'user_id', mr.user_id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'created_at', mr.created_at
    ) ORDER BY mr.created_at
  ) INTO v_reactions
  FROM message_reactions mr
  JOIN profiles p ON p.id = mr.user_id
  WHERE mr.message_id = p_message_id;
  
  RETURN COALESCE(v_reactions, '[]'::jsonb);
END;
$$;

-- 7. Créer la fonction pour obtenir un résumé des réactions par emoji
CREATE OR REPLACE FUNCTION public.get_message_reactions_summary(
  p_message_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_summary JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'emoji', emoji_group.emoji,
      'count', emoji_group.count,
      'users', emoji_group.users,
      'has_reacted', emoji_group.has_reacted
    ) ORDER BY emoji_group.first_created
  ) INTO v_summary
  FROM (
    SELECT 
      mr.emoji,
      COUNT(*)::int as count,
      MIN(mr.created_at) as first_created,
      jsonb_agg(
        jsonb_build_object(
          'user_id', p.id,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url
        ) ORDER BY mr.created_at
      ) as users,
      bool_or(mr.user_id = v_user_id) as has_reacted
    FROM message_reactions mr
    JOIN profiles p ON p.id = mr.user_id
    WHERE mr.message_id = p_message_id
    GROUP BY mr.emoji
  ) as emoji_group;
  
  RETURN COALESCE(v_summary, '[]'::jsonb);
END;
$$;

-- 8. Ajouter des commentaires pour la documentation
COMMENT ON TABLE public.message_reactions IS 'Table pour stocker les réactions emoji sur les messages du chat';
COMMENT ON COLUMN public.message_reactions.message_id IS 'ID du message sur lequel la réaction est ajoutée';
COMMENT ON COLUMN public.message_reactions.user_id IS 'ID de l''utilisateur qui a ajouté la réaction';
COMMENT ON COLUMN public.message_reactions.emoji IS 'Emoji utilisé pour la réaction';
COMMENT ON FUNCTION public.toggle_message_reaction IS 'Fonction pour ajouter ou supprimer une réaction emoji sur un message';
COMMENT ON FUNCTION public.get_message_reactions IS 'Fonction pour récupérer toutes les réactions d''un message avec les détails des utilisateurs';
COMMENT ON FUNCTION public.get_message_reactions_summary IS 'Fonction pour obtenir un résumé des réactions groupées par emoji';
