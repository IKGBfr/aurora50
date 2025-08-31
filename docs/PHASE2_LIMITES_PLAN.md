# Phase 2 : Implémentation des Limites Freemium

**Date de création :** 31/08/2025  
**Statut :** 📋 Planifié  
**Prérequis :** Phase 1 ✅ Complétée | Migration DB ✅ 100%

## 🎯 Objectifs Phase 2

Implémenter un système de limites intelligent qui :
- Guide naturellement vers la conversion premium
- Offre une vraie valeur en gratuit (pas de frustration excessive)
- Montre clairement les avantages premium
- Track l'usage pour optimiser les limites

## 📊 Limites à implémenter

### 1. Chat communautaire
| Plan | Limite | Comportement |
|------|--------|--------------|
| **Gratuit** | 10 messages/jour | Bannière à 7/10, modal à 10/10 |
| **Trial** | Illimité 7 jours | Countdown visible |
| **Premium** | Illimité | Badge premium visible |

### 2. Consultation de profils
| Plan | Limite | Comportement |
|------|--------|--------------|
| **Gratuit** | 5 profils/jour | Floutage après limite |
| **Trial** | Illimité 7 jours | Accès complet |
| **Premium** | Illimité | Accès complet |

### 3. Accès aux cours
| Plan | Accès | Détails |
|------|-------|---------|
| **Gratuit** | Intro + 1 preview/pilier | Teaser des autres cours |
| **Trial** | Tous les cours | Badge "Essai gratuit" |
| **Premium** | Tous les cours | Téléchargements inclus |

### 4. Lives avec Sigrid
| Plan | Accès | Alternative |
|------|-------|-------------|
| **Gratuit** | ❌ Bloqué | Voir les replays (5 min max) |
| **Trial** | ✅ Complet | Participer aux Q&A |
| **Premium** | ✅ Complet | Accès prioritaire Q&A |

### 5. Messages privés
| Plan | Accès | Limite |
|------|-------|--------|
| **Gratuit** | ❌ Désactivé | Voir qui veut vous contacter |
| **Trial** | ✅ Activé | 20 messages/jour |
| **Premium** | ✅ Activé | Illimité |

## 🛠️ Composants à créer

### Hooks
```typescript
// lib/hooks/useFreemiumLimits.ts
- useFreemiumLimits() // Hook principal
- useCanAccess(feature) // Vérification d'accès
- useUsageTracking() // Tracking usage
- useTrialCountdown() // Compte à rebours trial
```

### Composants UI
```typescript
// components/freemium/
- UpgradeModal.tsx // Modal contextuel de conversion
- UsageIndicator.tsx // Indicateur visuel (7/10 messages)
- TrialBanner.tsx // Bannière compte à rebours
- FeatureLocked.tsx // Overlay pour contenu bloqué
- LimitReachedToast.tsx // Notification limite atteinte
```

### Utils
```typescript
// lib/utils/freemium-limits.ts
- LIMITS_CONFIG // Configuration centralisée
- checkLimit(userId, feature) // Vérification côté serveur
- incrementUsage(userId, feature) // Incrément usage
- resetDailyLimits() // Cron job quotidien
```

## 📱 Intégration dans l'UI existante

### Chat (`/app/(lms)/chat/page.tsx`)
```typescript
// Avant envoi message
const canSend = await checkLimit('chat')
if (!canSend) {
  showUpgradeModal('chat_limit_reached')
  return
}

// Affichage compteur
<UsageIndicator 
  current={dailyChatCount} 
  max={10}
  feature="chat"
/>
```

### Profils (`/app/(lms)/profil/[username]/page.tsx`)
```typescript
// Vérification accès
if (!canViewProfile) {
  return <ProfileBlurred onUpgrade={handleUpgrade} />
}

// Tracking vue
await incrementUsage('profile_view')
```

### Cours (`/app/(lms)/cours/[slug]/page.tsx`)
```typescript
// Vérification accès cours premium
if (course.isPremium && !isPremiumUser) {
  return <CourseTeaser course={course} />
}
```

## 🎨 UX des limites

### Principes
1. **Transparence** : Toujours montrer les limites clairement
2. **Progressivité** : Avertir avant d'atteindre la limite
3. **Valeur** : Montrer ce qu'ils manquent, pas juste bloquer
4. **Contexte** : Message adapté selon l'action bloquée

### Messages types
```javascript
const LIMIT_MESSAGES = {
  chat_warning: "Plus que 3 messages aujourd'hui ! 💬",
  chat_reached: "Vous avez atteint votre limite quotidienne. Passez à Premium pour continuer la conversation ! 🚀",
  profile_limit: "Découvrez qui s'intéresse à vous ! 5 profils/jour en gratuit, illimité en Premium 👥",
  course_locked: "Ce cours fait partie du programme complet Aurora50. Débloquez-le avec Premium ! 📚",
  live_blocked: "Les lives avec Sigrid sont exclusifs aux membres Premium. Ne manquez plus aucun conseil ! 🎥"
}
```

## 📈 Tracking & Analytics

### Events à tracker
```javascript
// Limites
track('limit_warning_shown', { feature, remaining })
track('limit_reached', { feature, daily_count })
track('upgrade_modal_shown', { trigger, feature })
track('upgrade_clicked', { from_feature, cta_text })

// Usage
track('daily_usage', { 
  chat_messages: count,
  profiles_viewed: count,
  courses_accessed: array
})

// Conversion
track('trial_started', { trigger })
track('trial_converted', { days_used, features_used })
track('subscription_started', { plan, price })
```

### KPIs Phase 2
| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Taux de limite atteinte | 30% des gratuits | % qui atteignent une limite/jour |
| Conversion sur limite | 15% | % qui upgrade après limite |
| Trial activation | 25% | % gratuits qui activent trial |
| Trial to paid | 40% | % trial qui deviennent premium |

## 🚀 Plan d'implémentation

### Sprint 1 (3 jours)
- [ ] Hook useFreemiumLimits
- [ ] Intégration limite chat
- [ ] Modal upgrade basique
- [ ] Tests unitaires

### Sprint 2 (3 jours)
- [ ] Limite profils
- [ ] Limite cours
- [ ] UI indicators
- [ ] Tests intégration

### Sprint 3 (2 jours)
- [ ] Lives blocking
- [ ] Messages privés
- [ ] Trial countdown
- [ ] Polish UX

### Sprint 4 (2 jours)
- [ ] Analytics events
- [ ] A/B tests setup
- [ ] Documentation
- [ ] Déploiement

## ✅ Definition of Done

- [ ] Toutes les limites fonctionnelles
- [ ] 0 erreur console
- [ ] Tests > 80% coverage
- [ ] Analytics en place
- [ ] Documentation complète
- [ ] Review UX validée
- [ ] Performance < 100ms pour checks

## 🔗 Ressources

- [Freemium Best Practices](https://www.reforge.com/blog/freemium-model)
- [Limite UX Patterns](https://growth.design/case-studies)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

*Phase 2 prête à démarrer. La base technique est solide, focus sur l'UX de conversion.*
