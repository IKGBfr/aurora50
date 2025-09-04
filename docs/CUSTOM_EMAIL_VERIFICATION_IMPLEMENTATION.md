# 📧 Système de Vérification Email Custom - Aurora50

## Vue d'ensemble
Implémentation d'un système de vérification email 100% custom, indépendant de Supabase Auth, utilisant des tokens UUID stockés dans la table `profiles`.

## 🎯 Objectifs
- ✅ Système indépendant de Supabase Auth
- ✅ Tokens sécurisés avec UUID
- ✅ Stockage dans la table `profiles`
- ✅ Nettoyage automatique des tokens après vérification
- ✅ Compatible avec le flow d'inscription existant

## 📁 Fichiers modifiés

### 1. Migration SQL
**Fichier**: `scripts/add-email-verification-columns.sql`
- Ajoute 3 colonnes à la table `profiles`:
  - `email_verified` (BOOLEAN)
  - `email_verification_token` (TEXT)
  - `email_verified_at` (TIMESTAMPTZ)
- Crée un index sur `email_verification_token`

### 2. API de vérification
**Fichier**: `app/api/send-verification-email/route.ts`
- Génère un token UUID unique
- Stocke le token dans `profiles`
- Envoie l'email via Brevo avec le lien de confirmation

### 3. Page de confirmation
**Fichier**: `app/auth/confirm/page.tsx`
- Récupère le token depuis l'URL
- Vérifie le token dans la base de données
- Met à jour `email_verified = true`
- Supprime le token après vérification
- Redirige vers le dashboard

### 4. Dashboard
**Fichier**: `app/(lms)/dashboard/page.tsx`
- Vérifie `profiles.email_verified` au lieu de `user.email_confirmed_at`
- Affiche l'overlay si `onboarding_completed && !email_verified`
- Utilise l'API custom pour renvoyer les emails

## 🚀 Instructions de déploiement

### 1. Exécuter la migration SQL

#### Option A : Via Supabase Dashboard
1. Aller dans Supabase Dashboard > SQL Editor
2. Copier et exécuter le contenu de `scripts/add-email-verification-columns.sql`

#### Option B : Via script
```bash
cd scripts
npx tsx simple-email-verification-migration.ts
# Suivre les instructions affichées
```

### 2. Vérifier la migration
```sql
-- Vérifier que les colonnes existent
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('email_verified', 'email_verification_token', 'email_verified_at');
```

### 3. Tester le système
1. Créer un nouveau compte via `/inscription`
2. Vérifier que l'email est envoyé avec le token
3. Cliquer sur le lien de vérification
4. Vérifier que `email_verified = true` dans la base

## 🔄 Flow de vérification

```mermaid
graph TD
    A[Inscription] --> B[Génération UUID]
    B --> C[Stockage token dans profiles]
    C --> D[Envoi email via Brevo]
    D --> E[User clique sur lien]
    E --> F[/auth/confirm?token=xxx]
    F --> G[Vérification token]
    G --> H{Token valide?}
    H -->|Oui| I[email_verified = true]
    H -->|Non| J[Erreur affichée]
    I --> K[Suppression token]
    K --> L[Redirection dashboard]
```

## 🔒 Sécurité

- **Tokens uniques**: UUID v4 cryptographiquement sécurisés
- **Usage unique**: Token supprimé après vérification
- **Pas d'expiration**: Pour simplifier (peut être ajouté si nécessaire)
- **Index sur token**: Recherche rapide et sécurisée

## 📊 Structure de données

```typescript
interface ProfileWithVerification {
  // Colonnes existantes
  id: string
  email: string
  full_name: string
  // ...
  
  // Nouvelles colonnes
  email_verified: boolean
  email_verification_token: string | null
  email_verified_at: Date | null
}
```

## 🐛 Troubleshooting

### Erreur TypeScript sur les colonnes
Les nouvelles colonnes ne sont pas dans `database.types.ts`. Solution temporaire : utiliser `as any` pour les updates.

### Email non reçu
1. Vérifier les logs de l'API : `console.log` dans `/api/send-verification-email`
2. Vérifier la clé API Brevo dans `.env.local`
3. Vérifier les spams

### Token invalide
1. Vérifier que la migration SQL a été exécutée
2. Vérifier que le token est bien stocké après inscription
3. Vérifier l'URL de confirmation dans l'email

## ✅ Checklist de validation

- [ ] Migration SQL exécutée
- [ ] Colonnes visibles dans Supabase Dashboard
- [ ] Email envoyé avec token UUID
- [ ] Page de confirmation fonctionne
- [ ] Dashboard affiche l'overlay si non vérifié
- [ ] Renvoi d'email fonctionne
- [ ] Token supprimé après vérification

## 📝 Notes importantes

1. **Indépendance totale**: Ce système n'utilise PAS Supabase Auth pour la vérification
2. **Compatibilité**: Fonctionne avec le système d'authentification existant
3. **Flexibilité**: Peut être étendu avec expiration, limites de renvoi, etc.
4. **Performance**: Index sur token pour recherche rapide

## 🔮 Améliorations futures possibles

1. **Expiration des tokens**: Ajouter une colonne `token_expires_at`
2. **Limite de renvois**: Compteur pour éviter les abus
3. **Templates d'email**: Personnalisation selon la langue/préférences
4. **Logs d'audit**: Tracer les tentatives de vérification
5. **Webhook de confirmation**: Notifier d'autres services

## 📚 Références

- [UUID v4 en Node.js](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)
- [Brevo API Documentation](https://developers.brevo.com/docs)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
