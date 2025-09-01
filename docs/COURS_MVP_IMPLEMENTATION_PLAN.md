# 📚 Plan d'Implémentation MVP - Section Cours Aurora50

## 🎯 Objectif Principal
Implémenter 2 piliers pilotes complets avec système freemium pour beta test avec 50 membres.

## ⚙️ Configuration Technique Confirmée

### Stack
- **Frontend**: Next.js 15.5 avec App Router
- **Styling**: Emotion CSS + Tailwind
- **DB**: Supabase (tables existantes + nouvelles)
- **Vidéos**: YouTube non-répertoriées (@Aurora50-x)
- **Auth**: Supabase Auth existant
- **Paiement**: Stripe existant

### Paramètres Business
- **Modèle**: FREE (1 leçon/pilier) → PREMIUM 29€/mois
- **Early Bird**: 19€/mois pour beta testers
- **Durée vidéos**: 10-15 minutes
- **Contenu**: Génération IA + templates simples

## 📋 Phase 1 : Database (Jour 1-2)

### 1.1 Migrations SQL

```sql
-- Migration: Enrichir la table courses existante
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

-- Migration: Enrichir la table lessons existante
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS lesson_number INTEGER,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS youtube_video_id TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'video',
ADD COLUMN IF NOT EXISTS preview_text TEXT,
ADD COLUMN IF NOT EXISTS markdown_content TEXT,
ADD CONSTRAINT IF NOT EXISTS unique_lesson_per_course UNIQUE(course_id, lesson_number);

-- Nouvelle table: Progression détaillée
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_video_position INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Nouvelle table: Ressources (simplifiée pour MVP)
CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  is_premium BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_free ON lessons(is_free);
```

### 1.2 Seed Data - 2 Piliers

```sql
-- Pilier 1: Libération Émotionnelle
INSERT INTO courses (
  title, 
  description, 
  pillar_number, 
  slug, 
  duration_weeks, 
  emoji, 
  color_gradient,
  order_index,
  is_published,
  short_description
) VALUES (
  'Libération Émotionnelle',
  'Libérez-vous des blocages invisibles qui vous retiennent et retrouvez votre liberté intérieure.',
  1,
  'liberation-emotionnelle',
  4,
  '🦋',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  1,
  true,
  'Guérir et pardonner pour renaître'
) ON CONFLICT (pillar_number) DO NOTHING;

-- Pilier 3: Renaissance Professionnelle
INSERT INTO courses (
  title,
  description,
  pillar_number,
  slug,
  duration_weeks,
  emoji,
  color_gradient,
  order_index,
  is_published,
  short_description
) VALUES (
  'Renaissance Professionnelle',
  'Réinventez votre carrière et découvrez vos talents cachés après 50 ans.',
  3,
  'renaissance-professionnelle',
  6,
  '💼',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  2,
  true,
  'Vos talents valent de l''or'
) ON CONFLICT (pillar_number) DO NOTHING;

-- Leçons Pilier 1 (5 leçons)
INSERT INTO lessons (course_id, lesson_number, title, slug, is_free, youtube_video_id, duration_minutes, markdown_content, preview_text)
SELECT 
  c.id,
  l.lesson_number,
  l.title,
  l.slug,
  l.is_free,
  l.youtube_video_id,
  l.duration_minutes,
  l.markdown_content,
  l.preview_text
FROM courses c
CROSS JOIN (VALUES
  (1, 'Comprendre ses blocages invisibles', 'blocages-invisibles', true, 'VIDEO_ID_1', 12, '# Introduction\n\nDécouvrez les mécanismes...', 'Cette leçon gratuite vous révèle...'),
  (2, 'Guérir la petite fille intérieure', 'guerir-enfant-interieur', false, 'VIDEO_ID_2', 15, '# Guérison profonde\n\nTechniques pour...', 'Apprenez à reconnaître et guérir...'),
  (3, 'Pardonner (aux autres et à soi)', 'pardon-liberation', false, 'VIDEO_ID_3', 14, '# Le pouvoir du pardon\n\nLibérez-vous...', 'Le pardon est la clé de votre...'),
  (4, 'Technique EFT adaptée 50+', 'eft-technique', false, 'VIDEO_ID_4', 18, '# EFT pour les 50+\n\nMéthode adaptée...', 'L''EFT spécialement conçu pour...'),
  (5, 'Rituel de libération du passé', 'rituel-liberation', false, 'VIDEO_ID_5', 20, '# Rituel puissant\n\nCérémonie de...', 'Un rituel transformateur pour...')
) AS l(lesson_number, title, slug, is_free, youtube_video_id, duration_minutes, markdown_content, preview_text)
WHERE c.pillar_number = 1;

-- Leçons Pilier 3 (6 leçons)
INSERT INTO lessons (course_id, lesson_number, title, slug, is_free, youtube_video_id, duration_minutes, markdown_content, preview_text)
SELECT 
  c.id,
  l.lesson_number,
  l.title,
  l.slug,
  l.is_free,
  l.youtube_video_id,
  l.duration_minutes,
  l.markdown_content,
  l.preview_text
FROM courses c
CROSS JOIN (VALUES
  (1, 'Identifier ses talents cachés', 'talents-caches', true, 'VIDEO_ID_6', 15, '# Vos talents uniques\n\nTest et méthode...', 'Découvrez gratuitement vos talents...'),
  (2, 'Vaincre le syndrome de l''imposteur', 'syndrome-imposteur', false, 'VIDEO_ID_7', 13, '# Confiance retrouvée\n\nStratégies pour...', 'Libérez-vous du syndrome de...'),
  (3, 'LinkedIn pour les 50+', 'linkedin-50plus', false, 'VIDEO_ID_8', 16, '# LinkedIn stratégique\n\nOptimisez votre...', 'Maîtrisez LinkedIn pour valoriser...'),
  (4, 'Lancer une activité solo', 'activite-solo', false, 'VIDEO_ID_9', 18, '# Entrepreneuriat 50+\n\nGuide complet...', 'Tout pour lancer votre activité...'),
  (5, 'Négocier sa valeur', 'negocier-valeur', false, 'VIDEO_ID_10', 14, '# Négociation gagnante\n\nTechniques pour...', 'Apprenez à négocier ce que vous...'),
  (6, 'Transmission et mentorat', 'transmission-mentorat', false, 'VIDEO_ID_11', 17, '# Transmettre son savoir\n\nDevenir mentor...', 'Transformez votre expérience en...')
) AS l(lesson_number, title, slug, is_free, youtube_video_id, duration_minutes, markdown_content, preview_text)
WHERE c.pillar_number = 3;
```

### 1.3 Politiques RLS

```sql
-- RLS pour user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS pour lesson_resources
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view resources" ON lesson_resources
  FOR SELECT USING (true);
```

## 🎨 Phase 2 : Composants (Jour 3-4)

### 2.1 Structure des Composants

```
/components/cours/
├── PillarCard.tsx          # Card avec gradient, emoji, progression
├── PillarGrid.tsx          # Grille responsive des piliers
├── LessonList.tsx          # Liste avec lock/unlock visuel
├── LessonPlayer.tsx        # YouTube embed + contrôles
├── LessonNavigation.tsx   # Prev/Next avec état
├── ProgressBar.tsx         # Barre visuelle Aurora50
├── CompletionButton.tsx    # CTA "Marquer comme terminé"
├── PremiumGate.tsx         # Réutilise LimitBanner
├── LessonContent.tsx       # Markdown renderer
└── CourseStats.tsx         # Mini dashboard progression
```

### 2.2 PillarCard.tsx - Spécifications

```typescript
interface PillarCardProps {
  pillar: {
    id: string;
    title: string;
    emoji: string;
    color_gradient: string;
    short_description: string;
    duration_weeks: number;
    pillar_number: number;
    slug: string;
  };
  progress?: {
    completed_lessons: number;
    total_lessons: number;
    percentage: number;
  };
  isLocked: boolean;
}

// Features:
// - Gradient background avec opacity
// - Emoji en grand (48px)
// - Badge "GRATUIT" sur leçon 1
// - Barre de progression en bas
// - Hover effect avec scale
// - Click → /cours/[slug]
```

### 2.3 LessonPlayer.tsx - Spécifications

```typescript
interface LessonPlayerProps {
  youtubeId: string;
  isLocked: boolean;
  lastPosition?: number;
  onProgress: (seconds: number) => void;
  onComplete: () => void;
}

// Features:
// - YouTube iframe API
// - Sauvegarde position toutes les 10s
// - Auto-mark complete à 90%
// - Fullscreen support
// - Mobile responsive
// - Gate si isLocked
```

## 📄 Phase 3 : Pages (Jour 5-6)

### 3.1 /cours/page.tsx

```typescript
// Fonctionnalités:
// 1. Fetch les 2 piliers depuis Supabase
// 2. Afficher PillarGrid
// 3. Si user FREE: Banner "Débloquez tout"
// 4. Stats globales en haut
// 5. Mobile: 1 colonne, Desktop: 2 colonnes
```

### 3.2 /cours/[pillar-slug]/page.tsx

```typescript
// Fonctionnalités:
// 1. Fetch pilier par slug
// 2. Hero avec gradient + description
// 3. LessonList avec états
// 4. Progression totale
// 5. CTA upgrade si FREE
// 6. Breadcrumb navigation
```

### 3.3 /cours/[pillar-slug]/[lesson-number]/page.tsx

```typescript
// Fonctionnalités:
// 1. Fetch lesson par number + pillar
// 2. Check si user peut accéder
// 3. LessonPlayer ou PremiumGate
// 4. Markdown content en dessous
// 5. Navigation prev/next
// 6. CompletionButton
// 7. Update progress en DB
```

## 🔧 Phase 4 : Logique Métier (Jour 7-8)

### 4.1 Hooks Personnalisés

```typescript
// /lib/hooks/useCourseProgress.ts
export function useCourseProgress(userId: string) {
  // Fetch et cache progression
  // Update en temps réel
  // Calculate stats
}

// /lib/hooks/useLessonAccess.ts
export function useLessonAccess(lessonId: string, userId: string) {
  // Check subscription_type
  // Check is_free
  // Return canAccess boolean
}

// /lib/hooks/useVideoTracking.ts
export function useVideoTracking(lessonId: string) {
  // Save position
  // Track completion
  // Update stats
}
```

### 4.2 Services Supabase

```typescript
// /lib/services/courseService.ts
export const courseService = {
  getPillars: async () => {},
  getPillarBySlug: async (slug: string) => {},
  getLessons: async (courseId: string) => {},
  getLesson: async (pillarSlug: string, lessonNumber: number) => {},
  markComplete: async (lessonId: string, userId: string) => {},
  updateProgress: async (lessonId: string, data: ProgressData) => {},
  getUserProgress: async (userId: string) => {}
};
```

### 4.3 Gamification

```typescript
// Points attribution
const POINTS = {
  LESSON_STARTED: 5,
  LESSON_COMPLETED: 10,
  PILLAR_COMPLETED: 50,
  FIRST_LESSON: 20, // Bonus
  STREAK_7_DAYS: 25
};

// Update dans user_stats
// Trigger badges si milestones
// Update user_activities
```

## 🧪 Phase 5 : Tests (Jour 9-10)

### 5.1 Scénarios de Test

1. **Parcours FREE**
   - Accès 1ère leçon ✓
   - Blocage 2ème leçon ✓
   - CTA upgrade visible ✓

2. **Parcours PREMIUM**
   - Accès toutes leçons ✓
   - Progression sauvegardée ✓
   - Points attribués ✓

3. **Mobile**
   - Player responsive ✓
   - Navigation tactile ✓
   - Performance 3G ✓

### 5.2 Checklist Pré-Beta

- [ ] 2 piliers avec 11 leçons totales
- [ ] Vidéos YouTube configurées
- [ ] Gates freemium fonctionnels
- [ ] Progression tracking
- [ ] Points et stats
- [ ] Mobile responsive
- [ ] Analytics events
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

## 📊 KPIs à Tracker

```typescript
// Analytics events
track('lesson_started', { pillar, lesson, user_type });
track('lesson_completed', { pillar, lesson, duration });
track('upgrade_clicked', { trigger_location, pillar });
track('video_engagement', { watch_percentage });
```

## 🚀 Commandes Utiles

```bash
# Migrations
npx supabase migration new courses_mvp_structure
npx supabase db push

# Types
npx supabase gen types typescript --local > lib/database.types.ts

# Seed
npx tsx scripts/seed-courses.ts

# Test
npm run dev
# Aller sur http://localhost:3000/cours
```

## ⚠️ Points d'Attention

1. **YouTube IDs**: Remplacer VIDEO_ID_X par vrais IDs
2. **Gradients**: Utiliser ceux du design system Aurora50
3. **Cache**: Implémenter SWR pour les données
4. **SEO**: Meta tags pour leçons gratuites
5. **Tracking**: GTM/GA events configurés

## 📅 Timeline Finale

| Semaine | Phase | Livrable |
|---------|-------|----------|
| S1 J1-2 | DB | Migrations + Seed |
| S1 J3-4 | Components | Composants de base |
| S1 J5-6 | Pages | 3 pages principales |
| S2 J1-2 | Logic | Services + Hooks |
| S2 J3-4 | Polish | Tests + Optimisations |
| S3 | Beta | 50 testeurs Facebook |
| S4 | Launch | Ouverture générale |

---

*Document créé le 29/01/2025*
*Version 1.0.0 - MVP Focus*
*Stack: Next.js 15, Supabase, YouTube, Emotion CSS*