-- Migration: Ajouter les colonnes de tracking aux leçons
-- Aurora50 - Colonnes essentielles pour le système de progression

-- Ajouter les colonnes manquantes à la table lessons
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS lesson_number INTEGER,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15;

-- Mettre à jour les premières leçons de chaque pilier comme gratuites
UPDATE lessons l
SET is_free = true
FROM (
  SELECT DISTINCT ON (course_id) id
  FROM lessons
  ORDER BY course_id, id
) first_lessons
WHERE l.id = first_lessons.id;

-- Ajouter les numéros de leçons (ordre séquentiel par cours)
WITH numbered_lessons AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY id) as num
  FROM lessons
)
UPDATE lessons
SET lesson_number = nl.num
FROM numbered_lessons nl
WHERE lessons.id = nl.id;

-- Ajouter des URLs YouTube de placeholder pour les tests
-- (À remplacer par les vraies URLs plus tard)
UPDATE lessons
SET video_url = CASE 
  WHEN is_free = true THEN 'dQw4w9WgXcQ'  -- Vidéo de test (Rick Roll pour l'humour)
  ELSE 'VGqksvn6x0E'  -- Autre vidéo de test
END
WHERE video_url IS NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_lessons_course_number ON lessons(course_id, lesson_number);
CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons(is_free);

-- Commentaires pour documentation
COMMENT ON COLUMN lessons.lesson_number IS 'Numéro de la leçon dans le cours (ordre séquentiel)';
COMMENT ON COLUMN lessons.is_free IS 'Indique si la leçon est accessible gratuitement';
COMMENT ON COLUMN lessons.video_url IS 'ID YouTube de la vidéo de la leçon';
COMMENT ON COLUMN lessons.duration_minutes IS 'Durée estimée de la leçon en minutes';
