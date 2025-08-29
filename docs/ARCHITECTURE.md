# Architecture LMS Aurora50

## 1. Vue d'ensemble

### Stack Technologique
- **Frontend**: Next.js 15.5.0 (App Router avec Turbopack)
- **UI/Styling**: 
  - Tailwind CSS
  - Emotion (v11.14.0) pour styles dynamiques
  - Lottie React (v2.4.1) pour animations
- **Base de données**: Supabase (PostgreSQL + Realtime)
- **Authentification**: Supabase Auth (Magic Link + OAuth)
- **Paiement**: Stripe (v18.4.0)
- **Email**: Brevo (anciennement SendinBlue)
- **Graphiques**: Recharts (v3.1.2)
- **Langage**: TypeScript (v5)
- **Runtime**: React 19.1.0 avec React DOM 19.1.0

### Philosophie du LMS
Aurora50 est une plateforme d'apprentissage en ligne spécialement conçue pour les femmes approchant ou ayant dépassé la cinquantaine. Elle combine :
- **Apprentissage personnalisé** : Parcours adaptatif basé sur le rythme et les préférences de chaque apprenante
- **Communauté bienveillante** : Espaces d'échange et d'entraide entre pairs
- **Accompagnement humain** : Coaching par Sigrid Larsen, experte en transformation personnelle
- **Gamification douce** : Système de progression non-compétitif favorisant la motivation intrinsèque

## 2. Structure des Fichiers

```
aurora50/
├── app/                          # App Router Next.js
│   ├── (lms)/                    # Groupe de routes pour l'espace membre
│   │   ├── layout.tsx            # Layout principal avec navigation LMS
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
│   ├── api/                      # Routes API
│   │   ├── auth/
│   │   │   └── callback/         # Callback OAuth
│   │   ├── test-brevo/           # Test email Brevo
│   │   ├── test-config/          # Test configuration
│   │   ├── test-webhook/         # Test webhook
│   │   └── webhooks/
│   │       └── stripe/           # Webhook Stripe
│   ├── auth/
│   │   └── confirm/              # Confirmation email
│   ├── charte/                   # Charte éthique
│   ├── connexion/                # Page de connexion
│   ├── cours/
│   │   └── guide-demarrage/      # Guide de démarrage public
│   ├── merci/                    # Page de remerciement post-paiement
│   ├── programme/                # Présentation du programme
│   ├── sigrid-larsen/            # Page de présentation Sigrid
│   ├── test-auth/                # Page de test authentification
│   ├── test-dev-auth/            # Test auth mode développement
│   ├── test-stripe/              # Test intégration Stripe
│   ├── layout.tsx                # Layout racine
│   ├── globals.css               # Styles globaux
│   └── page.tsx                  # Page d'accueil (landing)
├── components/                    # Composants réutilisables
│   ├── AboutSigrid.tsx          # Section à propos
│   ├── Benefits.tsx             # Bénéfices du programme
│   ├── Charter.tsx              # Composant charte
│   ├── CTAButton.tsx            # Bouton call-to-action
│   ├── DevModeIndicator.tsx     # Indicateur mode dev
│   ├── FAQ.tsx                  # Questions fréquentes
│   ├── Hero.tsx                 # Section hero
│   ├── Pricing.tsx              # Section tarification
│   ├── Testimonials.tsx         # Témoignages
│   ├── layout/
│   │   └── UserMenu.tsx         # Menu utilisateur
│   └── providers/
│       ├── AuthProvider.tsx     # Provider authentification
│       └── DevAuthProvider.tsx  # Provider auth dev
├── lib/                          # Utilitaires et configurations
│   ├── database.types.ts        # Types TypeScript Supabase
│   ├── emotion.tsx              # Configuration Emotion
│   ├── stripe.ts                # Configuration Stripe
│   ├── email/
│   │   ├── brevo.ts             # Client Brevo
│   │   └── templates/
│   │       └── payment-success.ts # Template email succès
│   ├── hooks/
│   │   ├── useAuth.tsx          # Hook authentification
│   │   └── useMediaQuery.ts     # Hook media queries
│   ├── supabase/
│   │   ├── client.ts            # Client Supabase côté client
│   │   ├── client-dev.ts        # Client dev avec mock auth
│   │   ├── middleware.ts        # Middleware Supabase
│   │   └── server.ts            # Client Supabase côté serveur
│   └── utils/
│       └── breakpoints.ts       # Points de rupture responsive
├── scripts/                      # Scripts utilitaires
│   ├── clean-test-user.ts       # Nettoyage utilisateur test
│   ├── create-tables.sql        # Script création tables
│   ├── seed-test-user.ts        # Seed utilisateur test
│   ├── test-connection.ts       # Test connexion DB
│   └── test-data.ts             # Données de test
├── docs/                         # Documentation
│   └── [Fichiers de documentation]
├── public/                       # Assets statiques
│   ├── animations/               # Animations Lottie
│   └── images/                   # Images
├── middleware.ts                 # Middleware Next.js
├── package.json                  # Dépendances
├── tsconfig.json                # Configuration TypeScript
├── next.config.ts               # Configuration Next.js
└── eslint.config.mjs            # Configuration ESLint
```

## 3. Détail des Routes & Pages

### 3.1 Espace Public

#### `/` - Page d'Accueil
**Composants**: Hero, Benefits, AboutSigrid, Testimonials, Pricing, FAQ, CTAButton
**Rôle**: Landing page de conversion avec présentation complète du programme

#### `/connexion` - Authentification
**Rôle**: Page de connexion/inscription avec Magic Link et OAuth
**Fonctionnalités**:
- Connexion par email (Magic Link)
- Inscription avec validation
- OAuth (Google, Facebook - à venir)
- Récupération de compte

#### `/programme` - Présentation du Programme
**Rôle**: Détails complets du programme Aurora50
**Contenu**: Modules, méthodologie, bénéfices

#### `/sigrid-larsen` - Page Sigrid
**Rôle**: Présentation de la fondatrice et coach
**Contenu**: Biographie, philosophie, approche

#### `/charte` - Charte Éthique
**Rôle**: Valeurs et engagements de la communauté
**Composant**: Charter

#### `/merci` - Page de Remerciement
**Rôle**: Confirmation après paiement Stripe
**Fonctionnalités**: Envoi email de bienvenue via Brevo

### 3.2 Espace Membre (LMS)

#### `/dashboard` - Tableau de Bord
**Rôle**: Vue d'ensemble personnalisée
**Données affichées**:
- Statistiques de progression (points, niveau, streak)
- Cours en cours avec progression
- Activités récentes
- Achievements débloqués
- Graphiques de progression (Recharts)

#### `/cours` - Liste des Cours
**Rôle**: Navigation dans le curriculum
**Fonctionnalités**:
- Affichage des modules disponibles
- Progression par module
- Filtrage et recherche

#### `/cours/[slug]` - Page de Leçon
**Rôle**: Interface d'apprentissage
**Fonctionnalités**:
- Contenu de la leçon
- Navigation entre leçons
- Marquage de progression
- Ressources téléchargeables

#### `/chat` - Espace Chat
**Rôle**: Communication temps réel (à implémenter)
**Fonctionnalités prévues**:
- Chat en temps réel via Supabase Realtime
- Salles thématiques
- Historique des messages

#### `/messages` - Messagerie Privée
**Rôle**: Communication privée (à implémenter)
**Fonctionnalités prévues**:
- Messages privés entre membres
- Notifications

#### `/membres` - Annuaire
**Rôle**: Découverte de la communauté
**Fonctionnalités**:
- Liste des membres
- Profils publics
- Recherche et filtres

#### `/profil/[username]` - Profil Public
**Rôle**: Affichage du profil utilisateur
**Données**:
- Informations publiques
- Avatar et bannière
- Bio
- Statistiques publiques

#### `/profil/modifier` - Édition Profil
**Rôle**: Personnalisation du profil
**Fonctionnalités**:
- Upload avatar (Storage Supabase)
- Modification des informations
- Paramètres de confidentialité

### 3.3 Routes API

#### `/api/auth/callback`
Gestion du callback OAuth Supabase

#### `/api/webhooks/stripe`
Réception et traitement des webhooks Stripe pour:
- Confirmation de paiement
- Mise à jour profil utilisateur
- Envoi email de bienvenue

#### `/api/test-*`
Routes de test pour vérifier les intégrations

## 4. Modèle de Données Supabase

### 4.1 Tables Principales

#### Table `profiles`
```sql
- id: UUID (PK, FK → auth.users)
- full_name: TEXT
- avatar_url: TEXT
- cover_url: TEXT
- bio: TEXT
- email: TEXT (UNIQUE)
- stripe_customer_id: TEXT
- stripe_session_id: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### Table `user_stats`
```sql
- user_id: UUID (PK, FK → auth.users)
- points: INTEGER (default: 0)
- level: INTEGER (default: 1)
- streak_days: INTEGER (default: 0)
- total_lessons_completed: INTEGER (default: 0)
- total_study_time_minutes: INTEGER (default: 0)
- rank: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### Table `user_achievements`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- badge_id: TEXT (UNIQUE avec user_id)
- title: TEXT
- description: TEXT
- icon: TEXT
- rarity: TEXT (bronze|silver|gold|diamond)
- earned_at: TIMESTAMPTZ
```

#### Table `user_activities`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- type: TEXT (module_completed|badge_unlocked|community_participation|course_started|lesson_completed)
- title: TEXT
- description: TEXT
- icon: TEXT
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

#### Table `user_courses`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- course_id: TEXT (UNIQUE avec user_id)
- course_title: TEXT
- course_thumbnail: TEXT
- current_lesson: INTEGER (default: 1)
- total_lessons: INTEGER
- progress_percentage: INTEGER (0-100)
- started_at: TIMESTAMPTZ
- last_accessed_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
```

#### Table `user_progress_history`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- date: DATE (UNIQUE avec user_id)
- points_earned: INTEGER
- lessons_completed: INTEGER
- study_time_minutes: INTEGER
- streak_maintained: BOOLEAN
- created_at: TIMESTAMPTZ
```

#### Table `courses`
```sql
- id: UUID (PK)
- title: TEXT
- description: TEXT
- created_at: TIMESTAMPTZ
```

#### Table `lessons`
```sql
- id: UUID (PK)
- course_id: UUID (FK → courses)
- title: TEXT
- content: TEXT
- release_day_offset: INTEGER
- created_at: TIMESTAMPTZ
```

#### Table `enrollments`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- course_id: UUID (FK → courses)
- enrolled_at: TIMESTAMPTZ
```

#### Table `chat_messages`
```sql
- id: BIGINT (PK, IDENTITY)
- user_id: UUID (FK → auth.users)
- content: TEXT
- created_at: TIMESTAMPTZ
```

### 4.2 Storage Buckets

#### Bucket `avatars`
- **Type**: Public (lecture publique)
- **Taille max**: 5 MB par fichier
- **Types MIME**: image/jpeg, jpg, png, gif, webp
- **Politiques RLS**:
  - Lecture publique pour tous
  - Upload/Update/Delete par le propriétaire uniquement

### 4.3 Politiques RLS

Toutes les tables ont RLS activé avec:
- **Lecture**: Publique pour toutes les tables
- **Écriture**: Limitée au propriétaire (auth.uid() = user_id)
- **Exceptions**: Certaines opérations système uniquement

## 5. Composants et Hooks

### 5.1 Composants Landing Page
- `Hero`: Section d'accueil avec animation Lottie
- `Benefits`: Avantages du programme
- `AboutSigrid`: Présentation de la coach
- `Testimonials`: Témoignages clients
- `Pricing`: Plans tarifaires avec intégration Stripe
- `FAQ`: Questions fréquentes
- `CTAButton`: Boutons d'action réutilisables
- `Charter`: Charte éthique complète

### 5.2 Composants Layout
- `UserMenu`: Menu utilisateur avec avatar et navigation
- `DevModeIndicator`: Badge mode développement

### 5.3 Providers
- `AuthProvider`: Gestion de l'authentification Supabase
- `DevAuthProvider`: Mock authentification pour développement

### 5.4 Hooks Personnalisés
- `useAuth`: Accès au contexte d'authentification
- `useMediaQuery`: Gestion responsive

## 6. Intégrations Externes

### 6.1 Stripe
- **Configuration**: lib/stripe.ts
- **Webhook**: /api/webhooks/stripe
- **Fonctionnalités**:
  - Checkout Session
  - Gestion des paiements uniques
  - Mise à jour automatique du profil après paiement

### 6.2 Brevo (Email)
- **Configuration**: lib/email/brevo.ts
- **Templates**: lib/email/templates/
- **Utilisation**:
  - Email de bienvenue après inscription
  - Email de confirmation de paiement
  - Notifications transactionnelles

### 6.3 Supabase
- **Authentification**: Magic Link + OAuth (prévu)
- **Base de données**: PostgreSQL avec RLS
- **Storage**: Gestion des avatars
- **Realtime**: Chat et notifications (à implémenter)

## 7. Configuration et Variables d'Environnement

### Variables requises (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Brevo
BREVO_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

## 8. Scripts NPM

```json
{
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint",
  "test:connection": "tsx scripts/test-connection.ts",
  "seed:test": "tsx scripts/seed-test-user.ts",
  "seed:clean": "tsx scripts/clean-test-user.ts"
}
```

## 9. Middleware

Le middleware Next.js gère:
- Protection des routes /lms/*
- Redirection vers /connexion si non authentifié
- Gestion des sessions Supabase
- Refresh automatique des tokens

## 10. Optimisations et Performances

### 10.1 Next.js
- Turbopack pour développement rapide
- App Router avec Server Components
- Image optimization automatique
- Font optimization

### 10.2 Base de données
- Index sur toutes les clés étrangères
- Index composites pour les requêtes fréquentes
- Triggers pour updated_at automatique
- Politiques RLS optimisées

### 10.3 Frontend
- Lazy loading des composants lourds
- Animations Lottie optimisées
- CSS-in-JS avec Emotion pour styles dynamiques
- Tailwind CSS pour styles statiques

## 11. Sécurité

### 11.1 Authentification
- Magic Link sécurisé
- Sessions JWT
- Refresh tokens automatiques
- Protection CSRF

### 11.2 Base de données
- Row Level Security (RLS) sur toutes les tables
- Validation des données côté serveur
- Prepared statements via Supabase

### 11.3 API
- Validation des webhooks Stripe
- Rate limiting (à implémenter)
- CORS configuré

## 12. État Actuel et Roadmap

### ✅ Implémenté
- Landing page complète
- Authentification Magic Link
- Intégration Stripe
- Dashboard avec statistiques
- Profils utilisateurs
- Upload avatars
- Système de gamification (tables)
- Email transactionnels (Brevo)

### 🚧 En cours
- Chat temps réel
- Messagerie privée
- Contenu des cours

### 📋 Prévu
- OAuth (Google, Facebook)
- Notifications push
- Application mobile
- Analytics avancés
- Export de données
- Certificats de completion

## 13. Conventions de Code

### TypeScript
- Types stricts activés
- Interfaces préfixées par `I`
- Types préfixés par `T`
- Enums en PascalCase

### Composants React
- Functional components uniquement
- Hooks personnalisés préfixés par `use`
- Props typées avec interfaces

### Styles
- Tailwind pour layout et utilities
- Emotion pour styles dynamiques
- Mobile-first responsive design

### Git
- Conventional commits
- Branches: feature/*, fix/*, chore/*
- PR obligatoires avec review

---

*Documentation mise à jour le 29/08/2025*
*Version: 0.1.0*
