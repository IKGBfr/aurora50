-- ============================================
-- CRÉATION DES TABLES POUR AURORA50
-- ============================================

-- 1. Table user_stats - Statistiques globales de l'utilisateur
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  rank INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table user_achievements - Badges et achievements débloqués
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'bronze' CHECK (rarity IN ('bronze', 'silver', 'gold', 'diamond')),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 3. Table user_activities - Historique des activités récentes
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('module_completed', 'badge_unlocked', 'community_participation', 'course_started', 'lesson_completed')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table user_courses - Cours en cours de l'utilisateur
CREATE TABLE IF NOT EXISTS public.user_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  course_thumbnail TEXT,
  current_lesson INTEGER DEFAULT 1,
  total_lessons INTEGER NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, course_id)
);

-- 5. Table user_progress_history - Historique de progression quotidienne
CREATE TABLE IF NOT EXISTS public.user_progress_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  points_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  streak_maintained BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- CRÉATION DES INDEX POUR LES PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_history_user_id ON public.user_progress_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_history_date ON public.user_progress_history(user_id, date DESC);

-- ============================================
-- ACTIVATION DU ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES RLS - LECTURE PUBLIQUE
-- ============================================

-- user_stats : Tout le monde peut voir les stats
CREATE POLICY "Public profiles stats" ON public.user_stats
  FOR SELECT USING (true);

-- user_achievements : Tout le monde peut voir les achievements
CREATE POLICY "Public achievements" ON public.user_achievements
  FOR SELECT USING (true);

-- user_activities : Tout le monde peut voir les activités
CREATE POLICY "Public activities" ON public.user_activities
  FOR SELECT USING (true);

-- user_courses : Tout le monde peut voir les cours
CREATE POLICY "Public courses" ON public.user_courses
  FOR SELECT USING (true);

-- user_progress_history : Tout le monde peut voir l'historique
CREATE POLICY "Public progress history" ON public.user_progress_history
  FOR SELECT USING (true);

-- ============================================
-- POLITIQUES RLS - MODIFICATION PROPRIÉTAIRE
-- ============================================

-- user_stats : Seul le propriétaire peut modifier ses stats
CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_achievements : Seul le propriétaire peut ajouter des achievements
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON public.user_achievements
  FOR DELETE USING (auth.uid() = user_id);

-- user_activities : Seul le propriétaire peut gérer ses activités
CREATE POLICY "Users can insert own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.user_activities
  FOR DELETE USING (auth.uid() = user_id);

-- user_courses : Seul le propriétaire peut gérer ses cours
CREATE POLICY "Users can insert own courses" ON public.user_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON public.user_courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON public.user_courses
  FOR DELETE USING (auth.uid() = user_id);

-- user_progress_history : Seul le propriétaire peut gérer son historique
CREATE POLICY "Users can insert own progress" ON public.user_progress_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress_history
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour user_stats
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTAIRES SUR LES TABLES
-- ============================================

COMMENT ON TABLE public.user_stats IS 'Statistiques globales des utilisateurs Aurora50';
COMMENT ON TABLE public.user_achievements IS 'Badges et achievements débloqués par les utilisateurs';
COMMENT ON TABLE public.user_activities IS 'Historique des activités récentes des utilisateurs';
COMMENT ON TABLE public.user_courses IS 'Cours en cours et progression des utilisateurs';
COMMENT ON TABLE public.user_progress_history IS 'Historique quotidien de progression des utilisateurs';

-- ============================================
-- FIN DU SCRIPT
-- ============================================
