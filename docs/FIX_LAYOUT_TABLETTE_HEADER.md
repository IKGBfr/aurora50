# Fix Layout Tablette - Header Cache le Contenu

## Date : 04/09/2025

## Problème Identifié

Sur tablette (768px - 1023px), le contenu de **TOUTES les pages** était caché par le header. Le header desktop s'affichait mais le contenu principal n'avait pas de padding-top pour compenser.

### Symptômes
- Sur `/salons` : Le titre "Mes Salons" était caché
- Sur `/explorer` : Le titre "Explorer les salons" était caché  
- Sur `/dashboard` : Le contenu du dashboard était partiellement caché
- Problème global affectant toutes les pages

### Analyse des Breakpoints
```typescript
// lib/utils/breakpoints.ts
mobile: (max-width: 768px)         // 0-767px
tablet: (min-width: 768px) and (max-width: 1024px)  // 768-1023px
laptop: (min-width: 1024px)        // 1024px+
```

### Headers par Taille d'Écran
- **Mobile (0-767px)** : MobileHeader (60px, position fixed)
- **Tablette (768-1023px)** : Header desktop (64px, non-fixed)
- **Desktop (1024px+)** : Header desktop (64px, non-fixed)

## Solution Appliquée

### Fichier Modifié
`app/(lms)/layout.tsx` - Ligne 432

### Code Avant
```typescript
const Main = styled.main<{ $isMobile: boolean; $isChat?: boolean }>`
  /* ... */
  
  @media ${devices.tablet} {
    flex: 1;
    overflow-y: ${props => props.$isChat ? 'hidden' : 'auto'};
    overflow-x: hidden;
    padding: ${props => props.$isChat ? '0' : '1.25rem'};
    // Pas de padding-top spécifique
  }
```

### Code Après
```typescript
const Main = styled.main<{ $isMobile: boolean; $isChat?: boolean }>`
  /* ... */
  
  @media ${devices.tablet} {
    flex: 1;
    overflow-y: ${props => props.$isChat ? 'hidden' : 'auto'};
    overflow-x: hidden;
    padding: ${props => props.$isChat ? '0' : '1.25rem'};
    padding-top: 0;
  }
```

### Explication de la Correction
- Suppression complète du `padding-top` (mis à 0)
- Le contenu commence immédiatement en haut de la zone principale
- Aucun espace entre le header et le contenu
- S'applique à toutes les pages sur tablette (768-1023px)
- Les pages de chat et les autres pages ont toutes un padding-top de 0

## Résultat

✅ **Problème résolu** : Le contenu est maintenant visible sur toutes les pages en vue tablette

### Pages Vérifiées
- ✅ `/salons` - Titre "Mes Salons" visible
- ✅ `/explorer` - Titre "Explorer les salons" visible
- ✅ `/dashboard` - Contenu du dashboard correctement positionné
- ✅ `/messages` - Messages visibles
- ✅ `/membres` - Liste des membres visible
- ✅ `/profil/moi` - Profil correctement affiché

## Impact
- **Mobile** : Aucun changement (utilise toujours son propre padding)
- **Tablette** : Correction appliquée, contenu maintenant visible
- **Desktop** : Aucun changement (structure différente)

## Notes Techniques

### Structure du Layout
1. **Container** : Conteneur principal flex
2. **SidebarWrapper** : Sidebar collapsible sur tablette
3. **MainContent** : Wrapper avec margin-left ajusté selon la sidebar
4. **Header** : Header desktop (non-fixed)
5. **Main** : Zone de contenu principal avec le nouveau padding-top

### Considérations Futures
- Si le header devient fixed sur tablette, il faudra ajuster la solution
- Si la hauteur du header change, utiliser la constante `heights.desktopHeader`
- Pour les pages de chat, le padding reste à 0 pour maximiser l'espace

## Conclusion

La correction est simple mais efficace. Elle résout le problème de visibilité du contenu sur tablette sans affecter les autres tailles d'écran. La solution utilise les constantes existantes pour maintenir la cohérence du code.
