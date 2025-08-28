# 🔐 Système d'Authentification Magic Link - Aurora50

## Vue d'ensemble

Le système d'authentification Aurora50 utilise des **Magic Links** (liens magiques) via Supabase pour offrir une expérience de connexion simple et sécurisée, sans mot de passe. Ce système respecte la philosophie "cocon digital" avec une interface bienveillante dans la voix de Sigrid Larsen.

## 🎯 Fonctionnalités implémentées

### ✅ Configuration Supabase
- **Client Browser** (`lib/supabase/client.ts`) : Pour les composants côté client
- **Client Server** (`lib/supabase/server.ts`) : Pour les Server Components et Route Handlers
- **Middleware Helper** (`lib/supabase/middleware.ts`) : Pour la gestion des sessions

### ✅ Page de Connexion Magic Link
- **Localisation** : `/app/connexion/page.tsx`
- **Design** : Dégradé signature Aurora50 (vert → violet → rose)
- **Fonctionnalités** :
  - Champ unique pour l'email
  - Envoi du lien magique
  - Messages personnalisés dans la voix de Sigrid
  - Gestion gracieuse des erreurs

### ✅ AuthProvider Context
- **Localisation** : `/components/providers/AuthProvider.tsx`
- **Hook** : `useAuth()` pour accéder à :
  - `user` : Utilisateur connecté
  - `loading` : État de chargement
  - `signOut()` : Fonction de déconnexion
- **Fonctionnalités** :
  - Gestion globale de l'état d'authentification
  - Refresh automatique des sessions
  - Redirections automatiques après connexion/déconnexion

### ✅ Middleware de Protection
- **Localisation** : `/middleware.ts`
- **Routes protégées** :
  - `/dashboard`
  - `/cours` (sauf `/cours/guide-demarrage`)
  - `/chat`
  - `/messages`
  - `/membres`
  - `/profil`
- **Routes publiques** :
  - `/` (Accueil)
  - `/connexion`
  - `/charte`
  - `/cours/guide-demarrage`
  - `/programme`
  - `/sigrid-larsen`
  - `/merci`

### ✅ UserMenu Component
- **Localisation** : `/components/layout/UserMenu.tsx`
- **Fonctionnalités** :
  - Avatar avec initiales ou photo
  - Menu dropdown avec :
    - Mon profil 🌱
    - Mes paramètres ⚙️
    - Me déconnecter 🚪
  - Design cohérent Aurora50

### ✅ Route API Callback
- **Localisation** : `/app/api/auth/callback/route.ts`
- **Fonction** : Gère le retour du Magic Link et établit la session

## 🔄 Flow Utilisateur

1. **Tentative d'accès à une route protégée**
   - L'utilisateur essaie d'accéder à `/dashboard`
   - Le middleware détecte l'absence de session
   - Redirection vers `/connexion?redirectTo=/dashboard`

2. **Page de connexion**
   - L'utilisateur entre son email
   - Clique sur "Recevoir mon lien de connexion"
   - Message de succès : "✨ C'est parti ! Votre lien magique vient d'être envoyé"

3. **Réception du Magic Link**
   - L'utilisateur reçoit un email avec le lien
   - Clique sur le lien

4. **Callback et authentification**
   - Le lien redirige vers `/api/auth/callback`
   - La session est établie
   - Redirection vers `/dashboard` (ou la page initialement demandée)

5. **Session active**
   - L'utilisateur peut naviguer dans tout le LMS
   - Le UserMenu affiche ses informations
   - Session persistée pendant 7 jours

## 🛠️ Configuration Supabase

### Prérequis dans Supabase Dashboard

1. **Email Provider activé** dans Authentication → Providers
2. **Confirmation email désactivée** pour connexion instantanée
3. **URL de redirection** configurée : `http://localhost:3000/api/auth/callback`

### Variables d'environnement requises

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 Messages personnalisés (Voix de Sigrid)

- **Email envoyé** : "✨ C'est parti ! Votre lien magique vient d'être envoyé. Vérifiez votre boîte mail !"
- **Email non trouvé** : "Hmm, cet email ne fait pas encore partie de notre communauté Aurora50. Avez-vous bien finalisé votre inscription ? 🌿"
- **Erreur générique** : "Oh, un petit souci technique ! Réessayons ensemble 🌿"
- **Session expirée** : "Pour votre sécurité, reconnectons-nous 🔒"
- **Déconnexion** : "À très vite dans votre espace Aurora50 ! 🌸"

## 🧪 Page de Test

Une page de test est disponible à `/test-auth` pour :
- Vérifier l'état de connexion
- Tester les redirections
- Voir les détails de la session
- Se déconnecter

## 🔒 Sécurité

- **Tokens JWT** : Gérés automatiquement par Supabase
- **Refresh automatique** : Les tokens sont rafraîchis via le middleware
- **RLS (Row Level Security)** : Les politiques Supabase protègent les données
- **Service Role Key** : Utilisée uniquement côté serveur, jamais exposée au client
- **Sessions sécurisées** : Stockées dans des cookies httpOnly

## 🚀 Utilisation dans les composants

### Dans un Client Component

```typescript
'use client'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Chargement...</div>
  if (!user) return <div>Non connecté</div>
  
  return (
    <div>
      Bienvenue {user.email}!
      <button onClick={signOut}>Se déconnecter</button>
    </div>
  )
}
```

### Dans un Server Component

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Non connecté</div>
  }
  
  return <div>Bienvenue {user.email}!</div>
}
```

## 📱 Responsive Design

- Interface mobile-first
- Formulaires adaptés aux petits écrans
- UserMenu optimisé pour le tactile
- Messages lisibles sur tous les appareils

## ♿ Accessibilité

- Labels ARIA appropriés
- Navigation au clavier complète
- Focus visible sur tous les éléments interactifs
- Messages d'erreur explicites
- Contraste des couleurs conforme WCAG

## 🎨 Design System Aurora50

- **Couleurs principales** :
  - Vert : #10B981
  - Violet : #8B5CF6
  - Rose : #EC4899
- **Coins arrondis** : 20px (style "cocon")
- **Ombres douces** : Pour créer de la profondeur
- **Animations subtiles** : Transitions fluides

## 📊 Monitoring

Pour surveiller l'authentification :
1. Vérifier les logs Supabase dans le dashboard
2. Utiliser la page `/test-auth` pour diagnostiquer
3. Consulter la console du navigateur pour les erreurs

## 🔄 Prochaines étapes possibles

- [ ] Ajouter la double authentification (2FA)
- [ ] Implémenter "Se souvenir de moi"
- [ ] Ajouter des notifications par email personnalisées
- [ ] Créer un système de rôles (admin, membre, etc.)
- [ ] Ajouter des analytics sur les connexions
- [ ] Implémenter un système de récupération de compte

## 🆘 Dépannage

### L'email n'est pas envoyé
- Vérifier la configuration SMTP dans Supabase
- S'assurer que l'email est dans la base de données
- Vérifier les logs Supabase

### La session expire trop vite
- Ajuster les paramètres de session dans Supabase
- Vérifier le refresh token dans le middleware

### Redirection infinie
- Vérifier la configuration du middleware
- S'assurer que les routes publiques sont bien définies

---

*Système d'authentification conçu avec amour pour la communauté Aurora50 🌸*
