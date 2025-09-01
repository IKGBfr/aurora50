-- ============================================
-- Script complet pour le système de tracking des leçons
-- Aurora50 - Création des tables de base et de tracking
-- ============================================

-- ============================================
-- PARTIE 1: CRÉATION DES TABLES DE BASE
-- ============================================

-- Créer la table courses si elle n'existe pas
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pillar_number INTEGER UNIQUE,
  slug TEXT UNIQUE,
  duration_weeks INTEGER,
  thumbnail_url TEXT,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  emoji TEXT DEFAULT '🌿',
  color_gradient TEXT,
  short_description TEXT,
  preview_video_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table lessons si elle n'existe pas
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_number INTEGER,
  title TEXT NOT NULL,
  content TEXT,
  slug TEXT,
  youtube_video_id TEXT,
  duration_minutes INTEGER DEFAULT 15,
  is_free BOOLEAN DEFAULT false,
  lesson_type TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'exercise')),
  preview_text TEXT,
  markdown_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_lesson_per_course UNIQUE(course_id, lesson_number)
);

-- ============================================
-- PARTIE 2: TABLES DE TRACKING
-- ============================================

-- Table user_lesson_progress
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_video_position INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Table user_courses
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  current_lesson INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Table user_stats
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_courses_completed INTEGER DEFAULT 0,
  total_watch_time_minutes INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table user_activities
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTIE 3: INDEX POUR PERFORMANCE
-- ============================================

-- Index pour courses
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

-- Index pour lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_free ON lessons(is_free);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);

-- Index pour user_lesson_progress
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_status ON user_lesson_progress(status);

-- Index pour user_courses
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);

-- Index pour user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Index pour user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

-- ============================================
-- PARTIE 4: POLITIQUES RLS
-- ============================================

-- RLS pour courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT USING (is_published = true);

-- RLS pour lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view lessons" ON lessons;
CREATE POLICY "Public can view lessons" ON lessons
  FOR SELECT USING (true);

-- RLS pour user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own progress" ON user_lesson_progress;
CREATE POLICY "Users view own progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own progress" ON user_lesson_progress;
CREATE POLICY "Users manage own progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS pour user_courses
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public courses" ON user_courses;
CREATE POLICY "Public courses" ON user_courses
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own courses" ON user_courses;
CREATE POLICY "Users can insert own courses" ON user_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own courses" ON user_courses;
CREATE POLICY "Users can update own courses" ON user_courses
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own courses" ON user_courses;
CREATE POLICY "Users can delete own courses" ON user_courses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS pour user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles stats" ON user_stats;
CREATE POLICY "Public profiles stats" ON user_stats
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS pour user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public activities" ON user_activities;
CREATE POLICY "Public activities" ON user_activities
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own activities" ON user_activities;
CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own activities" ON user_activities;
CREATE POLICY "Users can delete own activities" ON user_activities
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PARTIE 5: FONCTION ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_lesson_progress_updated_at ON user_lesson_progress;
CREATE TRIGGER update_user_lesson_progress_updated_at
  BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_courses_updated_at ON user_courses;
CREATE TRIGGER update_user_courses_updated_at
  BEFORE UPDATE ON user_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTIE 6: COMMENTAIRES
-- ============================================

COMMENT ON TABLE courses IS 'Cours disponibles dans Aurora50';
COMMENT ON TABLE lessons IS 'Leçons individuelles des cours';
COMMENT ON TABLE user_lesson_progress IS 'Tracking détaillé de la progression des utilisateurs dans les leçons';
COMMENT ON TABLE user_courses IS 'Cours en cours et progression des utilisateurs';
COMMENT ON TABLE user_stats IS 'Statistiques globales des utilisateurs Aurora50';
COMMENT ON TABLE user_activities IS 'Historique des activités récentes des utilisateurs';

COMMENT ON COLUMN user_lesson_progress.last_video_position IS 'Position de la vidéo en secondes pour reprendre la lecture';
COMMENT ON COLUMN user_lesson_progress.watch_time_seconds IS 'Temps total de visionnage en secondes';
COMMENT ON COLUMN user_lesson_progress.completion_percentage IS 'Pourcentage de complétion de la leçon (0-100)';
COMMENT ON COLUMN user_courses.current_lesson IS 'Numéro de la leçon actuelle';
COMMENT ON COLUMN user_courses.progress_percentage IS 'Pourcentage de progression dans le cours (0-100)';
COMMENT ON COLUMN user_stats.points IS 'Points Aurora accumulés';
COMMENT ON COLUMN user_stats.streak_days IS 'Nombre de jours consécutifs d''activité';
COMMENT ON COLUMN user_activities.type IS 'Type d''activité (lesson_completed, course_started, etc.)';
COMMENT ON COLUMN user_activities.metadata IS 'Données supplémentaires en JSON';
