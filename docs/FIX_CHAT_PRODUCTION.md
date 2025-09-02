# 🔧 Guide de résolution - Chat en production

## Problème
Le chat fonctionne en mode développement mais affiche "❌ Erreur: Erreur lors du chargement" en production.

## Solution étape par étape

### 1. Exécuter le script SQL dans Supabase

1. **Ouvrez votre dashboard Supabase** : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. **Créez une nouvelle requête** (bouton "New query")
5. **Copiez-collez le contenu** du fichier `/scripts/setup-chat-tables.sql`
6. **Cliquez sur "Run"** pour exécuter le script

Le script va :
- ✅ Créer la table `chat_messages`
- ✅ Créer la table `profiles` (si elle n'existe pas)
- ✅ Créer la table `presence`
- ✅ Configurer les policies RLS
- ✅ Activer Realtime
- ✅ Créer les triggers et fonctions nécessaires

### 2. Vérifier dans la console du navigateur

Avec les améliorations apportées, ouvrez la console du navigateur (F12) et regardez les messages :
- 🔄 Chargement des messages...
- ✅ Utilisateur connecté: [email]
- ❌ Erreur spécifique avec détails

### 3. Diagnostics possibles

#### Erreur : "La table chat_messages n'existe pas"
→ **Solution** : Exécutez le script SQL (étape 1)

#### Erreur : "Permissions insuffisantes"
→ **Solution** : Les policies RLS ne sont pas configurées. Le script SQL devrait les créer.

#### Erreur : "Vous devez être connecté"
→ **Solution** : Assurez-vous d'être bien connecté avec votre compte

### 4. Vérifier la configuration

Dans `.env.local`, assurez-vous que :
```env
NEXT_PUBLIC_USE_DEV_AUTH=false
```

### 5. Tester après correction

1. Rafraîchissez la page
2. Allez sur http://localhost:3000/chat
3. Vous devriez voir :
   - Le chat à gauche
   - La liste des membres à droite
   - Possibilité d'envoyer des messages

### 6. Si le problème persiste

Vérifiez dans Supabase :

#### Table Editor
1. Allez dans **Table Editor**
2. Vérifiez que les tables existent :
   - `chat_messages`
   - `profiles`
   - `presence`

#### Authentication > Policies
1. Allez dans **Authentication > Policies**
2. Vérifiez que les policies sont actives pour chaque table

#### Realtime
1. Allez dans **Database > Replication**
2. Vérifiez que `chat_messages` et `presence` sont dans la liste

### 7. Message de test

Une fois tout configuré, vous pouvez créer un message de test directement dans Supabase :

```sql
INSERT INTO public.chat_messages (user_id, content)
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Premier message de test Aurora50! 🌿'
);
```

## Résumé des actions

✅ **Script SQL exécuté** : `/scripts/setup-chat-tables.sql`
✅ **Logs améliorés** : Plus de détails dans la console
✅ **Mode production activé** : `NEXT_PUBLIC_USE_DEV_AUTH=false`

## Support

Si vous avez toujours des problèmes après ces étapes :
1. Vérifiez les logs dans la console du navigateur
2. L'erreur sera maintenant plus précise et indiquera exactement ce qui manque
3. Partagez le message d'erreur exact pour un diagnostic plus précis

---

💡 **Note** : Le mode développement (`NEXT_PUBLIC_USE_DEV_AUTH=true`) utilise des données mockées et n'a pas besoin de Supabase. Le mode production nécessite que toutes les tables et policies soient correctement configurées dans Supabase.
