-- Ajouter les colonnes nécessaires pour suppression et réponse
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_to_id BIGINT REFERENCES public.chat_messages(id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_deleted ON public.chat_messages(is_deleted);

-- Fonction RPC pour supprimer un message (soft delete)
CREATE OR REPLACE FUNCTION delete_message(p_message_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur est le propriétaire du message
  IF NOT EXISTS (
    SELECT 1 FROM chat_messages 
    WHERE id = p_message_id AND user_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;
  
  -- Soft delete : marquer comme supprimé
  UPDATE chat_messages 
  SET 
    is_deleted = true,
    deleted_at = NOW(),
    content = '🚫 Message supprimé' -- Remplacer le contenu
  WHERE id = p_message_id;
  
  RETURN true;
END;
$$;

-- Fonction pour récupérer les infos d'un message pour la réponse
CREATE OR REPLACE FUNCTION get_reply_message_info(p_message_id BIGINT)
RETURNS TABLE(
  id BIGINT,
  content TEXT,
  author_name TEXT,
  is_deleted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    COALESCE(p.full_name, 'Membre Aurora50') as author_name,
    m.is_deleted
  FROM chat_messages m
  LEFT JOIN profiles p ON m.user_id = p.id
  WHERE m.id = p_message_id;
END;
$$;

-- Mettre à jour les politiques RLS pour permettre la lecture des messages supprimés
-- (pour afficher "Message supprimé")
DROP POLICY IF EXISTS "Users can view messages" ON chat_messages;
CREATE POLICY "Users can view messages" ON chat_messages
  FOR SELECT USING (true);

-- Politique pour la suppression (soft delete uniquement pour ses propres messages)
DROP POLICY IF EXISTS "Users can soft delete own messages" ON chat_messages;
CREATE POLICY "Users can soft delete own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
