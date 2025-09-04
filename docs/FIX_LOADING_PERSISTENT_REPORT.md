# 🔍 RAPPORT DE DIAGNOSTIC - Problème de chargement persistant

## Problème identifié
Les requêtes Supabase timeout, causant un chargement infini sur les pages utilisant `usePresence()` et `useRealtimeChat()`.

## Analyse du code

### Composants affectés
1. **MembersSidebar** (`components/chat/MembersSidebar.tsx`)
   - Utilise `usePresence()`
   - Affiche la liste des membres en ligne/hors ligne

2. **ChatRoom** (`components/chat/ChatRoom.tsx`)
   - Utilise `useRealtimeChat()`
   - Gère les messages et réactions

### Hook usePresence
Le hook a déjà :
- ✅ Gestion de timeout (5s par défaut, 10s global)
- ✅ Mode fallback avec données vides
- ✅ Logs de debug détaillés
- ✅ Support du mode dev avec données mockées

## Solutions implémentées

### 1. Page de test isolée (`/test-db`)
- Test de connexion utilisateur
- Test de requêtes simples
- Vérification des colonnes de présence
- Test de performance
- Résultats visuels avec indicateurs de succès/échec

### 2. Script SQL de vérification
Fichier : `scripts/check-and-fix-presence-columns.sql`
- Vérifie l'existence des colonnes nécessaires
- Ajoute les colonnes manquantes
- Crée des index pour améliorer les performances
- Teste les requêtes

### 3. Optimisations dans usePresence
Le hook contient déjà :
- Timeout de 3s pour les requêtes
- Fallback avec tableau vide en cas d'échec
- Limite de 50 profils maximum
- Requête allégée en cas d'échec (20 profils, colonnes minimales)

## Actions à effectuer

### Pour l'utilisateur :

1. **Exécuter le script SQL dans Supabase**
   ```sql
   -- Copier le contenu de scripts/check-and-fix-presence-columns.sql
   -- L'exécuter dans Supabase SQL Editor
   ```

2. **Tester la page de diagnostic**
   - Aller sur `/test-db`
   - Cliquer sur "Lancer les tests"
   - Vérifier les résultats

3. **Vérifier les logs dans la console**
   - Ouvrir la console du navigateur
   - Naviguer vers `/chat` ou `/membres`
   - Observer les logs avec 🔍 DEBUG

## Diagnostic des résultats

### ✅ Si tout fonctionne :
- Test 1 (User) : ✅ Connecté
- Test 2 (Profiles) : ✅ Succès, temps < 500ms
- Test 3 (Columns) : ✅ Toutes les colonnes existent
- Test 4 (Presence Query) : ✅ Succès
- Test 5 (Performance) : ✅ Temps moyen < 500ms

### ❌ Si problème persiste :

#### Problème 1 : Colonnes manquantes
**Symptôme** : Test 3 montre des colonnes manquantes
**Solution** : Exécuter le script SQL dans Supabase

#### Problème 2 : Requêtes lentes
**Symptôme** : Test 5 montre temps > 500ms
**Solutions possibles** :
- Vérifier la région Supabase (doit être proche)
- Vérifier les RLS policies (peuvent ralentir)
- Réduire la limite de profils récupérés

#### Problème 3 : Timeout constant
**Symptôme** : Erreur "Chargement trop long"
**Solutions possibles** :
- Problème de connexion réseau
- Firewall bloquant les WebSockets
- Session expirée (se reconnecter)

## Mode dégradé temporaire

Si le problème persiste, activer le mode dev temporairement :

1. Dans `.env.local` :
   ```
   NEXT_PUBLIC_USE_DEV_AUTH=true
   ```

2. Redémarrer l'application :
   ```bash
   npm run dev
   ```

Cela utilisera des données mockées sans requêtes Supabase.

## Logs utiles à surveiller

Dans la console du navigateur :

```
🔍 usePresence - Mounting
🔍 DEBUG: Début loadAllUsers
🔍 DEBUG: Récupération utilisateur courant...
🔍 DEBUG: Tentative requête profiles (timeout 3s)...
✅ X utilisateurs chargés
```

Si vous voyez :
- `⚠️ Timeout ou erreur` : Problème de connexion
- `❌ Erreur requête profiles` : Problème de permissions ou colonnes
- `Chargement trop long` : Timeout global atteint

## Prochaines étapes

1. Exécuter les tests de diagnostic
2. Appliquer le script SQL si nécessaire
3. Observer les logs pour identifier le point de blocage
4. Si le problème persiste, activer temporairement le mode dev
5. Contacter le support Supabase si les requêtes sont anormalement lentes

## État actuel

- ✅ Page de test créée (`/test-db`)
- ✅ Script SQL créé (`scripts/check-and-fix-presence-columns.sql`)
- ✅ Logs de debug déjà présents dans `usePresence`
- ✅ Timeout et fallback déjà implémentés
- ⏳ En attente des résultats de test de l'utilisateur
