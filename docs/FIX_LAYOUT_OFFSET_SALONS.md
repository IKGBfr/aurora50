# 🔧 Correction du Layout Offset des Salons

## Date
04/09/2025

## Problème identifié
Le contenu des salons était complètement caché derrière la sidebar gauche du layout principal. C'était un problème de **layout/offset**, pas de z-index.

### Analyse du problème
1. **Layout parent** (`app/(lms)/layout.tsx`) :
   - Définit correctement les marges pour le contenu principal :
     - Desktop : `margin-left: 280px` (sidebar expanded)
     - Tablette : `margin-left: 80px` (sidebar collapsed)  
     - Mobile : `margin-left: 0` (pas de sidebar)

2. **Page salon** (`app/(lms)/salons/[id]/page.tsx`) :
   - Utilisait `position: fixed` avec `left: 0`
   - Ignorait complètement les marges du parent
   - Résultat : contenu caché sous la sidebar

## Solution implémentée

### Changements dans PageContainer
**Avant :**
```typescript
const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // ...
`;
```

**Après :**
```typescript
const PageContainer = styled.div`
  display: grid;
  grid-template-rows: 64px 1fr;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
`;
```

### Changements dans SalonHeader
**Avant :**
```typescript
const SalonHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  // ...
`;
```

**Après :**
```typescript
const SalonHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 60;
  grid-row: 1;
  // ...
`;
```

## Résultats

✅ **Desktop** : Le salon est maintenant décalé de 280px (largeur de la sidebar)
✅ **Tablette** : Décalé de 80px (sidebar collapsed) 
✅ **Mobile** : Pas de décalage (sidebar cachée)
✅ **Header** : Reste sticky en haut lors du scroll
✅ **Z-index** : Hiérarchie maintenue (sidebar: 30, header: 60)

## Points clés

1. **Position relative vs fixed** : 
   - `relative` respecte le flow du document et les marges du parent
   - `fixed` sort complètement du flow et ignore le contexte parent

2. **Grid CSS** :
   - Structure claire avec header (64px) et contenu (1fr)
   - Plus facile à maintenir que des positions absolues

3. **Responsive** :
   - Les breakpoints sont gérés par le layout parent
   - La page salon s'adapte automatiquement

## Tests recommandés

- [x] Vérifier le décalage sur desktop (280px)
- [x] Vérifier sur tablette avec sidebar collapsed (80px)
- [x] Vérifier sur mobile sans sidebar (0px)
- [x] Tester le sticky header lors du scroll
- [x] Confirmer que les modals et overlays fonctionnent toujours

## Fichiers modifiés

- `app/(lms)/salons/[id]/page.tsx` : Correction du positionnement
- `docs/FIX_LAYOUT_OFFSET_SALONS.md` : Documentation de la correction

## Impact

Cette correction résout le problème critique où tout le contenu du salon était invisible car caché sous la sidebar. L'interface est maintenant fonctionnelle et responsive sur tous les devices.

## Correction supplémentaire - Scrollbar globale

### Problème
Une scrollbar globale apparaissait et cachait la zone de texte en bas.

### Solution appliquée

#### 1. ChatSection avec hauteur complète
```typescript
const ChatSection = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  position: relative;
`;
```

#### 2. ChatContainer en position absolue
```typescript
const ChatContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
```

#### 3. Structure flex optimisée
- `MessagesContainer` : `flex: 1` avec `min-height: 0` et `overflow-y: auto`
- `InputContainer` : `flex-shrink: 0` pour rester toujours visible

### Résultat final
✅ **Pas de scrollbar globale** - Tout contenu dans le viewport
✅ **Zone de texte toujours visible** - Fixe en bas
✅ **Messages scrollables** - Uniquement dans leur zone dédiée
✅ **Structure responsive** - Fonctionne sur tous les devices
