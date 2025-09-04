# 🔧 FIX: Cookie Encoding Issue in Middleware

## 📅 Date: 03/09/2025

## 🐛 Problème Identifié

Le middleware tentait de décoder manuellement les cookies d'authentification Supabase, ce qui causait des problèmes de session et des timeouts lors des requêtes à la base de données.

### Symptômes:
- Chargement infini sur les pages utilisant le système de présence
- Timeouts sur les requêtes Supabase
- Cookie `sb-aurora50-auth-token` avec un préfixe `base64-` qui empêchait Supabase de le lire correctement
- Erreurs de type TypeScript après simplification du client

## 🔍 Cause Racine

Le middleware utilisait une fonction `updateSession` personnalisée qui tentait de décoder manuellement les cookies. Supabase gère déjà automatiquement l'encodage/décodage des cookies avec l'option `cookieEncoding: 'base64url'`.

## ✅ Solution Appliquée

### 1. Remplacement du middleware.ts

**Avant (incorrect):**
```typescript
// Utilisation d'une fonction updateSession personnalisée
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Code de décodage manuel des cookies
  const authCookie = request.cookies.get('sb-aurora50-auth-token');
  // ... tentative de décodage manuel ...
  
  const { supabaseResponse, user } = await updateSession(request)
  // ...
}
```

**Après (correct):**
```typescript
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Gestion standard des cookies
        },
      },
      // IMPORTANT: Laisser Supabase gérer l'encodage
      cookieEncoding: 'base64url'
    }
  )
  
  // Supabase décode automatiquement les cookies
  const { data: { user } } = await supabase.auth.getUser()
  // ...
}
```

### 2. Points Clés de la Solution

1. **Pas de décodage manuel**: Supabase gère automatiquement l'encodage/décodage avec `cookieEncoding: 'base64url'`
2. **Utilisation directe de createServerClient**: Pas besoin de wrapper personnalisé
3. **Gestion standard des cookies**: Utilisation des méthodes `getAll()` et `setAll()` fournies par Next.js

## 📋 Fichiers Modifiés

- `middleware.ts` - Remplacé complètement avec la version correcte
- `scripts/check-and-fix-presence-columns.sql` - Script SQL pour vérifier/corriger les colonnes de présence

## 🧪 Tests à Effectuer

1. **Vider le cache et les cookies du navigateur** (ou utiliser une fenêtre incognito)
2. **Redémarrer le serveur de développement**: `npm run dev`
3. **Tester la connexion**:
   - Se connecter avec un compte existant
   - Vérifier que les pages se chargent sans timeout
   - Vérifier que le système de présence fonctionne

## 🔄 Actions Supplémentaires Recommandées

Si les problèmes persistent après cette correction:

1. **Exécuter le script SQL** dans Supabase SQL Editor:
   ```bash
   scripts/check-and-fix-presence-columns.sql
   ```

2. **Utiliser la page de test** pour diagnostiquer:
   ```
   http://localhost:3000/test-db
   ```

3. **Vérifier les logs** dans la console du navigateur et du serveur

## 📝 Notes Importantes

- **Ne jamais décoder manuellement** les cookies Supabase
- **Toujours utiliser** `cookieEncoding: 'base64url'` dans la configuration
- **Laisser Supabase** gérer complètement l'encodage/décodage des cookies
- Cette correction résout également les problèmes de TypeScript liés à la simplification du client

## 🎯 Résultat Attendu

Après cette correction:
- ✅ Plus de timeouts sur les requêtes Supabase
- ✅ Chargement normal des pages
- ✅ Système de présence fonctionnel
- ✅ Sessions persistantes et stables
- ✅ Authentification fonctionnelle
