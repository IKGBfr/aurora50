-- ============================================
-- Migration: Section Cours MVP Aurora50
-- Date: 2025-01-29
-- Description: Structure complète pour 2 piliers pilotes
-- ============================================

-- ============================================
-- PARTIE 1: ENRICHISSEMENT DES TABLES EXISTANTES
-- ============================================

-- Enrichir la table courses existante
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS pillar_number INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🌿',
ADD COLUMN IF NOT EXISTS color_gradient TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS preview_video_id TEXT;

-- Enrichir la table lessons existante
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS lesson_number INTEGER,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS youtube_video_id TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'exercise')),
ADD COLUMN IF NOT EXISTS preview_text TEXT,
ADD COLUMN IF NOT EXISTS markdown_content TEXT;

-- Ajouter la contrainte unique après avoir ajouté les colonnes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_lesson_per_course'
    ) THEN
        ALTER TABLE lessons 
        ADD CONSTRAINT unique_lesson_per_course UNIQUE(course_id, lesson_number);
    END IF;
END $$;

-- ============================================
-- PARTIE 2: CRÉATION DES NOUVELLES TABLES
-- ============================================

-- Table de progression détaillée des leçons
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_video_position INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Table des ressources téléchargeables
CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'audio', 'worksheet', 'template', 'guide')),
  file_size_kb INTEGER,
  is_premium BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les quiz (structure simplifiée pour MVP)
CREATE TABLE IF NOT EXISTS lesson_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour tracker les complétions de piliers
CREATE TABLE IF NOT EXISTS user_pillar_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

-- ============================================
-- PARTIE 3: INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_status ON user_lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_free ON lessons(is_free);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);

-- ============================================
-- PARTIE 4: POLITIQUES RLS
-- ============================================

-- RLS pour user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : les utilisateurs peuvent voir leur propre progression
CREATE POLICY "Users can view own progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Politique d'insertion : les utilisateurs peuvent créer leur propre progression
CREATE POLICY "Users can insert own progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour : les utilisateurs peuvent mettre à jour leur propre progression
CREATE POLICY "Users can update own progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS pour lesson_resources
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : tout le monde peut voir les ressources
CREATE POLICY "Public can view resources" ON lesson_resources
  FOR SELECT USING (true);

-- RLS pour user_pillar_completions
ALTER TABLE user_pillar_completions ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : les utilisateurs peuvent voir leurs propres complétions
CREATE POLICY "Users can view own completions" ON user_pillar_completions
  FOR SELECT USING (auth.uid() = user_id);

-- Politique d'insertion : les utilisateurs peuvent créer leurs propres complétions
CREATE POLICY "Users can insert own completions" ON user_pillar_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PARTIE 5: TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour user_lesson_progress
DROP TRIGGER IF EXISTS update_user_lesson_progress_updated_at ON user_lesson_progress;
CREATE TRIGGER update_user_lesson_progress_updated_at
    BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTIE 6: SEED DATA - 2 PILIERS PILOTES
-- ============================================

-- Nettoyer les données existantes pour éviter les conflits
DELETE FROM lessons WHERE course_id IN (
  SELECT id FROM courses WHERE pillar_number IN (1, 3)
);
DELETE FROM courses WHERE pillar_number IN (1, 3);

-- Insérer Pilier 1: Libération Émotionnelle
INSERT INTO courses (
  id,
  title, 
  description, 
  pillar_number, 
  slug, 
  duration_weeks, 
  emoji, 
  color_gradient,
  order_index,
  is_published,
  short_description,
  thumbnail_url
) VALUES (
  gen_random_uuid(),
  'Libération Émotionnelle',
  'Libérez-vous des blocages invisibles qui vous retiennent depuis des années. Ce pilier fondamental vous guide à travers un processus de guérison profonde pour retrouver votre liberté intérieure et votre joie de vivre.',
  1,
  'liberation-emotionnelle',
  4,
  '🦋',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  1,
  true,
  'Guérir et pardonner pour renaître',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800'
);

-- Insérer Pilier 3: Renaissance Professionnelle
INSERT INTO courses (
  id,
  title,
  description,
  pillar_number,
  slug,
  duration_weeks,
  emoji,
  color_gradient,
  order_index,
  is_published,
  short_description,
  thumbnail_url
) VALUES (
  gen_random_uuid(),
  'Renaissance Professionnelle',
  'Réinventez votre carrière et découvrez vos talents cachés après 50 ans. Ce pilier vous accompagne dans votre transformation professionnelle avec des stratégies concrètes et adaptées à votre expérience unique.',
  3,
  'renaissance-professionnelle',
  6,
  '💼',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  2,
  true,
  'Vos talents valent de l''or',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800'
);

-- Insérer les leçons pour le Pilier 1
WITH pillar1 AS (
  SELECT id FROM courses WHERE pillar_number = 1
)
INSERT INTO lessons (
  course_id, 
  lesson_number, 
  title, 
  slug, 
  is_free, 
  youtube_video_id, 
  duration_minutes, 
  markdown_content, 
  preview_text,
  lesson_type
)
SELECT 
  p.id,
  l.lesson_number,
  l.title,
  l.slug,
  l.is_free,
  l.youtube_video_id,
  l.duration_minutes,
  l.markdown_content,
  l.preview_text,
  'video'
FROM pillar1 p
CROSS JOIN (VALUES
  (1, 'Comprendre ses blocages invisibles', 'blocages-invisibles', true, 'dQw4w9WgXcQ', 12, 
   E'# Comprendre ses blocages invisibles\n\n## Introduction\n\nDans cette première leçon gratuite, nous allons explorer ensemble les mécanismes cachés qui vous empêchent d''avancer.\n\n## Les 3 types de blocages\n\n### 1. Blocages émotionnels\nCes blocages sont souvent liés à des expériences passées non résolues.\n\n### 2. Blocages mentaux\nLes croyances limitantes qui se sont installées au fil des années.\n\n### 3. Blocages énergétiques\nLes tensions accumulées dans le corps qui bloquent votre énergie vitale.\n\n## Exercice pratique\n\nPrenez un moment pour identifier vos propres blocages...', 
   'Cette leçon gratuite vous révèle les mécanismes cachés qui vous empêchent d''avancer et vous donne les clés pour commencer votre libération.'),
  
  (2, 'Guérir la petite fille intérieure', 'guerir-enfant-interieur', false, 'VIDEO_ID_2', 15, 
   E'# Guérir la petite fille intérieure\n\n## Retrouver l''enfant en vous\n\nCette leçon vous guide dans un processus de reconnexion avec votre enfant intérieur...',
   'Apprenez à reconnaître et guérir les blessures de votre enfant intérieur pour libérer votre potentiel.'),
  
  (3, 'Pardonner (aux autres et à soi)', 'pardon-liberation', false, 'VIDEO_ID_3', 14, 
   E'# Le pouvoir du pardon\n\n## Pourquoi le pardon est essentiel\n\nLe pardon n''est pas pour l''autre, c''est pour vous...',
   'Le pardon est la clé de votre libération. Découvrez comment pardonner vraiment et définitivement.'),
  
  (4, 'Technique EFT adaptée 50+', 'eft-technique', false, 'VIDEO_ID_4', 18, 
   E'# EFT pour les 50+\n\n## Une méthode adaptée à vos besoins\n\nL''EFT (Emotional Freedom Technique) spécialement conçue pour les femmes de plus de 50 ans...',
   'L''EFT spécialement conçu pour les femmes 50+ : libérez vos émotions en douceur.'),
  
  (5, 'Rituel de libération du passé', 'rituel-liberation', false, 'VIDEO_ID_5', 20, 
   E'# Rituel de libération\n\n## Créer votre cérémonie personnelle\n\nUn rituel puissant pour marquer votre renaissance...',
   'Un rituel transformateur pour clôturer le passé et accueillir votre nouvelle vie.')
) AS l(lesson_number, title, slug, is_free, youtube_video_id, duration_minutes, markdown_content, preview_text);

-- Insérer les leçons pour le Pilier 3
WITH pillar3 AS (
  SELECT id FROM courses WHERE pillar_number = 3
)
INSERT INTO lessons (
  course_id, 
  lesson_number, 
  title, 
  slug, 
  is_free, 
  youtube_video_id, 
  duration_minutes, 
  markdown_content, 
  preview_text,
  lesson_type
)
SELECT 
  p.id,
  l.lesson_number,
  l.title,
  l.slug,
  l.is_free,
  l.youtube_video_id,
  l.duration_minutes,
  l.markdown_content,
  l.preview_text,
  'video'
FROM pillar3 p
CROSS JOIN (VALUES
  (1, 'Identifier ses talents cachés', 'talents-caches', true, 'jNQXAC9IVRw', 15, 
   E'# Identifier vos talents cachés\n\n## Test de découverte\n\nDans cette leçon gratuite, vous allez découvrir vos talents uniques grâce à notre méthode exclusive.\n\n## Les 4 catégories de talents\n\n### 1. Talents naturels\nCe que vous faites sans effort\n\n### 2. Talents acquis\nVos compétences développées au fil des années\n\n### 3. Talents dormants\nCe que vous avez mis de côté\n\n### 4. Talents émergents\nCe qui commence à se révéler\n\n## Votre test personnalisé\n\nRépondez aux questions suivantes pour identifier vos talents...', 
   'Découvrez gratuitement vos talents uniques grâce à notre test exclusif et commencez votre renaissance professionnelle.'),
  
  (2, 'Vaincre le syndrome de l''imposteur', 'syndrome-imposteur', false, 'VIDEO_ID_7', 13, 
   E'# Vaincre le syndrome de l''imposteur\n\n## Vous méritez votre succès\n\nLibérez-vous définitivement du syndrome de l''imposteur...',
   'Libérez-vous du syndrome de l''imposteur et osez enfin briller à votre juste valeur.'),
  
  (3, 'LinkedIn pour les 50+', 'linkedin-50plus', false, 'VIDEO_ID_8', 16, 
   E'# LinkedIn stratégique pour les 50+\n\n## Votre vitrine professionnelle\n\nOptimisez votre profil LinkedIn pour attirer les bonnes opportunités...',
   'Maîtrisez LinkedIn pour valoriser votre expérience et attirer les opportunités.'),
  
  (4, 'Lancer une activité solo', 'activite-solo', false, 'VIDEO_ID_9', 18, 
   E'# Lancer votre activité solo\n\n## Le guide complet\n\nTout ce que vous devez savoir pour lancer votre activité en solo après 50 ans...',
   'Tout pour lancer votre activité solo : statuts, stratégie, premiers clients.'),
  
  (5, 'Négocier sa valeur', 'negocier-valeur', false, 'VIDEO_ID_10', 14, 
   E'# Négocier votre juste valeur\n\n## Techniques de négociation\n\nApprenez à négocier ce que vous valez vraiment...',
   'Apprenez à négocier ce que vous valez vraiment, sans complexe ni culpabilité.'),
  
  (6, 'Transmission et mentorat', 'transmission-mentorat', false, 'VIDEO_ID_11', 17, 
   E'# Devenir mentor\n\n## Transmettre votre savoir\n\nTransformez votre expérience en valeur pour les autres...',
   'Transformez votre expérience en source de revenus grâce au mentorat.')
) AS l(lesson_number, title, slug, is_free, youtube_video_id, duration_minutes, markdown_content, preview_text);

-- ============================================
-- PARTIE 7: DONNÉES DE TEST (OPTIONNEL)
-- ============================================

-- Ajouter quelques ressources pour les leçons gratuites
WITH free_lessons AS (
  SELECT l.id, l.title 
  FROM lessons l 
  JOIN courses c ON l.course_id = c.id 
  WHERE l.is_free = true
)
INSERT INTO lesson_resources (lesson_id, title, description, file_type, is_premium)
SELECT 
  id,
  'Guide PDF - ' || title,
  'Document d''accompagnement pour la leçon',
  'pdf',
  false
FROM free_lessons;

-- ============================================
-- PARTIE 8: VUES UTILES
-- ============================================

-- Vue pour afficher la progression par utilisateur et par pilier
CREATE OR REPLACE VIEW user_pillar_progress AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.pillar_number,
  c.slug as course_slug,
  ulp.user_id,
  COUNT(DISTINCT l.id) as total_lessons,
  COUNT(DISTINCT CASE WHEN ulp.status = 'completed' THEN ulp.lesson_id END) as completed_lessons,
  ROUND(
    COUNT(DISTINCT CASE WHEN ulp.status = 'completed' THEN ulp.lesson_id END)::numeric / 
    COUNT(DISTINCT l.id)::numeric * 100, 
    0
  ) as progress_percentage
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id
WHERE c.is_published = true
GROUP BY c.id, c.title, c.pillar_number, c.slug, ulp.user_id;

-- Vue pour les statistiques globales des cours
CREATE OR REPLACE VIEW course_statistics AS
SELECT 
  c.id,
  c.title,
  c.pillar_number,
  COUNT(DISTINCT l.id) as total_lessons,
  COUNT(DISTINCT CASE WHEN l.is_free THEN l.id END) as free_lessons,
  SUM(l.duration_minutes) as total_duration_minutes,
  COUNT(DISTINCT ulp.user_id) as enrolled_users,
  COUNT(DISTINCT CASE WHEN ulp.status = 'completed' THEN ulp.user_id END) as completed_users
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id
WHERE c.is_published = true
GROUP BY c.id, c.title, c.pillar_number;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration Section Cours MVP complétée avec succès!';
  RAISE NOTICE '- 2 piliers créés (Libération Émotionnelle, Renaissance Professionnelle)';
  RAISE NOTICE '- 11 leçons ajoutées (5 + 6)';
  RAISE NOTICE '- 2 leçons gratuites configurées';
  RAISE NOTICE '- Tables de progression créées';
  RAISE NOTICE '- Politiques RLS activées';
  RAISE NOTICE '- Index de performance ajoutés';
END $$;
