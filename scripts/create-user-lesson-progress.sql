-- Migration: Créer le système de tracking de progression des leçons
-- Aurora50 - Tracking détaillé de la progression utilisateur

-- Table de tracking de progression
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_video_position INTEGER DEFAULT 0, -- Position en secondes
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
CREATE POLICY "Users view own progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
  
-- Politique: Les utilisateurs peuvent gérer leur propre progression
CREATE POLICY "Users manage own progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_user_lesson_progress_updated_at
  BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON TABLE user_lesson_progress IS 'Tracking détaillé de la progression des utilisateurs dans les leçons';
COMMENT ON COLUMN user_lesson_progress.last_video_position IS 'Position de la vidéo en secondes pour reprendre la lecture';
COMMENT ON COLUMN user_lesson_progress.watch_time_seconds IS 'Temps total de visionnage en secondes';
COMMENT ON COLUMN user_lesson_progress.completion_percentage IS 'Pourcentage de complétion de la leçon (0-100)';
