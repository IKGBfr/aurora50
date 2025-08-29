# 📚 Guide de Configuration des Données de Test Aurora50

## 🎯 Objectif
Créer des données de test réalistes dans Supabase pour l'utilisateur `altoweb.fr@gmail.com` afin de tester l'application en conditions réelles.

## ✅ État Actuel

### Fichiers Créés
- ✅ `scripts/create-tables.sql` - Script SQL pour créer les tables
- ✅ `scripts/test-data.ts` - Données de test pour Marie Dupont
- ✅ `scripts/seed-test-user.ts` - Script pour peupler la base
- ✅ `scripts/clean-test-user.ts` - Script pour nettoyer les données
- ✅ Scripts npm ajoutés dans `package.json`

## 📋 Étapes à Suivre

### 1️⃣ Créer les Tables dans Supabase

1. **Ouvrir le Dashboard Supabase**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet Aurora50

2. **Exécuter le Script SQL**
   - Cliquer sur "SQL Editor" dans le menu de gauche
   - Créer une nouvelle requête
   - Copier tout le contenu de `scripts/create-tables.sql`
   - Cliquer sur "Run" pour exécuter
   - Vérifier que les 5 tables sont créées :
     - `user_stats`
     - `user_achievements`
     - `user_activities`
     - `user_courses`
     - `user_progress_history`

### 2️⃣ Configurer la Service Role Key

1. **Récupérer la clé**
   - Dans Supabase Dashboard → Settings → API
   - Copier la "service_role key" (⚠️ CONFIDENTIELLE)

2. **Ajouter dans `.env.local`**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
   ```

### 3️⃣ Créer l'Utilisateur de Test

1. **S'assurer que l'utilisateur existe**
   - L'email `altoweb.fr@gmail.com` doit être inscrit dans Auth
   - Si pas encore fait, s'inscrire via la page `/connexion`

### 4️⃣ Peupler les Données de Test

```bash
# Installer les dépendances (déjà fait)
npm install

# Exécuter le script de seed
npm run seed:test
```

**Ce que fait le script :**
- ✅ Met à jour le profil de Marie Dupont
- ✅ Crée ses statistiques (niveau 8, 1250 points)
- ✅ Ajoute 3 badges débloqués
- ✅ Enregistre 8 activités récentes
- ✅ Inscrit à 3 cours
- ✅ Génère 30 jours d'historique de progression

### 5️⃣ Vérifier les Données

1. **Dans Supabase Dashboard**
   - Table Editor → Vérifier chaque table
   - Les données de Marie Dupont doivent apparaître

2. **Dans l'Application**
   - Se connecter avec `altoweb.fr@gmail.com`
   - Naviguer vers `/profil/marie-dupont`
   - Vérifier que toutes les données s'affichent

### 6️⃣ Nettoyer les Données (si nécessaire)

```bash
# Pour supprimer toutes les données de test
npm run seed:clean
```

## 🔧 Dépannage

### Erreur "Permission denied"
- Vérifier que la service_role_key est correcte
- S'assurer que les RLS policies sont bien créées

### Erreur "User not found"
- Vérifier que l'utilisateur `altoweb.fr@gmail.com` existe dans Auth
- Se connecter une fois via magic link pour créer le profil

### Les données ne s'affichent pas
- Vérifier que les tables sont bien créées
- Contrôler les logs du script de seed
- Vérifier les RLS policies dans Supabase

## 🎨 Personnalisation

Pour modifier les données de test, éditer `scripts/test-data.ts` :
- Changer le niveau, les points, la série
- Ajouter/modifier les badges
- Personnaliser les activités
- Ajuster les cours suivis

## 🚀 Prochaines Étapes

Une fois les données en place :

1. **Adapter les Pages**
   - `/profil/[username]/page.tsx` - Utiliser les vraies tables
   - `/dashboard/page.tsx` - Afficher les vraies stats
   - Autres pages nécessitant les données utilisateur

2. **Tester les Fonctionnalités**
   - Navigation entre les profils
   - Affichage des statistiques
   - Graphiques de progression
   - Liste des activités

## 📝 Notes Importantes

- **Mode Dev Local** : Le bypass auth reste actif avec `NEXT_PUBLIC_USE_DEV_AUTH=true`
- **Données Réelles** : Les scripts créent de vraies données dans Supabase
- **Sécurité** : Ne jamais commiter la service_role_key
- **Production** : Ces données sont pour les tests, pas pour la production

## ✨ Résumé

Vous avez maintenant :
- 🔐 Un système de bypass auth pour le développement local
- 📊 Des scripts pour créer des données de test réalistes
- 🧹 Un moyen de nettoyer facilement les données
- 📚 Une documentation complète du processus

Prochaine action : **Exécuter le script SQL dans Supabase Dashboard** pour créer les tables !
