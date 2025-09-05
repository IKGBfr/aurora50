# Fix: Affichage des images de couverture des salons

## Problème
Les images de couverture uploadées lors de la création des salons ne s'affichent pas dans les cards, même si elles sont bien stockées dans le bucket `salon-covers`.

## Cause
La vue `salons_with_details` utilisée pour récupérer les salons ne contenait pas les nouveaux champs ajoutés :
- `cover_url` : URL de l'image de couverture
- `emoji` : Emoji du salon
- `theme_color` : Couleur du thème
- `tags` : Tags du salon
- `visibility` : Visibilité (public/privé)

## Solution appliquée

### 1. Mise à jour de la vue SQL
Création d'un nouveau script `scripts/fix-salons-view-cover.sql` qui :
- Recrée la vue `salons_with_details` avec tous les nouveaux champs
- Recrée la vue `my_salons` avec tous les nouveaux champs
- Ajoute les permissions appropriées

### 2. Mise à jour du hook React
Modification de `lib/hooks/useSalons.ts` pour :
- Ajouter les nouveaux champs dans l'interface `Salon`
- Mettre à jour les données mockées en mode dev
- S'assurer que `cover_url` est bien utilisé (et non `avatar_url`)

### 3. Composant SalonCard
Le composant `components/salons/SalonCard.tsx` utilise déjà correctement `cover_url` et affiche un dégradé Aurora50 par défaut si pas d'image.

## Instructions pour appliquer le fix

### Étape 1: Vérifier et ajouter les colonnes manquantes
1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez et exécutez le contenu de `scripts/check-and-add-salon-columns.sql`
   - Ce script vérifie et ajoute les colonnes manquantes si nécessaire

### Étape 2: Mettre à jour les vues
1. Toujours dans **SQL Editor**
2. Copiez et exécutez le contenu de `scripts/fix-salons-view-cover.sql`
   - Ce script recrée les vues avec les bonnes colonnes

### Option alternative: Script automatique
```bash
npm run tsx scripts/apply-salons-cover-fix.ts
```
Note: Ce script peut ne pas fonctionner si vous n'avez pas les permissions admin.

## Vérification

Après avoir appliqué le fix :

1. **Vérifiez dans Supabase** :
   - Table Editor > salons : Les colonnes `cover_url`, `emoji`, etc. doivent être présentes
   - SQL Editor : `SELECT * FROM salons_with_details LIMIT 1;` doit retourner tous les champs

2. **Vérifiez dans l'application** :
   - Allez sur `/explorer` ou `/salons`
   - Les cards des salons doivent maintenant afficher :
     - L'image de couverture (ou le dégradé Aurora50 par défaut)
     - L'emoji
     - Les tags
     - Le badge de visibilité

## Structure des données

### Table `salons`
```sql
- id: UUID
- name: TEXT
- description: TEXT
- category: TEXT
- city: TEXT (nullable)
- owner_id: UUID
- share_code: TEXT
- member_count: INTEGER
- message_count: INTEGER
- avatar_url: TEXT (nullable) -- ancien champ, conservé pour compatibilité
- color_theme: TEXT -- ancien champ
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
-- Nouveaux champs
- visibility: TEXT ('public' | 'private')
- cover_url: TEXT (nullable) -- URL de l'image dans le bucket salon-covers
- emoji: TEXT
- theme_color: TEXT -- nouveau champ qui remplace color_theme
- tags: TEXT[]
```

### Bucket Storage `salon-covers`
- Public: Oui
- Taille max: 5MB
- Types acceptés: image/jpeg, image/png, image/webp, image/gif
- Structure: `{salon_id}/{filename}`

## Résultat attendu

Après application du fix :
- ✅ Les images de couverture s'affichent dans les cards
- ✅ Les emojis sont visibles
- ✅ Les tags sont affichés
- ✅ Les badges de visibilité (public/privé) sont corrects
- ✅ Un dégradé Aurora50 s'affiche si pas d'image de couverture

## Troubleshooting

### Les images ne s'affichent toujours pas
1. Vérifiez que le bucket `salon-covers` est bien public dans Supabase Storage
2. Vérifiez que les URLs dans `cover_url` sont correctes
3. Rafraîchissez la page avec Cmd+Shift+R (cache hard refresh)

### Erreur "column does not exist"
1. Exécutez d'abord `scripts/check-and-add-salon-columns.sql`
2. Puis exécutez `scripts/fix-salons-view-cover.sql`

### Erreur "column p.display_name does not exist"
La colonne dans la table `profiles` s'appelle `full_name` et non `display_name`. Le script a été corrigé pour utiliser la bonne colonne.

### Les nouvelles colonnes sont null
C'est normal pour les salons créés avant l'ajout des nouvelles colonnes. Les valeurs par défaut sont :
- `emoji`: '💬'
- `theme_color`: '#8B5CF6'
- `visibility`: 'public'
- `tags`: []
- `cover_url`: null (affichera le dégradé par défaut)
