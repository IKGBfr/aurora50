-- Migration Freemium Aurora50
-- Date: 31/08/2025
-- Description: Ajout des champs nécessaires pour le modèle freemium

-- Étendre la table profiles avec les nouveaux champs freemium
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_answers JSONB,
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free' 
  CHECK (subscription_type IN ('free', 'premium', 'trial')),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conversion_triggers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_chat_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_reset TIMESTAMPTZ DEFAULT NOW();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_subscription 
  ON profiles(subscription_type);

CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends 
  ON profiles(trial_ends_at) 
  WHERE trial_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
  ON profiles(onboarding_completed);

-- Vue pour les utilisateurs premium (incluant ceux en période d'essai)
CREATE OR REPLACE VIEW premium_users AS
SELECT * FROM profiles 
WHERE subscription_type IN ('premium', 'trial')
  AND (trial_ends_at IS NULL OR trial_ends_at > NOW());

-- Fonction pour réinitialiser les compteurs quotidiens
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    daily_chat_count = 0,
    daily_profile_views = 0,
    last_activity_reset = NOW()
  WHERE 
    last_activity_reset < CURRENT_DATE
    AND subscription_type = 'free';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les limites freemium
CREATE OR REPLACE FUNCTION check_freemium_limit(
  user_id UUID,
  limit_type TEXT,
  limit_value INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  user_subscription TEXT;
BEGIN
  -- Récupérer le type d'abonnement
  SELECT subscription_type INTO user_subscription
  FROM profiles
  WHERE id = user_id;
  
  -- Les utilisateurs premium n'ont pas de limites
  IF user_subscription IN ('premium', 'trial') THEN
    RETURN TRUE;
  END IF;
  
  -- Vérifier la limite selon le type
  IF limit_type = 'chat' THEN
    SELECT daily_chat_count INTO current_count
    FROM profiles
    WHERE id = user_id;
  ELSIF limit_type = 'profile_view' THEN
    SELECT daily_profile_views INTO current_count
    FROM profiles
    WHERE id = user_id;
  ELSE
    RETURN FALSE;
  END IF;
  
  -- Retourner true si sous la limite
  RETURN current_count < limit_value;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter les compteurs d'usage
CREATE OR REPLACE FUNCTION increment_usage_counter(
  user_id UUID,
  counter_type TEXT
)
RETURNS void AS $$
BEGIN
  IF counter_type = 'chat' THEN
    UPDATE profiles
    SET daily_chat_count = daily_chat_count + 1
    WHERE id = user_id;
  ELSIF counter_type = 'profile_view' THEN
    UPDATE profiles
    SET daily_profile_views = daily_profile_views + 1
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer les triggers de conversion
CREATE OR REPLACE FUNCTION log_conversion_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversion_triggers IS NULL THEN
    NEW.conversion_triggers = '[]'::jsonb;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_conversion_triggers
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_conversion_trigger();

-- Commentaires pour documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indique si l''utilisateur a complété l''onboarding';
COMMENT ON COLUMN profiles.onboarding_answers IS 'Réponses aux questions d''onboarding en format JSON';
COMMENT ON COLUMN profiles.subscription_type IS 'Type d''abonnement: free, trial, ou premium';
COMMENT ON COLUMN profiles.subscription_started_at IS 'Date de début de l''abonnement actuel';
COMMENT ON COLUMN profiles.trial_ends_at IS 'Date de fin de la période d''essai';
COMMENT ON COLUMN profiles.conversion_triggers IS 'Liste des triggers de conversion déclenchés';
COMMENT ON COLUMN profiles.daily_chat_count IS 'Nombre de messages chat envoyés aujourd''hui';
COMMENT ON COLUMN profiles.daily_profile_views IS 'Nombre de profils consultés aujourd''hui';
COMMENT ON COLUMN profiles.last_activity_reset IS 'Dernière réinitialisation des compteurs quotidiens';
