# 📚 Feuille de Route - Section Cours Aurora50

## Vue d'Ensemble
La section `/cours` est le cœur de l'application Aurora50, proposant un parcours de transformation structuré en 7 piliers sur 6 mois.

## 🎯 Objectifs Principaux
- Implémenter le système de cours avec les 7 piliers définis
- Créer une séparation claire entre contenu gratuit et premium
- Intégrer un système de progression et gamification
- Développer des mécanismes de conversion freemium → premium

## 📊 Structure des 7 Piliers

### Pilier 1 : Libération Émotionnelle (4 semaines)
- Leçon 1 : Comprendre ses blocages invisibles *(gratuit)*
- Leçon 2 : Guérir la petite fille intérieure
- Leçon 3 : Pardonner (aux autres et à soi)
- Leçon 4 : Technique EFT adaptée 50+
- Leçon 5 : Rituel de libération du passé

### Pilier 2 : Reconquête du Corps (4 semaines)
- Leçon 1 : Déprogrammer la honte *(preview gratuit)*
- Leçon 2 : Yoga doux spécial articulations
- Leçon 3 : Nutrition anti-inflammatoire
- Leçon 4 : Sexualité épanouie après ménopause
- Leçon 5 : Routine beauté naturelle 50+

### Pilier 3 : Renaissance Professionnelle (6 semaines)
- Leçon 1 : Identifier ses talents cachés *(test gratuit)*
- Leçon 2 : Syndrome de l'imposteur
- Leçon 3 : LinkedIn pour les 50+
- Leçon 4 : Lancer une activité solo
- Leçon 5 : Négocier sa valeur
- Leçon 6 : Transmission et mentorat

### Pilier 4 : Relations Authentiques (4 semaines)
- Leçon 1 : Quiz relations toxiques *(gratuit)*
- Leçon 2 : Poser des limites saines
- Leçon 3 : Couple : raviver ou partir ?
- Leçon 4 : Amitié après 50 ans
- Leçon 5 : Dating 50+

### Pilier 5 : Créativité Débridée (3 semaines)
- Leçon 1 : Permission de créer *(exercice gratuit)*
- Leçon 2 : Journal créatif thérapeutique
- Leçon 3 : Trouver son médium
- Leçon 4 : Projet créatif 30 jours

### Pilier 6 : Liberté Financière (3 semaines)
- Leçon 1 : Mindset d'abondance *(quiz gratuit)*
- Leçon 2 : Budget spécial transition
- Leçon 3 : Revenus complémentaires
- Leçon 4 : Investir pour sa retraite

### Pilier 7 : Mission de Vie (4 semaines)
- Leçon 1 : Introduction Ikigai *(gratuit)*
- Leçon 2 : Legacy et transmission
- Leçon 3 : Spiritualité laïque
- Leçon 4 : Plan de vie 30 ans

## 🏗️ Architecture Technique

### Base de Données (Supabase)

```sql
-- Table des modules/piliers
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_number INTEGER UNIQUE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  duration_weeks INTEGER,
  thumbnail_url TEXT,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des leçons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  lesson_number INTEGER,
  title TEXT NOT NULL,
  slug TEXT,
  content TEXT, -- Markdown ou HTML
  video_url TEXT,
  duration_minutes INTEGER,
  is_free BOOLEAN DEFAULT false,
  release_day_offset INTEGER, -- Jours après inscription
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, lesson_number)
);

-- Table progression utilisateur
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  lesson_id UUID REFERENCES lessons(id),
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_position INTEGER, -- Pour reprendre vidéo
  notes TEXT,
  UNIQUE(user_id, lesson_id)
);

-- Table ressources téléchargeables
CREATE TABLE lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id),
  title TEXT,
  file_url TEXT,
  file_type TEXT, -- 'pdf', 'audio', 'worksheet'
  is_premium BOOLEAN DEFAULT true
);
```

### Pages à Créer

#### 1. `/cours` - Page d'Index
- Grille des 7 piliers avec visual cards
- Progression globale de l'utilisateur
- Indication claire gratuit/premium
- CTA de conversion si gratuit

#### 2. `/cours/[pillar-slug]` - Page Pilier
- Description détaillée du pilier
- Liste des leçons avec statut
- Barre de progression
- Témoignages spécifiques

#### 3. `/cours/[pillar-slug]/[lesson-slug]` - Page Leçon
- Lecteur vidéo ou contenu texte
- Navigation prev/next
- Ressources téléchargeables
- Section commentaires/questions
- Bouton "Marquer comme complété"

## 🎮 Système de Gamification

### Points et Badges
- **10 points** : Compléter une leçon
- **50 points** : Terminer un pilier
- **100 points** : Streak 7 jours
- **Badge spécial** : Chaque pilier complété

### Niveaux
- Niveau 1-10 : Éveil (0-500 pts)
- Niveau 11-20 : Renaissance (500-1500 pts)
- Niveau 21-30 : Épanouissement (1500-3000 pts)
- Niveau 31+ : Mentor (3000+ pts)

## 🔐 Stratégie Freemium

### Contenu Gratuit
- 1ère leçon de chaque pilier
- Tous les quiz et tests
- Preview 5 min des autres leçons
- Progression visible mais limitée

### Triggers de Conversion
1. **Après 1ère leçon** : "Continuez votre transformation"
2. **Limite atteinte** : "Débloquez les 35 leçons restantes"
3. **Progression bloquée** : "Votre prochaine leçon dans 7j... ou maintenant"
4. **Social proof** : "Marie a complété ce pilier et dit..."

### Pricing Tiers
- **Gratuit** : 7 leçons d'intro + quiz
- **Essential 19€** : 3 piliers au choix
- **Complete 29€** : 7 piliers + communauté
- **VIP 47€** : Tout + coaching groupe

## 📱 Composants React à Développer

```typescript
// Composants principaux
interface CourseComponents {
  CourseGrid: "Affichage 7 piliers",
  CourseCard: "Card individuelle pilier",
  LessonList: "Liste leçons d'un pilier",
  LessonPlayer: "Lecteur vidéo/contenu",
  ProgressBar: "Barre de progression",
  CompletionButton: "Marquer terminé",
  ResourceDownload: "Téléchargement PDF",
  PremiumGate: "Blocker contenu premium",
  ConversionBanner: "CTA upgrade"
}
```

## 📅 Planning d'Implémentation

### Phase 1 : Structure (Semaine 1)
- [ ] Créer tables Supabase
- [ ] Seed data 7 piliers + leçons
- [ ] Pages routes de base
- [ ] Layout et navigation

### Phase 2 : Contenu (Semaine 2)
- [ ] Système affichage contenu
- [ ] Lecteur vidéo intégré
- [ ] Markdown renderer
- [ ] Gestion ressources

### Phase 3 : Progression (Semaine 3)
- [ ] Tracking progression
- [ ] Système de points
- [ ] Badges et achievements
- [ ] Dashboard stats

### Phase 4 : Freemium (Semaine 4)
- [ ] Premium gates
- [ ] Triggers conversion
- [ ] A/B tests CTAs
- [ ] Analytics conversion

### Phase 5 : Production (Semaine 5)
- [ ] Création contenu IA
- [ ] Upload vidéos
- [ ] PDFs et ressources
- [ ] Tests utilisateurs

## 🎨 Design Guidelines

### Style Aurora50
- Gradient signature : `linear-gradient(135deg, #10B981, #8B5CF6, #EC4899)`
- Cards avec coins arrondis (16-20px)
- Ombres douces
- Emoji signature 🌿
- Typographie claire et accessible

### Mobile First
- Navigation tactile
- Vidéos responsive
- Swipe entre leçons
- Mode offline (PWA future)

## 📊 KPIs à Suivre

### Métriques Engagement
- Taux de complétion par leçon
- Temps moyen par leçon
- Taux d'abandon par pilier
- Streak moyen

### Métriques Conversion
- Conversion après 1ère leçon gratuite
- Conversion par trigger type
- Upgrade path (19€ → 29€ → 47€)
- LTV par cohorte

## ⚠️ Points d'Attention

### Technique
- Optimisation chargement vidéos
- Cache contenu pour performance
- Backup progression utilisateur
- Rate limiting API

### Contenu
- Droits vidéos/images
- Accessibilité (sous-titres)
- Multi-langue (futur)
- Mise à jour régulière

### Légal
- RGPD données progression
- CGU utilisation contenu
- Propriété intellectuelle
- Certificats de completion

## 🚀 Quick Start pour Développeur

```bash
# 1. Créer les migrations
npm run supabase:migrate:create courses_structure

# 2. Appliquer migrations
npm run supabase:migrate:up

# 3. Seed data de test
npm run seed:courses

# 4. Lancer dev
npm run dev

# 5. Tester sur
http://localhost:3000/cours
```

## 📝 Checklist Finale

- [ ] Structure DB complète
- [ ] 7 piliers avec métadonnées
- [ ] 42 leçons minimum (6/pilier)
- [ ] Système progression fonctionnel
- [ ] Gates freemium en place
- [ ] Tracking analytics configuré
- [ ] Tests unitaires
- [ ] Documentation API
- [ ] Guide utilisateur
- [ ] Launch plan

---

*Document créé le 29/01/2025*
*Dernière mise à jour : 29/01/2025*
*Version : 1.0.0*