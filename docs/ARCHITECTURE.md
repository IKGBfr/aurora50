# Architecture LMS Aurora50

## 1. Vue d'ensemble

### Stack Technologique
- **Frontend**: Next.js 15.5 (App Router)
- **Styling**: Tailwind CSS + Emotion
- **Base de données**: Supabase (PostgreSQL + Realtime)
- **Authentification**: Supabase Auth
- **Paiement**: Stripe
- **Animations**: Lottie React
- **Langage**: TypeScript

### Philosophie du LMS
Aurora50 est une plateforme d'apprentissage en ligne spécialement conçue pour les femmes approchant ou ayant dépassé la cinquantaine. Elle combine :
- **Apprentissage personnalisé** : Parcours adaptatif basé sur le rythme et les préférences de chaque apprenante
- **Communauté bienveillante** : Espaces d'échange et d'entraide entre pairs
- **Accompagnement humain** : Coaching par Sigrid, mentor virtuelle inspirée d'une vraie coach
- **Gamification douce** : Système de progression non-compétitif favorisant la motivation intrinsèque

## 2. Structure des Fichiers

```
aurora50/
├── app/
│   ├── (lms)/                    # Groupe de routes pour l'espace membre
│   │   ├── layout.tsx            # Layout principal avec navigation
│   │   ├── dashboard/            # Tableau de bord personnalisé
│   │   │   └── page.tsx
│   │   ├── cours/                # Gestion des cours
│   │   │   ├── page.tsx          # Liste des modules
│   │   │   └── [slug]/           # Pages de leçons dynamiques
│   │   │       └── page.tsx
│   │   ├── chat/                 # Espace communautaire
│   │   │   └── page.tsx
│   │   ├── messages/             # Messagerie privée
│   │   │   └── page.tsx
│   │   ├── membres/              # Annuaire communautaire
│   │   │   └── page.tsx
│   │   └── profil/               # Gestion du profil
│   │       ├── [username]/       # Profil public/privé
│   │       │   └── page.tsx
│   │       └── modifier/         # Édition du profil
│   │           └── page.tsx
│   ├── connexion/                # Authentification
│   │   └── page.tsx
│   ├── api/                      # Routes API
│   │   ├── test-brevo/
│   │   ├── test-config/
│   │   └── test-webhook/
│   ├── charte/                   # Charte éthique
│   │   └── page.tsx
│   ├── cours/                    # Pages publiques des cours
│   │   └── guide-demarrage/
│   ├── layout.tsx                # Layout racine
│   ├── globals.css
│   └── page.tsx                  # Page d'accueil
├── components/                    # Composants réutilisables
├── lib/                          # Utilitaires et configurations
│   ├── email/
│   │   ├── templates/
│   │   └── brevo.ts
│   ├── emotion.tsx
│   └── stripe.ts
└── public/                       # Assets statiques
```

## 3. Détail des Routes & Pages

### 3.1 Espace Principal

#### `/dashboard` - Tableau de Bord
**Rôle**: Vue d'ensemble personnalisée de la progression et des activités
**Composants majeurs**:
- `DashboardMetrics`: Affichage des KPIs (progression, temps d'étude, points)
- `NextLessonsWidget`: Prochaines leçons recommandées
- `ActivityCalendar`: Calendrier de pratique quotidienne
- `PersonalGoals`: Objectifs personnels et échéances

**Données affichées**:
- Progression globale et par module
- Statistiques d'apprentissage
- Notifications et rappels
- Recommandations personnalisées

#### `/cours` - Mon Parcours
**Rôle**: Navigation dans le curriculum structuré
**Composants majeurs**:
- `ModuleGrid`: Grille des modules avec progression visuelle
- `ProgressTracker`: Barre de progression globale
- `ModuleCard`: Carte détaillée pour chaque module

**Données affichées**:
- Liste des modules disponibles
- Progression par module
- Durée estimée
- Prérequis et objectifs

#### `/cours/[slug]` - Page de Leçon
**Rôle**: Interface d'apprentissage immersive
**Composants majeurs**:
- `LessonPlayer`: Lecteur vidéo/audio adaptatif
- `TranscriptPanel`: Transcription synchronisée
- `ExerciseSection`: Exercices interactifs
- `ResourceDownloads`: Ressources téléchargeables
- `NavigationControls`: Navigation entre leçons

**Données affichées**:
- Contenu multimédia de la leçon
- Exercices et quiz
- Documents complémentaires
- Notes personnelles

### 3.2 Espace Communautaire

#### `/chat` - Salle de Chat
**Rôle**: Espace de discussion en temps réel
**Composants majeurs**:
- `ChatWindow`: Interface de chat principale
- `OnlineUsersList`: Liste des membres connectés
- `MessageBubble`: Bulles de messages stylisées
- `EmojiPicker`: Sélecteur d'émojis
- `ChatRooms`: Navigation entre salles thématiques

**Données affichées**:
- Messages en temps réel
- Statuts de présence
- Historique de conversation
- Notifications de nouveaux messages

#### `/messages` - Messagerie Privée
**Rôle**: Communication privée entre membres et avec les coachs
**Composants majeurs**:
- `ConversationList`: Liste des conversations
- `MessageThread`: Fil de discussion
- `ComposeMessage`: Éditeur de message enrichi
- `UnreadBadge`: Indicateur de messages non lus

**Données affichées**:
- Conversations actives
- Historique des messages
- Statut de lecture
- Pièces jointes

#### `/membres` - Annuaire des Membres
**Rôle**: Découverte et connexion avec la communauté
**Composants majeurs**:
- `MemberGrid`: Grille de profils membres
- `SearchFilters`: Filtres de recherche avancés
- `MemberCard`: Carte de présentation membre
- `WeeklyLeaderboard`: Classement hebdomadaire

**Données affichées**:
- Profils publics des membres
- Niveaux et achievements
- Statuts de connexion
- Points et classements

### 3.3 Espace Personnel

#### `/profil/[username]` - Page de Profil
**Rôle**: Vitrine personnelle et suivi de progression
**Composants majeurs**:
- `ProfileHeader`: En-tête avec avatar et stats
- `AchievementShowcase`: Vitrine des badges
- `ProgressChart`: Graphiques de progression
- `ActivityFeed`: Flux d'activité récente
- `ProfileStats`: Statistiques détaillées

**Données affichées**:
- Informations personnelles (publiques)
- Progression et achievements
- Activité récente
- Statistiques d'apprentissage

#### `/profil/modifier` - Édition du Profil
**Rôle**: Personnalisation du profil et des préférences
**Composants majeurs**:
- `AvatarUploader`: Upload et édition d'avatar
- `ProfileForm`: Formulaire d'informations personnelles
- `PrivacySettings`: Paramètres de confidentialité
- `NotificationPreferences`: Préférences de notification
- `LearningPreferences`: Préférences d'apprentissage

**Données modifiables**:
- Informations personnelles
- Photo de profil
- Bio et centres d'intérêt
- Paramètres de confidentialité
- Préférences de notification

### 3.4 Pages Techniques

#### `/connexion` - Page de Connexion
**Rôle**: Authentification et inscription
**Composants majeurs**:
- `LoginForm`: Formulaire de connexion
- `RegisterForm`: Formulaire d'inscription
- `SocialAuthButtons`: Connexion via réseaux sociaux
- `PasswordReset`: Récupération de mot de passe

**Fonctionnalités**:
- Connexion email/mot de passe
- Inscription avec validation
- OAuth (Google, Facebook)
- Récupération de compte

## 4. Modèle de Données (Data Flow)

### 4.1 Architecture Base de Données Supabase

#### Tables Principales

**users**
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `full_name`: String
- `avatar_url`: String
- `birth_year`: Integer
- `bio`: Text
- `interests`: Array<String>
- `created_at`: Timestamp
- `last_active`: Timestamp

**user_progress**
- `id`: UUID
- `user_id`: UUID (Foreign Key → users)
- `module_id`: UUID (Foreign Key → modules)
- `lesson_id`: UUID (Foreign Key → lessons)
- `progress_percentage`: Integer
- `completed_at`: Timestamp
- `time_spent`: Integer

**modules**
- `id`: UUID
- `title`: String
- `description`: Text
- `order_index`: Integer
- `duration_estimate`: Integer
- `difficulty_level`: Enum

**lessons**
- `id`: UUID
- `module_id`: UUID (Foreign Key → modules)
- `title`: String
- `slug`: String (Unique)
- `content_type`: Enum (video, audio, text)
- `content_url`: String
- `duration`: Integer
- `order_index`: Integer

**chat_messages**
- `id`: UUID
- `user_id`: UUID (Foreign Key → users)
- `room_id`: UUID (Foreign Key → chat_rooms)
- `content`: Text
- `created_at`: Timestamp

**private_messages**
- `id`: UUID
- `sender_id`: UUID (Foreign Key → users)
- `recipient_id`: UUID (Foreign Key → users)
- `content`: Text
- `read_at`: Timestamp
- `created_at`: Timestamp

**achievements**
- `id`: UUID
- `user_id`: UUID (Foreign Key → users)
- `badge_id`: UUID (Foreign Key → badges)
- `earned_at`: Timestamp

### 4.2 Flux de Données par Page

| Page | Lecture (READ) | Écriture (WRITE) | Temps Réel |
|------|---------------|------------------|------------|
| Dashboard | user_progress, modules, achievements | user_progress (marquage vue) | ❌ |
| Cours | modules, lessons, user_progress | user_progress | ❌ |
| Leçon | lessons, user_progress, resources | user_progress, notes | ❌ |
| Chat | chat_messages, users (online) | chat_messages | ✅ |
| Messages | private_messages, users | private_messages | ✅ |
| Membres | users, achievements | follow_relationships | ✅ (statut) |
| Profil | users, achievements, user_progress | - | ❌ |
| Modifier Profil | users | users | ❌ |

### 4.3 Politiques RLS (Row Level Security)
- **users**: Lecture publique des profils publics, écriture limitée au propriétaire
- **user_progress**: Lecture/écriture limitée au propriétaire
- **messages**: Lecture limitée aux participants, écriture authentifiée
- **achievements**: Lecture publique, écriture par système uniquement

## 5. Composants Partagés

### 5.1 Layout & Navigation
- **Sidebar**: Navigation principale latérale persistante
- **HeaderBar**: Barre d'en-tête avec actions contextuelles
- **MobileNav**: Navigation mobile responsive
- **Breadcrumbs**: Fil d'Ariane pour la navigation

### 5.2 UI Components
- **UserProfileCard**: Carte de profil utilisateur réutilisable
- **ProgressBar**: Barre de progression animée
- **AchievementBadge**: Badge de réussite avec animation
- **LoadingSpinner**: Indicateur de chargement
- **EmptyState**: État vide avec illustration
- **NotificationToast**: Notifications toast

### 5.3 Forms & Inputs
- **FormField**: Champ de formulaire avec validation
- **TextEditor**: Éditeur de texte enrichi
- **FileUploader**: Upload de fichiers avec preview
- **DatePicker**: Sélecteur de date accessible
- **SearchInput**: Champ de recherche avec suggestions

### 5.4 Data Display
- **DataTable**: Tableau de données paginé
- **StatCard**: Carte de statistique
- **ChartWrapper**: Wrapper pour graphiques
- **Timeline**: Composant timeline vertical
- **MessageBox**: Boîte de message stylisée

### 5.5 Modals & Overlays
- **Modal**: Modal réutilisable
- **ConfirmDialog**: Dialogue de confirmation
- **Drawer**: Panneau latéral coulissant
- **Tooltip**: Info-bulle accessible
- **Popover**: Popover contextuel

## 6. Stratégies d'Optimisation

### 6.1 Performance
- Lazy loading des modules et composants
- Image optimization avec Next.js Image
- Mise en cache aggressive des données statiques
- Pagination et virtualisation des longues listes
- Prefetching des routes probables

### 6.2 SEO & Accessibilité
- Métadonnées dynamiques par page
- Structure sémantique HTML5
- Support ARIA complet
- Navigation au clavier
- Contraste WCAG AAA

### 6.3 Sécurité
- Authentification Supabase avec JWT
- RLS sur toutes les tables
- Validation côté serveur
- Protection CSRF
- Rate limiting sur les API

## 7. Prochaines Étapes

1. **Phase 1 - Configuration** (Semaine 1)
   - Setup Supabase et schéma de base de données
   - Configuration de l'authentification
   - Mise en place des variables d'environnement

2. **Phase 2 - Core Features** (Semaines 2-3)
   - Implémentation du système d'authentification
   - Développement du dashboard
   - Système de cours et leçons

3. **Phase 3 - Communauté** (Semaine 4)
   - Chat en temps réel
   - Messagerie privée
   - Profils utilisateurs

4. **Phase 4 - Gamification** (Semaine 5)
   - Système de points
   - Achievements et badges
   - Classements

5. **Phase 5 - Polish** (Semaine 6)
   - Tests et débogage
   - Optimisations performance
   - Documentation utilisateur

## 8. Conventions de Code

### Naming Conventions
- **Composants**: PascalCase (ex: `UserProfile.tsx`)
- **Utilitaires**: camelCase (ex: `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase avec préfixe I/T (ex: `IUser`, `TLesson`)

### Structure des Composants
```tsx
// 1. Imports
import { useState, useEffect } from 'react'

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export default function ComponentName({ props }: ComponentProps) {
  // 4. State
  // 5. Effects
  // 6. Handlers
  // 7. Render
}
```

### Git Workflow
- Branches: `feature/nom-feature`, `fix/nom-bug`
- Commits: Conventional commits (feat:, fix:, docs:, etc.)
- PR obligatoires avec review
- Tests avant merge
