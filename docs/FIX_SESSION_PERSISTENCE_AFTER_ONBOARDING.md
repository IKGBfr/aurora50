# 🔧 FIX: Session Persistence After Onboarding

## 📅 Date: 03/09/2025

## 🐛 Problème Identifié

Après l'onboarding, la session n'était pas reconnue correctement, causant une boucle de redirection:
- Cookie `sb-aurora50-auth-token` présent
- Session non reconnue dans l'API (`Auth session missing!`)
- Redirection loop: `/onboarding` → `/connexion?redirectTo=%2Fdashboard`

## 🔍 Cause Racine

1. **Problème de synchronisation des cookies**: Le middleware et l'API n'utilisaient pas la même méthode pour créer le client Supabase
2. **Session non rafraîchie**: Après l'onboarding, la session n'était pas rafraîchie avant la redirection
3. **Redirection soft vs hard**: `router.push()` ne forçait pas le rechargement complet nécessaire pour mettre à jour les cookies

## ✅ Solutions Appliquées

### 1. API Profile Ensure - Ajout de debug et correction

**Fichier**: `app/api/profile/ensure/route.ts`

```typescript
// Utilisation correcte de createServerClient avec cookieEncoding
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options!)
          })
        } catch (error) {
          console.error('[API Profile Ensure] Erreur setAll:', error)
        }
      },
    },
    cookieEncoding: 'base64url' // Important !
  }
)
```

### 2. Onboarding - Rafraîchissement de session et redirection hard

**Fichier**: `app/onboarding/page.tsx`

```typescript
// Rafraîchir la session avant la redirection
console.log('[Onboarding] Rafraîchissement de la session...')
const { data: { session }, error: sessionError } = await supabase.auth.getSession()

if (sessionError) {
  console.error('[Onboarding] Erreur lors du rafraîchissement de session:', sessionError)
} else {
  console.log('[Onboarding] Session rafraîchie:', session ? 'présente' : 'absente')
}

// Attendre un peu pour s'assurer que la DB est à jour
await new Promise(resolve => setTimeout(resolve, 1000))

// Utiliser window.location.href pour forcer un rechargement complet
// Cela garantit que le middleware et les cookies sont correctement mis à jour
console.log('[Onboarding] Redirection vers le dashboard avec rechargement complet')
window.location.href = '/dashboard'
```

## 📋 Points Clés

### Configuration cohérente du client Supabase

1. **Middleware** (`middleware.ts`):
   - Utilise `createServerClient` de `@supabase/ssr`
   - Configure `cookieEncoding: 'base64url'`

2. **API Routes** (`app/api/**/route.ts`):
   - Utilise `createServerClient` de `@supabase/ssr`
   - Configure `cookieEncoding: 'base64url'`
   - Gère correctement `cookies()` de Next.js

3. **Client Components** (`'use client'`):
   - Utilise `createClient` de `@/lib/supabase/client`
   - Pas de manipulation directe des cookies

### Bonnes pratiques pour la session

1. **Après modification du profil/auth**:
   ```typescript
   // Toujours rafraîchir la session
   await supabase.auth.getSession()
   ```

2. **Pour les redirections critiques**:
   ```typescript
   // Utiliser window.location.href pour forcer le rechargement
   window.location.href = '/dashboard'
   // Au lieu de router.push('/dashboard')
   ```

3. **Debug des cookies**:
   ```typescript
   const allCookies = cookieStore.getAll()
   console.log('Cookies disponibles:', 
     allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
   )
   ```

## 🧪 Tests à Effectuer

1. **Test de l'onboarding complet**:
   - Se connecter avec un nouveau compte
   - Compléter l'onboarding
   - Vérifier la redirection vers le dashboard
   - Vérifier que la session persiste

2. **Test de reconnexion**:
   - Se déconnecter
   - Se reconnecter
   - Vérifier que la session est reconnue

3. **Test des logs**:
   - Vérifier les logs dans la console du serveur
   - Chercher les messages `[API Profile Ensure]` et `[Onboarding]`

## 📝 Logs de Debug Ajoutés

### API Profile Ensure
- `[API Profile Ensure] Début de la requête`
- `[API Profile Ensure] Cookies disponibles: [...]`
- `[API Profile Ensure] Session: présente/absente`
- `[API Profile Ensure] User: {id} ou non trouvé`

### Onboarding
- `[Onboarding] Finalisation pour utilisateur: {userId}`
- `[Onboarding] Sauvegarde du nom: {fullName}`
- `[Onboarding] Profil mis à jour avec succès`
- `[Onboarding] Rafraîchissement de la session...`
- `[Onboarding] Session rafraîchie: présente/absente`
- `[Onboarding] Redirection vers le dashboard avec rechargement complet`

## 🎯 Résultat Attendu

Après ces corrections:
- ✅ La session persiste correctement après l'onboarding
- ✅ Pas de boucle de redirection
- ✅ Les cookies sont correctement synchronisés
- ✅ L'API reconnaît la session authentifiée
- ✅ Le dashboard se charge normalement après l'onboarding

## 🔄 Actions Supplémentaires si Nécessaire

Si les problèmes persistent:

1. **Vider complètement les cookies**:
   - Ouvrir les DevTools
   - Application > Storage > Cookies
   - Supprimer tous les cookies du domaine

2. **Redémarrer le serveur de développement**:
   ```bash
   npm run dev
   ```

3. **Vérifier les variables d'environnement**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Doivent être correctement définies

## 🚀 Commandes Utiles

```bash
# Redémarrer le serveur
npm run dev

# Voir les logs détaillés
npm run dev | grep -E "\[API Profile Ensure\]|\[Onboarding\]"

# Tester l'API directement
curl http://localhost:3000/api/profile/ensure -X GET
