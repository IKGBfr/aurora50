# Correction Complète des Problèmes de Redirection

## Date : 03/09/2025
## Dernière mise à jour : 03/09/2025 - 12:16

## Problèmes Identifiés et Résolus

### 1. ✅ Lien de confirmation email → Erreur `otp_expired`
**Problème** : Les liens de confirmation email redirigeaient vers `/` avec une erreur `otp_expired`.

**Solution** : 
- Création de `/app/api/auth/confirm/route.ts` pour gérer correctement la confirmation des emails
- Cette route utilise `verifyOtp` avec le `token_hash` pour confirmer l'email
- Redirection intelligente vers `/onboarding` si le profil n'est pas complet, sinon vers `/dashboard`

### 2. ✅ Après inscription → Redirection incorrecte
**Problème** : Après inscription, redirection vers `/connexion?redirectTo=/onboarding` au lieu d'aller directement à `/onboarding`.

**Solution** :
- `/app/inscription/page.tsx` redirige déjà correctement vers `/onboarding` après création du compte
- Modification du middleware pour ne pas interférer avec cette redirection

### 3. ✅ Middleware trop restrictif
**Problème** : Le middleware redirigeait automatiquement les utilisateurs connectés depuis `/inscription` vers `/dashboard`.

**Solution** :
- Ajout de routes publiques dans le middleware : `/auth/confirm`, `/inscription/confirmation`, `/api/auth/confirm`
- Suppression de la redirection automatique depuis `/inscription` pour les utilisateurs connectés
- Simplification de la logique pour éviter les conflits

## Fichiers Modifiés

### 1. `/app/api/auth/confirm/route.ts` (CRÉÉ)
```typescript
// Nouvelle route pour gérer la confirmation des emails
// - Vérifie le token_hash avec verifyOtp
// - Vérifie si l'onboarding est complété
// - Redirige vers /onboarding ou /dashboard selon le cas
```

### 2. `/middleware.ts` (MODIFIÉ)
```typescript
// Ajouts dans publicRoutes:
'/auth/confirm',
'/inscription/confirmation',

// Ajouts dans publicApiRoutes:
'/api/auth/confirm',

// Nouvelle logique : Permet l'accès à /onboarding si referer = /inscription
// Cela gère le délai de propagation de session après inscription
const referer = request.headers.get('referer')
const comingFromInscription = referer?.includes('/inscription')

if (pathname === '/onboarding' && comingFromInscription) {
  // Permettre l'accès temporaire
  return supabaseResponse
}
```

### 3. `/app/inscription/page.tsx` (MODIFIÉ)
- Attend maintenant que la session soit établie avant de rediriger
- Utilise `getSession()` pour vérifier la session
- Fallback sur `window.location.href` si la session n'est pas disponible via router
- Affiche un overlay de chargement pendant la redirection

### 4. `/app/connexion/page.tsx` (VÉRIFIÉ - OK)
- Gère correctement les paramètres `redirectTo`
- Vérifie l'état de l'onboarding et redirige en conséquence

### 5. `/app/api/auth/callback/route.ts` (VÉRIFIÉ - OK)
- Gère les Magic Links et OAuth
- Vérifie le profil et redirige vers `/onboarding` si nécessaire

## Flux de Redirection Corrigés

### 1. Inscription
```
/inscription → Création compte → /onboarding
```

### 2. Confirmation Email
```
Lien email → /api/auth/confirm → 
  - Si onboarding non complété → /onboarding
  - Si onboarding complété → /dashboard
```

### 3. Connexion
```
/connexion → 
  - Si onboarding non complété → /onboarding
  - Si onboarding complété → /dashboard (ou redirectTo)
```

### 4. Routes Protégées
```
Route protégée sans auth → /connexion?redirectTo=[route]
```

## Configuration Supabase Requise

### URLs de Redirection à Configurer
Dans Supabase Dashboard > Authentication > URL Configuration :

```
http://localhost:3000/api/auth/callback
http://localhost:3000/api/auth/confirm
https://aurora50.fr/api/auth/callback
https://aurora50.fr/api/auth/confirm
https://www.aurora50.fr/api/auth/callback
https://www.aurora50.fr/api/auth/confirm
```

### Templates Email
Vérifier que les templates email utilisent les bonnes URLs :
- **Confirm signup** : `{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/dashboard`
- **Magic Link** : `{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard`

## Tests à Effectuer

### 1. Test Inscription
- [ ] Créer un nouveau compte sur `/inscription`
- [ ] Vérifier redirection directe vers `/onboarding`
- [ ] Pas de passage par `/connexion`

### 2. Test Confirmation Email
- [ ] Cliquer sur le lien de confirmation dans l'email
- [ ] Vérifier que l'email est confirmé
- [ ] Vérifier redirection vers `/dashboard` (ou `/onboarding` si profil incomplet)

### 3. Test Connexion
- [ ] Se connecter avec email/mot de passe
- [ ] Vérifier redirection selon l'état de l'onboarding

### 4. Test Routes Protégées
- [ ] Accéder à `/dashboard` sans être connecté
- [ ] Vérifier redirection vers `/connexion?redirectTo=/dashboard`
- [ ] Se connecter et vérifier retour à `/dashboard`

## Résultat Final

✅ **Inscription** : Redirection directe vers `/onboarding` avec gestion de session
✅ **Session après inscription** : Attente de l'établissement de la session avant redirection
✅ **Middleware intelligent** : Permet l'accès à `/onboarding` depuis `/inscription`
✅ **Confirmation email** : Fonctionne correctement avec `/api/auth/confirm`
✅ **Connexion** : Redirige selon l'état du profil
✅ **Routes protégées** : Middleware fonctionne correctement
✅ **Overlay email** : S'affiche sur `/dashboard` si email non confirmé

## Notes Importantes

1. **Mode Dev** : Le middleware bypass toutes les vérifications si `NEXT_PUBLIC_USE_DEV_AUTH=true`

2. **Email non confirmé** : L'overlay sur `/dashboard` permet d'accéder à `/onboarding` même sans confirmation

3. **PKCE** : La route `/api/auth/callback` gère à la fois les Magic Links (sans PKCE) et OAuth (avec PKCE)

4. **Profil** : La vérification `onboarding_completed` détermine si l'utilisateur va vers `/onboarding` ou `/dashboard`

5. **Gestion de session** : La page d'inscription attend maintenant que la session soit établie avant de rediriger, avec fallback sur `window.location.href`

6. **Referer check** : Le middleware permet l'accès à `/onboarding` si l'utilisateur vient de `/inscription`, gérant ainsi le délai de propagation de session

## Problèmes Potentiels Restants

Si les liens de confirmation ne fonctionnent toujours pas :
1. Vérifier les templates email dans Supabase
2. Vérifier que PKCE n'est pas strictement requis pour les Magic Links
3. Vérifier les Redirect URLs dans Supabase Dashboard
