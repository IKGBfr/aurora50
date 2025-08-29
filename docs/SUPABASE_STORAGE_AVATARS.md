# Configuration Supabase Storage - Avatars

## ✅ Configuration Complétée sur le projet Aurora50

Le bucket de stockage pour les avatars des utilisateurs d'Aurora50 a été configuré avec succès sur le projet Supabase Aurora50 (suxhtdqdpoatguhxdpht).

### 📦 Bucket Créé

- **Nom du bucket** : `avatars`
- **Type** : Public (lecture publique)
- **Taille maximale** : 5 MB par fichier
- **Types MIME autorisés** : 
  - image/jpeg
  - image/jpg
  - image/png
  - image/gif
  - image/webp

### 🔒 Politiques de Sécurité RLS Appliquées

Les quatre politiques de sécurité suivantes ont été mises en place :

1. **Lecture publique** (`Public read access for avatars`)
   - Permet à tout le monde de voir les avatars
   - Condition : `bucket_id = 'avatars'`

2. **Upload par l'utilisateur** (`Allow authenticated users to upload their own avatar`)
   - Permet aux utilisateurs connectés d'uploader leur propre avatar
   - Condition : `bucket_id = 'avatars' AND auth.uid() = owner`

3. **Mise à jour par l'utilisateur** (`Allow authenticated users to update their own avatar`)
   - Permet aux utilisateurs de mettre à jour leur propre avatar
   - Condition : `auth.uid() = owner` et `bucket_id = 'avatars'`

4. **Suppression par l'utilisateur** (`Allow authenticated users to delete their own avatar`)
   - Permet aux utilisateurs de supprimer leur propre avatar
   - Condition : `auth.uid() = owner AND bucket_id = 'avatars'`

## 📝 Utilisation dans l'Application

### Upload d'un Avatar

```typescript
import { createClient } from '@/lib/supabase/client'

async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient()
  
  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`
  const filePath = `${userId}/${fileName}`
  
  // Upload du fichier
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true, // Remplace si existe déjà
      cacheControl: '3600'
    })
    
  if (error) {
    console.error('Erreur upload avatar:', error)
    return null
  }
  
  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
    
  return publicUrl
}
```

### Suppression d'un Avatar

```typescript
async function deleteAvatar(userId: string, filePath: string) {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])
    
  if (error) {
    console.error('Erreur suppression avatar:', error)
    return false
  }
  
  return true
}
```

### Obtenir l'URL d'un Avatar

```typescript
function getAvatarUrl(filePath: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
    
  return publicUrl
}
```

## 🔧 Intégration avec le Profil Utilisateur

Pour intégrer les avatars avec les profils utilisateurs, vous devrez :

1. Ajouter une colonne `avatar_url` dans votre table `profiles` (si ce n'est pas déjà fait)
2. Mettre à jour l'URL de l'avatar après l'upload
3. Afficher l'avatar dans les composants de profil

### Exemple de mise à jour du profil

```typescript
async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    
  if (error) {
    console.error('Erreur mise à jour profil:', error)
    return false
  }
  
  return true
}
```

## 🚨 Points d'Attention

1. **Limite de taille** : Les fichiers sont limités à 5 MB
2. **Types de fichiers** : Seules les images (JPEG, PNG, GIF, WebP) sont acceptées
3. **Structure des dossiers** : Il est recommandé d'organiser les avatars par userId
4. **Cache** : Utilisez `cacheControl` pour optimiser les performances
5. **Sécurité** : Les politiques RLS garantissent que seul le propriétaire peut modifier son avatar

## 📊 Monitoring

Pour surveiller l'utilisation du stockage :

1. Accédez au dashboard Supabase
2. Allez dans Storage → Buckets → avatars
3. Consultez les métriques d'utilisation

## 🔄 Prochaines Étapes

1. Créer un composant React pour l'upload d'avatar
2. Intégrer l'upload dans la page de modification du profil (`/profil/modifier`)
3. Afficher les avatars dans la liste des membres (`/membres`)
4. Ajouter la gestion des avatars dans le UserMenu

---

*Configuration effectuée le 29/08/2025 sur le projet Aurora50 (suxhtdqdpoatguhxdpht)*
