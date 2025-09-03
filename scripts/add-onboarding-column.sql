-- Ajouter la colonne onboarding_completed à la table profiles
-- Cette colonne permet de tracker si un utilisateur a complété l'onboarding

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Mettre à jour les profils existants qui ont déjà un full_name comme ayant complété l'onboarding
UPDATE profiles 
SET onboarding_completed = true 
WHERE full_name IS NOT NULL 
  AND full_name != ''
  AND onboarding_completed = false;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indique si l''utilisateur a complété le processus d''onboarding initial';
