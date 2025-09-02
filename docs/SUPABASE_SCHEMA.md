# Schéma Complet Base de Données Aurora50 - Supabase

## 1. Vue d'ensemble

- **Projet Supabase**: Aurora50 (suxhtdqdpoatguhxdpht)
- **Version Supabase**: Latest (2024)
- **Date de dernière mise à jour**: 29/08/2025
- **URL du projet**: https://suxhtdqdpoatguhxdpht.supabase.co (anonymisé)

### Statistiques globales
- **Tables publiques**: 5 tables actives
- **Tables système**: 20+ tables (auth, storage)
- **Storage Buckets**: 1 (avatars)
- **Politiques RLS**: 100% des tables protégées
- **Migrations appliquées**: 6

## 2. Tables de la Base de Données

### 2.1 Schema PUBLIC

#### Table `profiles`
**Description**: Profils utilisateurs étendus, liés à auth.users

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | - | Identifiant unique lié à auth.users |
| full_name | TEXT | NULLABLE | NULL | Nom complet de l'utilisateur |
| avatar_url | TEXT | NULLABLE | NULL | URL de l'avatar (Storage ou externe) |
| cover_url | TEXT | NULLABLE | NULL | URL de l'image de couverture |
| bio | TEXT | NULLABLE | NULL | Biographie/description |
| email | TEXT | NULLABLE, UNIQUE | NULL | Email de l'utilisateur |
| stripe_customer_id | TEXT | NULLABLE | NULL | ID client Stripe |
| stripe_session_id | TEXT | NULLABLE | NULL | ID session Stripe |
| created_at | TIMESTAMPTZ | NULLABLE | now() | Date de création |
| updated_at | TIMESTAMPTZ | NULLABLE | now() | Date de mise à jour |

**Index**: 
- PRIMARY KEY sur `id`
- UNIQUE sur `email`

**Relations**:
- FK vers `auth.users(id)` avec ON DELETE CASCADE

---

#### Table `user_stats`
**Description**: Statistiques globales et gamification des utilisateurs

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| user_id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | - | ID utilisateur |
| points | INTEGER | - | 0 | Points totaux accumulés |
| level | INTEGER | - | 1 | Niveau actuel (1-50) |
| streak_days | INTEGER | - | 0 | Jours consécutifs d'activité |
| total_lessons_completed | INTEGER | - | 0 | Nombre total de leçons complétées |
| total_study_time_minutes | INTEGER | - | 0 | Temps total d'étude en minutes |
| rank | INTEGER | NULLABLE | NULL | Rang dans le classement global |
| created_at | TIMESTAMPTZ | - | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | - | NOW() | Date de mise à jour |

**Index**:
- PRIMARY KEY sur `user_id`
- INDEX sur `user_id`

**Trigger**:
- `update_user_stats_updated_at` : Met à jour automatiquement `updated_at`

---

#### Table `user_achievements`
**Description**: Badges et achievements débloqués par les utilisateurs

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| user_id | UUID | REFERENCES auth.users(id) | - | ID utilisateur |
| badge_id | TEXT | NOT NULL | - | Identifiant unique du badge |
| title | TEXT | NOT NULL | - | Titre du badge |
| description | TEXT | NULLABLE | NULL | Description du badge |
| icon | TEXT | NULLABLE | NULL | Icône/emoji du badge |
| rarity | TEXT | CHECK IN ('bronze','silver','gold','diamond') | 'bronze' | Rareté du badge |
| earned_at | TIMESTAMPTZ | - | NOW() | Date d'obtention |

**Contraintes**:
- UNIQUE(user_id, badge_id) - Un utilisateur ne peut avoir le même badge deux fois

**Index**:
- PRIMARY KEY sur `id`
- INDEX sur `user_id`

---

#### Table `user_activities`
**Description**: Historique des activités récentes des utilisateurs

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| user_id | UUID | REFERENCES auth.users(id) | - | ID utilisateur |
| type | TEXT | CHECK IN (types) | - | Type d'activité |
| title | TEXT | NOT NULL | - | Titre de l'activité |
| description | TEXT | NULLABLE | NULL | Description détaillée |
| icon | TEXT | NULLABLE | NULL | Icône associée |
| metadata | JSONB | - | '{}' | Métadonnées additionnelles |
| created_at | TIMESTAMPTZ | - | NOW() | Date de l'activité |

**Types d'activité autorisés**:
- `module_completed`
- `badge_unlocked`
- `community_participation`
- `course_started`
- `lesson_completed`

**Index**:
- PRIMARY KEY sur `id`
- INDEX sur `user_id`
- INDEX sur `created_at DESC`

---

#### Table `user_courses`
**Description**: Cours en cours et progression des utilisateurs

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| user_id | UUID | REFERENCES auth.users(id) | - | ID utilisateur |
| course_id | TEXT | NOT NULL | - | ID du cours |
| course_title | TEXT | NOT NULL | - | Titre du cours |
| course_thumbnail | TEXT | NULLABLE | NULL | URL de la miniature |
| current_lesson | INTEGER | - | 1 | Leçon actuelle |
| total_lessons | INTEGER | NOT NULL | - | Nombre total de leçons |
| progress_percentage | INTEGER | CHECK (0-100) | 0 | Pourcentage de progression |
| started_at | TIMESTAMPTZ | - | NOW() | Date de début |
| last_accessed_at | TIMESTAMPTZ | - | NOW() | Dernier accès |
| completed_at | TIMESTAMPTZ | NULLABLE | NULL | Date de complétion |

**Contraintes**:
- UNIQUE(user_id, course_id) - Un utilisateur ne peut avoir le même cours deux fois
- CHECK sur progress_percentage (>= 0 AND <= 100)

**Index**:
- PRIMARY KEY sur `id`
- INDEX sur `user_id`

---

#### Table `user_progress_history`
**Description**: Historique quotidien de progression pour graphiques

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| user_id | UUID | REFERENCES auth.users(id) | - | ID utilisateur |
| date | DATE | NOT NULL | - | Date du jour |
| points_earned | INTEGER | - | 0 | Points gagnés ce jour |
| lessons_completed | INTEGER | - | 0 | Leçons complétées ce jour |
| study_time_minutes | INTEGER | - | 0 | Temps d'étude en minutes |
| streak_maintained | BOOLEAN | - | false | Streak maintenu ce jour |
| created_at | TIMESTAMPTZ | - | NOW() | Date de création |

**Contraintes**:
- UNIQUE(user_id, date) - Une seule entrée par jour par utilisateur

**Index**:
- PRIMARY KEY sur `id`
- INDEX sur `user_id`
- INDEX composé sur `(user_id, date DESC)`

---

#### Table `courses`
**Description**: Catalogue des cours disponibles

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| title | TEXT | NOT NULL | - | Titre du cours |
| description | TEXT | NULLABLE | NULL | Description du cours |
| created_at | TIMESTAMPTZ | - | now() | Date de création |

**Relations**:
- Référencée par `lessons.course_id`
- Référencée par `enrollments.course_id`

---

#### Table `lessons`
**Description**: Leçons individuelles des cours

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| course_id | UUID | REFERENCES courses(id) | - | ID du cours parent |
| title | TEXT | NOT NULL | - | Titre de la leçon |
| content | TEXT | NULLABLE | NULL | Contenu de la leçon |
| release_day_offset | INTEGER | - | 0 | Jours après inscription pour débloquer |
| created_at | TIMESTAMPTZ | - | now() | Date de création |

---

#### Table `enrollments`
**Description**: Inscriptions des utilisateurs aux cours

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Identifiant unique |
| user_id | UUID | REFERENCES auth.users(id) | - | ID utilisateur |
| course_id | UUID | REFERENCES courses(id) | - | ID du cours |
| enrolled_at | TIMESTAMPTZ | - | now() | Date d'inscription |

---

#### Table `chat_messages`
**Description**: Messages du chat communautaire

| Colonne | Type | Contraintes | Défaut | Description |
|---------|------|-------------|---------|-------------|
| id | BIGINT | PRIMARY KEY, IDENTITY | BY DEFAULT | Identifiant auto-incrémenté |
| user_id | UUID | REFERENCES auth.users(id) | - | ID de l'auteur |
| content | TEXT | NOT NULL | - | Contenu du message |
| created_at | TIMESTAMPTZ | - | now() | Date d'envoi |

### 2.2 Schema AUTH (Tables système Supabase)

#### Table `auth.users`
**Description**: Table principale des utilisateurs (gérée par Supabase)

| Colonne clé | Type | Description |
|-------------|------|-------------|
| id | UUID | Identifiant unique de l'utilisateur |
| email | VARCHAR | Email de l'utilisateur |
| email_confirmed_at | TIMESTAMPTZ | Date de confirmation email |
| created_at | TIMESTAMPTZ | Date de création du compte |
| updated_at | TIMESTAMPTZ | Dernière mise à jour |
| last_sign_in_at | TIMESTAMPTZ | Dernière connexion |
| raw_user_meta_data | JSONB | Métadonnées utilisateur |

**Relations**:
- Référencée par toutes les tables `user_*` du schema public

### 2.3 Schema STORAGE

#### Table `storage.buckets`
**Description**: Définition des buckets de stockage

| Bucket | Configuration | Description |
|--------|---------------|-------------|
| avatars | Public, 5MB max | Stockage des avatars utilisateurs |

#### Table `storage.objects`
**Description**: Objets stockés (fichiers)

Actuellement vide - les objets seront créés lors des uploads d'avatars.

## 3. Politiques RLS (Row Level Security)

### 3.1 Table `profiles`

| Politique | Type | Rôle | Expression |
|-----------|------|------|------------|
| Public profiles | SELECT | ALL | `true` |
| Users can update own profile | UPDATE | authenticated | `auth.uid() = id` |
| Users can insert own profile | INSERT | authenticated | `auth.uid() = id` |

### 3.2 Table `user_stats`

| Politique | Type | Rôle | Expression |
|-----------|------|------|------------|
| Public profiles stats | SELECT | ALL | `true` |
| Users can update own stats | UPDATE | authenticated | `auth.uid() = user_id` |
| Users can insert own stats | INSERT | authenticated | `auth.uid() = user_id` |

### 3.3 Table `user_achievements`

| Politique | Type | Rôle | Expression |
|-----------|------|------|------------|
| Public achievements | SELECT | ALL | `true` |
| Users can insert own achievements | INSERT | authenticated | `auth.uid() = user_id` |
| Users can update own achievements | UPDATE | authenticated | `auth.uid() = user_id` |
| Users can delete own achievements | DELETE | authenticated | `auth.uid() = user_id` |

### 3.4 Table `user_activities`

| Politique | Type | Rôle | Expression |
|-----------|------|------|------------|
| Public activities | SELECT | ALL | `true` |
| Users can insert own activities | INSERT | authenticated | `auth.uid() = user_id` |
| Users can delete own activities | DELETE | authenticated | `auth.uid() = user_id` |

### 3.5 Table `user_courses`

| Politique | Type | Rôle | Expression |
|-----------|------|------|------------|
| Public courses | SELECT | ALL | `true` |
| Users can insert own courses | INSERT | authenticated | `auth.uid() = user_id` |
| Users can update own courses | UPDATE | authenticated | `auth.uid() = user_id` |
| Users can delete own courses | DELETE | authenticated | `auth.uid() = user_id` |

### 3.6 Table `user_progress_history`

| Politique | Type | Rôle | Expression |
|-----------|------|------|------------|
| Public progress history | SELECT | ALL | `true` |
| Users can insert own progress | INSERT | authenticated | `auth.uid() = user_id` |
| Users can update own progress | UPDATE | authenticated | `auth.uid() = user_id` |

### 3.7 Storage Bucket `avatars`

| Politique | Type | Description |
|-----------|------|-------------|
| Public read access | SELECT | Lecture publique pour tous |
| Upload own avatar | INSERT | Utilisateurs authentifiés peuvent uploader |
| Update own avatar | UPDATE | Propriétaire peut mettre à jour |
| Delete own avatar | DELETE | Propriétaire peut supprimer |

## 4. Fonctions et Procédures Stockées

### Fonction `update_updated_at_column()`
**Description**: Met à jour automatiquement la colonne `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Utilisation**: Trigger sur `user_stats` pour mise à jour automatique

## 5. Triggers

### Trigger `update_user_stats_updated_at`
**Table**: user_stats  
**Événement**: BEFORE UPDATE  
**Fonction**: update_updated_at_column()  
**Description**: Met à jour automatiquement le timestamp `updated_at` lors de toute modification

## 6. Storage Buckets

### Bucket `avatars`

| Propriété | Valeur |
|-----------|--------|
| Nom | avatars |
| Visibilité | Public |
| Taille max fichier | 5 MB |
| Types MIME autorisés | image/jpeg, image/jpg, image/png, image/gif, image/webp |
| Structure dossiers | /{user_id}/{filename} |

**Politiques d'accès**:
1. **Lecture**: Publique pour tous
2. **Écriture**: Authentifié et propriétaire uniquement
3. **Suppression**: Authentifié et propriétaire uniquement

## 7. Types Personnalisés et Enums

### Enum `rarity` (user_achievements)
- `bronze` : Badge commun
- `silver` : Badge peu commun
- `gold` : Badge rare
- `diamond` : Badge légendaire

### Enum `activity_type` (user_activities)
- `module_completed` : Module terminé
- `badge_unlocked` : Badge débloqué
- `community_participation` : Participation communautaire
- `course_started` : Cours commencé
- `lesson_completed` : Leçon terminée

## 8. Relations entre Tables

### Relations One-to-One
```
auth.users (1) ←→ (1) profiles
auth.users (1) ←→ (1) user_stats
```

### Relations One-to-Many
```
auth.users (1) ←→ (N) user_achievements
auth.users (1) ←→ (N) user_activities
auth.users (1) ←→ (N) user_courses
auth.users (1) ←→ (N) user_progress_history
auth.users (1) ←→ (N) chat_messages
auth.users (1) ←→ (N) enrollments

courses (1) ←→ (N) lessons
courses (1) ←→ (N) enrollments
```

### Relations Many-to-Many
```
auth.users ←→ enrollments ←→ courses
```

## 9. Séquences et Auto-incréments

### Séquence `chat_messages_id_seq`
- **Table**: chat_messages
- **Colonne**: id
- **Type**: BIGINT IDENTITY BY DEFAULT

### UUID auto-générés
Toutes les autres tables utilisent `gen_random_uuid()` pour les clés primaires

## 10. Vues (Views)

Aucune vue personnalisée n'est actuellement définie dans le projet.

## 11. Configuration Realtime

### Tables avec Realtime activé
Actuellement, aucune table n'a Realtime explicitement activé. À configurer pour:
- `chat_messages` : Pour le chat temps réel
- `user_activities` : Pour les notifications d'activité

### Configuration recommandée
```sql
-- Activer Realtime sur chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Activer Realtime sur user_activities
ALTER PUBLICATION supabase_realtime ADD TABLE user_activities;
```

## 12. Exemples de Requêtes

### Récupérer le profil complet d'un utilisateur
```sql
SELECT 
  p.*,
  s.points,
  s.level,
  s.streak_days
FROM profiles p
LEFT JOIN user_stats s ON p.id = s.user_id
WHERE p.id = $1;
```

### Obtenir les dernières activités
```sql
SELECT * FROM user_activities
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10;
```

### Calculer la progression globale
```sql
SELECT 
  COUNT(DISTINCT uc.course_id) as courses_started,
  AVG(uc.progress_percentage) as avg_progress,
  SUM(us.total_lessons_completed) as total_lessons
FROM user_courses uc
JOIN user_stats us ON uc.user_id = us.user_id
WHERE uc.user_id = $1;
```

### Obtenir le classement
```sql
WITH ranked_users AS (
  SELECT 
    user_id,
    points,
    RANK() OVER (ORDER BY points DESC) as rank
  FROM user_stats
)
UPDATE user_stats
SET rank = ru.rank
FROM ranked_users ru
WHERE user_stats.user_id = ru.user_id;
```

### Vérifier les achievements débloqués
```sql
SELECT * FROM user_achievements
WHERE user_id = $1
ORDER BY 
  CASE rarity
    WHEN 'diamond' THEN 1
    WHEN 'gold' THEN 2
    WHEN 'silver' THEN 3
    WHEN 'bronze' THEN 4
  END,
  earned_at DESC;
```

## 13. Migrations Appliquées

| Version | Nom | Description |
|---------|-----|-------------|
| 20250828012749 | add_stripe_fields_to_profiles | Ajout des champs Stripe au profil |
| 20250828051827 | test_connection | Test de connexion initial |
| 20250828052431 | cleanup_test | Nettoyage des tests |
| 20250828053612 | create_aurora50_lms_schema | Création du schéma LMS complet |
| 20250829055938 | create_avatars_bucket | Création du bucket avatars |
| 20250829055956 | add_avatars_bucket_policies | Ajout des politiques RLS avatars |

## 14. Patterns et Conventions

### Convention de nommage
- **Tables**: snake_case, pluriel pour collections
- **Colonnes**: snake_case
- **Contraintes**: {table}_{column}_{type} (ex: user_stats_user_id_fkey)
- **Index**: idx_{table}_{column}

### Stratégies de sécurité
- RLS activé sur toutes les tables
- Lecture publique par défaut (profils publics)
- Écriture limitée au propriétaire
- Service role pour opérations système

### Gestion des timestamps
- `created_at`: TIMESTAMPTZ avec défaut NOW()
- `updated_at`: TIMESTAMPTZ avec trigger automatique
- Toutes les dates en UTC

### Soft deletes
Non implémenté - suppression physique des données

## 15. Points d'Attention et Améliorations

### 🚨 Sécurité
1. **Validation des emails**: Ajouter trigger pour valider format email dans profiles
2. **Rate limiting**: Implémenter sur chat_messages pour éviter spam
3. **Sanitization**: Valider/nettoyer le contenu HTML dans bio et messages

### ⚡ Performance
1. **Index manquants**: 
   - Index sur `profiles.email` pour recherche rapide
   - Index sur `user_stats.points` pour classement
   - Index composé sur `user_courses(user_id, course_id)`

2. **Partitioning**: 
   - Considérer partitioning sur `user_activities` par mois
   - Archivage des vieux `chat_messages`

### 🔧 Fonctionnalités à ajouter
1. **Notifications**: Table pour stocker les notifications utilisateur
2. **Préférences**: Table user_preferences pour paramètres personnalisés
3. **Sessions d'étude**: Tracking détaillé des sessions
4. **Audit log**: Table pour tracer les modifications importantes

### 📊 Monitoring recommandé
1. Surveiller la taille de `user_activities` (croissance rapide)
2. Monitor les requêtes lentes sur `user_stats` (calculs de rang)
3. Vérifier l'utilisation du storage avatars

## 16. Scripts de Maintenance

### Nettoyage des activités anciennes
```sql
DELETE FROM user_activities
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Recalcul des rangs
```sql
CALL recalculate_user_ranks();
```

### Vérification de l'intégrité
```sql
-- Vérifier les profils orphelins
SELECT p.* FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Vérifier les stats manquantes
SELECT u.id FROM auth.users u
LEFT JOIN user_stats s ON u.id = s.user_id
WHERE s.user_id IS NULL;
```

---

*Documentation générée le 29/08/2025*  
*Projet Aurora50 - Base de données Supabase*  
*Version du schéma: 1.0.0*
