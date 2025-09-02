# 🔄 Mise à jour temps réel de la liste des membres

## 📋 Vue d'ensemble

Cette documentation décrit l'implémentation de la mise à jour en temps réel de la liste des membres dans l'application Aurora50.

## ✅ Ce qui a été implémenté

### 1. **Script SQL pour activer Realtime**
- Fichier : `scripts/enable-profiles-realtime.sql`
- Active Supabase Realtime sur la table `profiles`
- Permet d'écouter les événements INSERT, UPDATE et DELETE

### 2. **Hook usePresence amélioré**
- Fichier : `lib/hooks/usePresence.ts`
- Ajout d'un canal `profiles-changes` pour écouter les changements
- Gestion automatique des mises à jour :
  - **INSERT** : Ajoute automatiquement les nouveaux membres
  - **UPDATE** : Met à jour les informations (nom, avatar, statut)
  - **DELETE** : Retire les membres supprimés

### 3. **Composant MembersSidebar**
- Fichier : `components/chat/MembersSidebar.tsx`
- Utilise le hook `usePresence` pour afficher la liste
- Se met à jour automatiquement grâce aux changements temps réel

## 🚀 Comment activer la fonctionnalité

### Étape 1 : Activer Realtime dans Supabase

1. Aller dans le dashboard Supabase
2. Ouvrir le SQL Editor
3. Exécuter le script :

```sql
-- Activer Realtime pour la table profiles
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Vérifier que c'est activé
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Étape 2 : Vérifier dans l'interface Supabase

1. Aller dans **Database → Replication**
2. Vérifier que `profiles` apparaît dans la liste
3. Si non visible, l'activer via l'interface

## 🎯 Fonctionnalités

### Mises à jour automatiques
- ✅ Nouveau membre s'inscrit → apparaît instantanément
- ✅ Membre change son nom → mise à jour immédiate
- ✅ Membre change son avatar → mise à jour immédiate
- ✅ Membre change son statut → mise à jour immédiate
- ✅ Membre supprimé → disparaît de la liste

### Mode Dev
- En mode dev (`NEXT_PUBLIC_USE_DEV_AUTH=true`), des données mockées sont utilisées
- Simulation de changements de présence toutes les 15 secondes
- Pas de connexion Supabase requise

### Mode Production
- Connexion Realtime avec Supabase
- Deux canaux actifs :
  - `online-users` : Gère la présence en ligne/hors ligne
  - `profiles-changes` : Gère les changements de profils

## 🔍 Debug et logs

Le hook inclut des logs pour faciliter le debug :

```javascript
console.log('📊 Changement détecté sur profiles:', payload);
```

Ces logs apparaissent dans la console du navigateur lors de changements.

## 🛠️ Troubleshooting

### La liste ne se met pas à jour
1. Vérifier que Realtime est activé sur la table `profiles`
2. Vérifier les logs dans la console du navigateur
3. Vérifier la connexion WebSocket dans l'onglet Network

### Erreur de connexion Realtime
1. Vérifier les clés Supabase dans `.env.local`
2. Vérifier que le projet Supabase est actif
3. Vérifier les quotas Realtime du plan Supabase

### Alternative : Polling
Si Realtime pose problème, une alternative simple est d'implémenter un polling :

```typescript
useEffect(() => {
  loadMembers(); // Charge initial
  
  // Recharger toutes les 30 secondes
  const interval = setInterval(() => {
    loadMembers();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

## 📊 Performance

- Les changements sont appliqués de manière incrémentale
- Pas de rechargement complet de la liste à chaque changement
- L'utilisateur courant est exclu de la liste pour éviter la duplication
- Tri alphabétique automatique des membres

## 🔒 Sécurité

- Les politiques RLS existantes s'appliquent toujours
- Seuls les utilisateurs authentifiés peuvent voir les changements
- Les données sensibles ne sont pas exposées via Realtime

## 📝 Notes importantes

1. **Cleanup automatique** : Les canaux sont correctement fermés lors du démontage du composant
2. **Gestion d'erreurs** : En cas d'erreur, les données mockées sont utilisées comme fallback
3. **Optimisation** : Les mises à jour sont optimisées pour éviter les re-renders inutiles
