# Guide d'Implémentation - Refonte Freemium Aurora50

**Version:** 1.0.0  
**Date:** 29/08/2025  
**Auteur:** Architecture Team  
**Statut:** 🟢 En cours

## 📋 Vue d'ensemble

### Contexte Stratégique
Aurora50 pivote d'un modèle de vente directe (47€/mois) vers un modèle **freemium** avec :
- Inscription gratuite sans friction
- Onboarding progressif
- Conversion premium sur 30 jours
- Communauté de 21 885 membres Facebook à activer

### Objectifs Business
| Métrique | Actuel | Cible | Impact |
|----------|--------|-------|--------|
| Taux d'inscription | 1-2% | 15-20% | **10x** |
| Conversion premium | 1-2% direct | 5-8% après essai | **4x** |
| CAC | 50€ | 10€ | **-80%** |
| LTV | 150€ | 300€ | **+100%** |

## 🏗️ Architecture de la Refonte

### Flow Utilisateur

```mermaid
graph TD
    A[Facebook 21k] --> B[Homepage Aurora50]
    B --> C{Choix}
    C -->|Nouveau| D[/inscription]
    C -->|Existant| E[/connexion]
    
    D --> F[Magic Link Email]
    F --> G[/onboarding - 3 questions]
    G --> H[/dashboard Gratuit]
    
    H --> I[Exploration 7 jours]
    I --> J[Trigger Premium]
    J --> K{Décision}
    K -->|Oui| L[Stripe Checkout]
    K -->|Non| M[Reste Gratuit]
```

## 📁 Structure des Fichiers à Créer/Modifier

```
aurora50/
├── app/
│   ├── page.tsx                    [MODIFIER] - Nouvelle homepage
│   ├── inscription/                [CRÉER]
│   │   └── page.tsx                - Page d'inscription gratuite
│   ├── onboarding/                 [CRÉER]
│   │   └── page.tsx                - Flow 3 questions
│   └── (lms)/
│       └── dashboard/
│           └── page.tsx            [MODIFIER] - Support freemium
├── components/
│   ├── freemium/                   [CRÉER]
│   │   ├── LimitBanner.tsx         - Bannière limites freemium
│   │   ├── UpgradeModal.tsx        - Modal de conversion
│   │   └── TrialCountdown.tsx      - Compte à rebours essai
│   └── onboarding/                 [CRÉER]
│       └── QuestionCard.tsx        - Carte de question
├── lib/
│   ├── hooks/
│   │   └── useSubscription.ts      [CRÉER] - Hook gestion abonnement
│   └── utils/
│       └── freemium-limits.ts      [CRÉER] - Limites et règles
└── docs/
    ├── FREEMIUM_IMPLEMENTATION_GUIDE.md [CE FICHIER]
    └── FREEMIUM_PROGRESS.md        [CRÉER] - Suivi implementation
```

## 🎯 Phase 1 : Core (Priorité HAUTE)

### 1.1 Nouvelle Homepage (`/app/page.tsx`)

**Objectif:** Page d'accueil épurée sans prix, focus sur l'inscription gratuite

**Spécifications:**
```typescript
interface HomepageSpec {
  hero: {
    titre: "Aurora50",
    sousTitre: "Votre Renaissance Après 50 Ans Commence Ici",
    stats: "21 885 membres actives",
    cta_principal: "Commencer Gratuitement → /inscription",
    cta_secondaire: "J'ai déjà un compte → /connexion"
  },
  sections: {
    trust_signals: true,    // 3 métriques clés
    testimonials: false,    // Pas en v1
    pricing: false,         // JAMAIS sur homepage
    sigrid: false          // Pas en v1
  }
}
```

**Code à implémenter:**
- Design minimaliste avec gradient Aurora50
- Animation subtile sur le logo (pulse)
- Responsive mobile-first
- Pas de navigation complexe

### 1.2 Page Inscription (`/app/inscription/page.tsx`)

**Objectif:** Inscription ultra-simple en 2 champs

**Spécifications:**
```typescript
interface InscriptionSpec {
  champs: {
    prenom: string,      // PAS le nom complet
    email: string        // Pour magic link
  },
  validation: {
    email_unique: true,
    prenom_min: 2,
    prenom_max: 50
  },
  after_submit: {
    action: "magic_link",
    redirect: "/inscription/confirmation",
    metadata: {
      is_new_user: true,
      source: "homepage"
    }
  }
}
```

**Sécurité:**
- Rate limiting : 3 tentatives par IP/heure
- Validation email côté serveur
- Honeypot anti-bot

### 1.3 Onboarding (`/app/onboarding/page.tsx`)

**Objectif:** 3 questions pour personnaliser l'expérience

**Questions:**
```javascript
const questions = [
  {
    id: "situation",
    question: "Où en êtes-vous aujourd'hui ?",
    options: [
      "En activité professionnelle",
      "En transition de carrière",
      "Nouvellement retraitée",
      "En quête de sens"
    ]
  },
  {
    id: "motivation",
    question: "Qu'est-ce qui vous amène ?",
    options: [
      "Besoin de changement",
      "Sentiment de solitude",
      "Envie d'apprendre",
      "Curiosité et découverte"
    ]
  },
  {
    id: "priorite",
    question: "Votre priorité actuelle ?",
    options: [
      "Libération émotionnelle",
      "Reconquête du corps",
      "Nouvelle carrière",
      "Relations authentiques"
    ]
  }
]
```

**Logique:**
- Progression sauvegardée à chaque étape
- Skip possible (mais déconseillé)
- Réponses stockées en JSONB dans `profiles.onboarding_answers`

### 1.4 Migration Base de Données

**Script SQL à exécuter:**
```sql
-- Étendre la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_answers JSONB,
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free' 
  CHECK (subscription_type IN ('free', 'premium', 'trial')),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conversion_triggers JSONB DEFAULT '[]'::jsonb;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription 
  ON profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends 
  ON profiles(trial_ends_at) 
  WHERE trial_ends_at IS NOT NULL;

-- Vue pour utilisateurs premium
CREATE OR REPLACE VIEW premium_users AS
SELECT * FROM profiles 
WHERE subscription_type IN ('premium', 'trial')
  AND (trial_ends_at IS NULL OR trial_ends_at > NOW());
```

## 🎯 Phase 2 : Limites Freemium (Semaine 2)

### 2.1 Définition des Limites

```typescript
// lib/utils/freemium-limits.ts
export const FREEMIUM_LIMITS = {
  free: {
    chat_messages_per_day: 10,
    profile_views_per_day: 5,
    courses_accessible: ['intro', 'pilier-1-preview'],
    live_access: false,
    private_messages: false,
    sigrid_qa: false,
    downloads: false
  },
  trial: {
    duration_days: 7,
    chat_messages_per_day: 'unlimited',
    profile_views_per_day: 'unlimited',
    courses_accessible: 'all',
    live_access: true,
    private_messages: true,
    sigrid_qa: true,
    downloads: true
  },
  premium: {
    // Tout illimité
    all_features: true
  }
}
```

### 2.2 Hook de Vérification

```typescript
// lib/hooks/useSubscription.ts
export function useSubscription() {
  const { user } = useAuth()
  const [limits, setLimits] = useState(null)
  const [usage, setUsage] = useState(null)
  
  const canAccess = (feature: string) => {
    // Logique de vérification
  }
  
  const triggerUpgrade = (reason: string) => {
    // Ouvrir modal de conversion
  }
  
  return { limits, usage, canAccess, triggerUpgrade }
}
```

## 🎯 Phase 3 : Triggers de Conversion

### 3.1 Moments de Conversion

```typescript
const CONVERSION_TRIGGERS = {
  immediate: [
    'limite_chat_atteinte',      // "Vous avez atteint votre limite de 10 messages"
    'acces_cours_premium',        // "Ce cours est réservé aux membres Premium"
    'live_sigrid_locked'          // "Les lives sont exclusifs aux membres Premium"
  ],
  
  scheduled: [
    'jour_3_engagement',          // Email si actif 3 jours consécutifs
    'jour_7_fin_trial',          // "Votre période d'essai se termine"
    'jour_14_reactivation'       // Si inactif depuis 7 jours
  ],
  
  contextual: [
    'profil_complete_80',        // Profil presque complet
    'premier_ami',               // Première connexion sociale
    'premier_cours_termine'      // Engagement fort
  ]
}
```

### 3.2 Modal de Conversion

```typescript
// components/freemium/UpgradeModal.tsx
interface UpgradeModalProps {
  trigger: string
  userContext: {
    days_since_signup: number
    engagement_score: number
    previous_rejections: number
  }
}

// Adapter le message selon le contexte
const getUpgradeMessage = (trigger: string, context: any) => {
  // Personnalisation du message
}
```

## 📊 Métriques à Tracker

### Events Analytics (Mixpanel/Amplitude)

```javascript
// Événements critiques à tracker
const EVENTS = {
  // Funnel principal
  'homepage_view': {},
  'signup_started': { source: 'homepage|programme|other' },
  'signup_completed': { time_to_complete: seconds },
  'onboarding_started': {},
  'onboarding_step': { step: 1|2|3, answer: string },
  'onboarding_completed': { answers: array },
  
  // Engagement
  'dashboard_view': { is_first_time: boolean },
  'feature_limit_hit': { feature: string, limit: number },
  'upgrade_modal_shown': { trigger: string },
  'upgrade_clicked': { trigger: string, cta: string },
  
  // Conversion
  'trial_started': { source: string },
  'payment_started': { plan: string, price: number },
  'payment_completed': { plan: string, mrr: number },
  'payment_failed': { error: string }
}
```

### KPIs à Suivre

| Métrique | Calcul | Objectif Semaine 1 | Objectif Mois 1 |
|----------|--------|-------------------|-----------------|
| Sign-up Rate | Inscriptions / Visiteurs | 5% | 15% |
| Onboarding Completion | Complété / Commencé | 60% | 80% |
| D1 Retention | Actifs J1 / Inscrits J0 | 40% | 50% |
| D7 Retention | Actifs J7 / Inscrits J0 | 20% | 30% |
| Trial Conversion | Premium / Trials | 10% | 25% |
| Free to Paid | Premium / Total Users | 2% | 5% |

## 🚨 Points d'Attention

### Sécurité
- [ ] Rate limiting sur toutes les routes publiques
- [ ] Validation stricte des inputs
- [ ] Sanitization des données onboarding
- [ ] Protection CSRF sur les forms

### Performance
- [ ] Lazy loading des composants lourds
- [ ] Optimisation images (next/image)
- [ ] Cache des données statiques
- [ ] Pagination sur les listes

### UX
- [ ] Messages d'erreur clairs
- [ ] Feedback visuel immédiat
- [ ] Sauvegarde automatique onboarding
- [ ] Responsive parfait mobile

### Legal
- [ ] RGPD : consentement explicite
- [ ] CGU/CGV à jour
- [ ] Politique de confidentialité
- [ ] Droit de rétractation

## 📅 Planning de Livraison

### Sprint 1 (Cette semaine)
- [x] Document guide (ce fichier)
- [ ] Homepage nouvelle
- [ ] Page inscription
- [ ] Flow onboarding
- [ ] Migration DB

### Sprint 2 (Semaine prochaine)
- [ ] Limites freemium
- [ ] Hook subscription
- [ ] Bannières limites
- [ ] Modal upgrade

### Sprint 3 (S+2)
- [ ] Triggers email
- [ ] Analytics complet
- [ ] A/B tests
- [ ] Optimisations

## 🔄 Processus de Validation

1. **Development** → Branche `feature/freemium-v1`
2. **Review** → PR avec checklist
3. **Staging** → Test avec 10 beta users
4. **Production** → Déploiement progressif 10% → 50% → 100%

## 📚 Ressources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Design System Aurora50](/docs/DESIGN_SYSTEM.md)

---

*Ce document est la référence unique pour l'implémentation freemium.*  
*Toute modification doit être approuvée et versionnée.*