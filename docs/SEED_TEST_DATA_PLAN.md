## 📄 FICHIER: `SEED_TEST_DATA_PLAN.md`

```markdown
# Plan d'Implémentation - Données de Test Aurora50

## 📌 Contexte
Deux modes de test distincts :
1. **Mode Dev Local** : Bypass auth pour Cline (déjà implémenté)
2. **Mode Test Production** : Données réelles pour altoweb.fr@gmail.com

## 🎯 Objectif
Créer des données fictives mais réalistes dans Supabase pour l'utilisateur de test `altoweb.fr@gmail.com` afin de permettre des tests complets sur l'environnement déployé.

## 📊 Tables à Créer/Remplir

### 1. Table `user_stats`
```sql
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  rank INTEGER DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Données à insérer** :
- points: 1250
- level: 8
- streak_days: 12
- total_lessons_completed: 42
- total_study_time_minutes: 750
- rank: 23

### 2. Table `user_achievements`
```sql
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'bronze', -- bronze, silver, gold, diamond
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```
**Badges à créer** :
- Première connexion (🎯, bronze)
- Semaine parfaite (🔥, silver)
- Exploratrice (🗺️, gold)
- Mentor (🤝, verrouillé)
- Étoile montante (⭐, verrouillé)
- Sage (🦉, verrouillé)

### 3. Table `user_activities`
```sql
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- module_completed, badge_unlocked, community_participation, course_started
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Activités récentes à créer** (5-10 entrées)

### 4. Table `user_courses`
```sql
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  current_lesson INTEGER DEFAULT 1,
  total_lessons INTEGER NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Cours en cours** :
- Méditation guidée (75% complété)
- Yoga pour débutantes (30% complété)
- Nutrition équilibrée (50% complété)

### 5. Table `user_progress_history`
```sql
CREATE TABLE IF NOT EXISTS user_progress_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  points_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```
**Données des 30 derniers jours** pour le graphique

## 🔒 Politiques RLS

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress_history ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture (tout le monde peut voir)
CREATE POLICY "Public profiles stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Public achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Public activities" ON user_activities
  FOR SELECT USING (true);

CREATE POLICY "Public courses" ON user_courses
  FOR SELECT USING (true);

CREATE POLICY "Public progress" ON user_progress_history
  FOR SELECT USING (true);

-- Politiques de modification (propriétaire uniquement)
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);
```

## 📝 Script de Seed

Créer `scripts/seed-test-user.ts` avec :
1. Récupération de l'ID utilisateur pour altoweb.fr@gmail.com
2. Mise à jour du profil existant
3. Insertion des données dans chaque table
4. Génération de données de progression sur 30 jours
5. Logs de confirmation

## ⚙️ Configuration

### Variables d'environnement
```env
# .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Pour bypasser RLS lors du seed
```

### Package.json
```json
{
  "scripts": {
    "seed:test": "tsx scripts/seed-test-user.ts",
    "seed:clean": "tsx scripts/clean-test-user.ts"
  }
}
```

## 🚀 Étapes d'Exécution

1. **Créer les tables** dans Supabase SQL Editor
2. **Configurer les politiques RLS**
3. **Créer le script de seed**
4. **Exécuter** : `npm run seed:test`
5. **Vérifier** dans Supabase Dashboard
6. **Tester** avec altoweb.fr@gmail.com

## ✅ Validation

- [ ] Tables créées dans Supabase
- [ ] Politiques RLS configurées
- [ ] Script de seed fonctionnel
- [ ] Données visibles pour altoweb.fr@gmail.com
- [ ] Profil affiche les bonnes statistiques
- [ ] Graphiques fonctionnels
- [ ] Achievements visibles
```
