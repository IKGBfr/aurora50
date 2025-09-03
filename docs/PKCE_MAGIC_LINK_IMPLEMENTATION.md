# Implémentation PKCE avec Magic Link - Documentation

## Date : 03/09/2025

## Contexte

Supabase a activé PKCE (Proof Key for Code Exchange) pour améliorer la sécurité de l'authentification. Cela causait l'erreur :
```
400: invalid request: both auth code and code verifier should be non-empty
```

## Compréhension du problème

### Comment fonctionne PKCE avec Magic Link

1. **Flow OAuth standard avec PKCE :**
   - Le client génère un `code_verifier` et un `code_challenge`
   - Le `code_challenge` est envoyé lors de l'autorisation
   - Le `code_verifier` est gardé côté client
   - Lors de l'échange du code, le client envoie le `code_verifier`

2. **Flow Magic Link avec PKCE (Supabase) :**
   - Supabase gère PKCE **en interne** pour les Magic Links
   - Le `code_verifier` n'est PAS transmis dans l'URL du callback
   - Supabase stocke le `code_verifier` dans les cookies lors de l'initiation
   - La méthode `exchangeCodeForSession` récupère automatiquement le `code_verifier` depuis les cookies

## Solution implémentée

### Route `/api/auth/callback/route.ts`

```typescript
// Appel simple - Supabase gère PKCE en interne
const exchangeResult = await supabase.auth.exchangeCodeForSession(code)
```

**Points clés :**
- Pas besoin de passer manuellement le `code_verifier`
- Supabase le récupère automatiquement depuis les cookies
- La méthode `exchangeCodeForSession` n'accepte qu'un seul paramètre : le `code`

### Logs ajoutés pour le débogage

```typescript
console.log('Auth callback received params:', {
  code: code ? 'present' : 'absent',
  codeVerifier: codeVerifier ? 'present' : 'absent',
  error,
  errorCode,
  errorDescription,
  allParams: Object.fromEntries(requestUrl.searchParams.entries())
})
```

Ces logs permettent de vérifier :
- Si un `code` est bien reçu
- Si un `code_verifier` est présent dans l'URL (ne devrait pas l'être avec Magic Link)
- Tous les paramètres reçus pour le débogage

## Configuration Supabase requise

### 1. Dashboard Supabase > Authentication > URL Configuration

```
Site URL: http://localhost:3000 (ou votre URL de production)
Redirect URLs: 
  - http://localhost:3000/api/auth/callback
  - http://localhost:3000/auth/confirm
```

### 2. Dashboard Supabase > Authentication > Providers > Email

- **Enable Email Provider** : ✅ Activé
- **Confirm Email** : ✅ Activé (recommandé)
- **PKCE** : ✅ Activé (pour la sécurité)

### 3. Email Templates

Vérifier que le template utilise `{{ .ConfirmationURL }}` et non une URL personnalisée.

## Flux d'authentification complet

### 1. Inscription/Connexion (`/connexion` ou `/inscription`)

```typescript
await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/api/auth/callback`,
  },
})
```

### 2. Email envoyé par Supabase

L'email contient un lien du type :
```
https://your-project.supabase.co/auth/v1/verify?
  token=xxx&
  type=magiclink&
  redirect_to=http://localhost:3000/api/auth/callback
```

### 3. Clic sur le lien

Supabase vérifie le token et redirige vers :
```
http://localhost:3000/api/auth/callback?
  code=xxx
```

Note : Le `code_verifier` n'est PAS dans l'URL car Supabase le gère via les cookies.

### 4. Route callback (`/api/auth/callback`)

- Récupère le `code` depuis l'URL
- Appelle `exchangeCodeForSession(code)`
- Supabase récupère automatiquement le `code_verifier` depuis les cookies
- Si succès → redirection vers `/dashboard`
- Si échec → redirection vers `/connexion` avec message d'erreur

## Gestion des erreurs

### Erreurs courantes et solutions

1. **"both auth code and code verifier should be non-empty"**
   - **Cause** : Le serveur Supabase attend un `code_verifier` mais ne le reçoit pas
   - **Solution** : S'assurer que les cookies sont bien transmis avec la requête

2. **"otp_expired"**
   - **Cause** : Le lien a expiré (durée par défaut : 1 heure)
   - **Solution** : Message clair à l'utilisateur pour demander un nouveau lien

3. **"access_denied"**
   - **Cause** : L'utilisateur a annulé ou le token est invalide
   - **Solution** : Redirection vers la page de connexion

## Tests recommandés

### 1. Test de connexion normale
```bash
# 1. Aller sur /connexion
# 2. Entrer un email valide
# 3. Recevoir l'email
# 4. Cliquer sur le lien dans les 60 minutes
# ✅ Devrait rediriger vers /dashboard
```

### 2. Test avec lien expiré
```bash
# 1. Utiliser un lien de plus d'1 heure
# ✅ Devrait afficher "Le lien de connexion a expiré"
```

### 3. Vérifier les logs
```bash
# Dans la console du navigateur ou les logs serveur
# Vérifier que :
# - "code: present" apparaît
# - "codeVerifier: absent" apparaît (normal pour Magic Link)
# - "Session exchange successful" apparaît si succès
```

## Différences avec l'OAuth classique

| Aspect | OAuth avec PKCE | Magic Link avec PKCE |
|--------|-----------------|---------------------|
| `code_verifier` généré par | Client | Supabase |
| `code_verifier` stocké dans | Mémoire client | Cookies Supabase |
| `code_verifier` transmis via | Paramètre explicite | Cookies automatiques |
| Gestion manuelle requise | Oui | Non |

## Points importants à retenir

1. **Ne PAS essayer de passer manuellement le `code_verifier`** avec Magic Link
2. **Les cookies doivent être activés** dans le navigateur
3. **Le middleware Next.js doit permettre les cookies** (déjà configuré dans `lib/supabase/server.ts`)
4. **PKCE reste activé** pour la sécurité, mais est géré automatiquement

## Conclusion

L'implémentation PKCE avec Magic Link dans Supabase est **transparente** pour le développeur. La clé est de comprendre que Supabase gère le `code_verifier` en interne via les cookies, contrairement à un flow OAuth classique où le client doit le gérer manuellement.

La route callback reste simple et n'a besoin que d'appeler `exchangeCodeForSession(code)` sans paramètres supplémentaires.
