# 🌿 Aurora50 - Intégration Webhook Stripe + Supabase

## 📋 Vue d'ensemble

Ce système crée automatiquement un utilisateur dans Supabase après un paiement réussi via Stripe, et lui envoie un Magic Link pour se connecter.

## 🔄 Flux complet

1. **Client** → Clique sur le Payment Link Stripe
2. **Stripe** → Traite le paiement
3. **Stripe** → Envoie un webhook `checkout.session.completed`
4. **Webhook** → Crée l'utilisateur dans Supabase Auth
5. **Webhook** → Crée/met à jour le profil dans la table `profiles`
6. **Webhook** → Génère un Magic Link
7. **Webhook** → Envoie l'email de bienvenue via Brevo
8. **Client** → Reçoit 2 emails : bienvenue + Magic Link

## 🔧 Configuration

### Variables d'environnement requises

```env
# Supabase (publiques)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase (privée - CRITIQUE)
SUPABASE_SERVICE_ROLE_KEY=eyJ... # ⚠️ Ne jamais exposer côté client

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Différent pour test et prod
STRIPE_PAYMENT_LINK_ID=plink_... # ID du Payment Link

# URL de base (pour les redirections)
NEXT_PUBLIC_BASE_URL=https://aurora50.fr # ou votre domaine Vercel

# Optionnel - pour la page de test
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_TEST_URL=https://buy.stripe.com/test/...
```

### Configuration Stripe

#### Mode TEST
1. Dashboard Stripe → **Mode TEST activé**
2. Developers → Webhooks → **Add endpoint**
3. URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
4. Events : Sélectionner `checkout.session.completed`
5. Copier le **Webhook Secret** → `STRIPE_WEBHOOK_SECRET`

#### Mode PRODUCTION
1. Dashboard Stripe → **Mode LIVE**
2. Même processus mais avec l'URL de production
3. ⚠️ Le webhook secret sera différent !

### Configuration Vercel

1. Settings → Environment Variables
2. Ajouter toutes les variables ci-dessus
3. **IMPORTANT** : `SUPABASE_SERVICE_ROLE_KEY` doit être présent

## 📊 Structure de la base de données

### Table `profiles`

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Politiques RLS

- `Users can view own profile` : Les utilisateurs peuvent voir leur profil
- `Users can update own profile` : Les utilisateurs peuvent modifier leur profil

## 🧪 Tests

### 1. Test local avec ngrok (optionnel)

```bash
# Installer ngrok
brew install ngrok # ou télécharger depuis ngrok.com

# Lancer votre app
npm run dev

# Dans un autre terminal
ngrok http 3000

# Utiliser l'URL ngrok dans Stripe
```

### 2. Test sur Vercel (recommandé)

1. Déployer sur Vercel : `vercel --prod`
2. Configurer le webhook dans Stripe avec l'URL Vercel
3. Aller sur `/test-stripe`
4. Cliquer sur "Tester le paiement"
5. Utiliser la carte test : `4242 4242 4242 4242`

### 3. Vérifications

✅ **Dans Stripe Dashboard**
- Payments → Voir le paiement réussi
- Webhooks → Voir l'événement envoyé (status 200)

✅ **Dans Supabase Dashboard**
- Authentication → Users → Nouvel utilisateur créé
- Table Editor → profiles → Nouveau profil créé

✅ **Dans les emails**
- Email de bienvenue reçu (via Brevo)
- Magic Link reçu (via Supabase/Brevo SMTP)

## 🐛 Debugging

### Logs du webhook

Les logs sont très détaillés avec des emojis pour faciliter le suivi :

- 🔍 Webhook appelé
- ✅ Signature vérifiée
- 💳 Session de paiement complétée
- 👤 Création de l'utilisateur
- ✅ Utilisateur créé dans Auth
- 🔗 Génération du Magic Link
- 📧 Envoi de l'email

### Erreurs communes

1. **"Stripe configuration missing"**
   - Vérifier `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`

2. **"Webhook signature verification failed"**
   - Le secret ne correspond pas (test vs prod ?)
   - Vérifier que c'est le bon endpoint

3. **"User already registered"**
   - Normal si l'utilisateur existe déjà
   - Le système met à jour les metadata

4. **Pas de Magic Link reçu**
   - Vérifier la configuration SMTP dans Supabase
   - Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est configuré

## 🚀 Mise en production

1. **Stripe** : Passer en mode LIVE
2. **Variables** : Mettre à jour avec les clés de production
3. **Webhook** : Créer un nouveau webhook pour la prod
4. **Tests** : Faire un vrai paiement à 1€ pour tester
5. **Monitoring** : Activer les alertes Stripe

## 📝 Notes importantes

- Le `SUPABASE_SERVICE_ROLE_KEY` ne doit JAMAIS être exposé côté client
- Les webhook secrets sont différents entre TEST et PRODUCTION
- Le Magic Link est envoyé automatiquement par Supabase via votre SMTP
- L'email de bienvenue est envoyé via Brevo directement

## 🔗 Ressources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
