-- Script pour s'assurer que toutes les tables de tracking sont créées
-- Aurora50 - Système de progression des leçons

-- ============================================
-- 1. Table user_lesson_progress (si elle n'existe pas)
-- ============================================
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

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_status ON user_lesson_progress(status);

-- Activer RLS
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre progression
DROP POLICY IF EXISTS "Users view own progress" ON user_lesson_progress;
CREATE POLICY "Users view own progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
  
-- Politique: Les utilisateurs peuvent gérer leur propre progression
DROP POLICY IF EXISTS "Users manage own progress" ON user_lesson_progress;
CREATE POLICY "Users manage own progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 2. Table user_courses (si elle n'existe pas)
-- ============================================
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

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON user_courses(course_id);

-- Activer RLS
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Politiques
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

-- ============================================
-- 3. Table user_stats (si elle n'existe pas)
-- ============================================
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

-- Index
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Activer RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Politiques
DROP POLICY IF EXISTS "Public profiles stats" ON user_stats;
CREATE POLICY "Public profiles stats" ON user_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. Table user_activities (si elle n'existe pas)
-- ============================================
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

-- Index
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

-- Activer RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Politiques
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
-- 5. Fonction pour mettre à jour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Triggers pour updated_at
-- ============================================
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
-- 7. Commentaires pour documentation
-- ============================================
COMMENT ON TABLE user_lesson_progress IS 'Tracking détaillé de la progression des utilisateurs dans les leçons';
COMMENT ON COLUMN user_lesson_progress.last_video_position IS 'Position de la vidéo en secondes pour reprendre la lecture';
COMMENT ON COLUMN user_lesson_progress.watch_time_seconds IS 'Temps total de visionnage en secondes';
COMMENT ON COLUMN user_lesson_progress.completion_percentage IS 'Pourcentage de complétion de la leçon (0-100)';

COMMENT ON TABLE user_courses IS 'Cours en cours et progression des utilisateurs';
COMMENT ON COLUMN user_courses.current_lesson IS 'Numéro de la leçon actuelle';
COMMENT ON COLUMN user_courses.progress_percentage IS 'Pourcentage de progression dans le cours (0-100)';

COMMENT ON TABLE user_stats IS 'Statistiques globales des utilisateurs Aurora50';
COMMENT ON COLUMN user_stats.points IS 'Points Aurora accumulés';
COMMENT ON COLUMN user_stats.streak_days IS 'Nombre de jours consécutifs d''activité';

COMMENT ON TABLE user_activities IS 'Historique des activités récentes des utilisateurs';
COMMENT ON COLUMN user_activities.type IS 'Type d''activité (lesson_completed, course_started, etc.)';
COMMENT ON COLUMN user_activities.metadata IS 'Données supplémentaires en JSON';
