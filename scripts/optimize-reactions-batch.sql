-- Fonction RPC batch pour charger toutes les réactions en un seul appel
-- Cette fonction remplace les multiples appels individuels par un seul appel optimisé

CREATE OR REPLACE FUNCTION get_all_message_reactions_batch(
  p_message_ids BIGINT[]
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  RETURN (
    SELECT jsonb_object_agg(
      message_id::text,
      reactions
    )
    FROM (
      SELECT 
        mr.message_id,
        jsonb_agg(
          jsonb_build_object(
            'emoji', mr.emoji,
            'count', counts.count,
            'has_reacted', v_user_id = ANY(counts.user_ids),
            'users', counts.users
          ) ORDER BY mr.emoji
        ) as reactions
      FROM (
        SELECT 
          message_id,
          emoji,
          COUNT(*)::int as count,
          array_agg(user_id) as user_ids,
          jsonb_agg(
            jsonb_build_object(
              'user_id', p.id,
              'full_name', p.full_name,
              'avatar_url', p.avatar_url
            )
          ) as users
        FROM message_reactions mr
        JOIN profiles p ON p.id = mr.user_id
        WHERE message_id = ANY(p_message_ids)
        GROUP BY message_id, emoji
      ) as counts
      JOIN message_reactions mr 
        ON mr.message_id = counts.message_id 
        AND mr.emoji = counts.emoji
      GROUP BY mr.message_id
    ) as grouped
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_message_reactions_batch(BIGINT[]) TO authenticated;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id 
ON message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id 
ON message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji 
ON message_reactions(emoji);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_user 
ON message_reactions(message_id, user_id);

COMMENT ON FUNCTION get_all_message_reactions_batch IS 
'Fonction optimisée pour charger toutes les réactions de plusieurs messages en un seul appel. 
Retourne un objet JSON avec les message_id comme clés et les réactions groupées comme valeurs.';
