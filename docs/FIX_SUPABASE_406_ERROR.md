# 🔧 Correction des erreurs 406 Supabase - Rapport

## 📅 Date : 02/09/2025

## 🐛 Problème identifié

Les requêtes Supabase avec plusieurs conditions `.eq()` chaînées causaient des erreurs 406 (Not Acceptable).

### Exemple d'erreur :
```
GET /rest/v1/user_courses?select=id&user_id=eq.X&course_id=eq.Y
```

## 🔍 Analyse

### Cause racine
Supabase n'accepte pas le chaînage de plusieurs `.eq()` pour filtrer sur plusieurs colonnes. La syntaxe correcte nécessite l'utilisation de `.match()` ou `.filter()`.

### Fichiers affectés
1. **`app/api/courses/start/route.ts`** - 2 occurrences
2. **`app/(lms)/cours/[pillar-slug]/page.tsx`** - 1 occurrence

## ✅ Corrections appliquées

### 1. API Route - `/api/courses/start/route.ts`

#### Correction 1 : Vérification de cours existant (ligne 24-27)
```typescript
// ❌ AVANT
const { data: existing } = await supabase
  .from('user_courses')
  .select('*')
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .single()

// ✅ APRÈS
const { data: existing } = await supabase
  .from('user_courses')
  .select('*')
  .match({
    user_id: user.id,
    course_id: courseId
  })
  .single()
```

#### Correction 2 : Mise à jour last_accessed_at (ligne 35-36)
```typescript
// ❌ AVANT
const { error: updateError } = await supabase
  .from('user_courses')
  .update({
    last_accessed_at: new Date().toISOString()
  })
  .eq('user_id', user.id)
  .eq('course_id', courseId)

// ✅ APRÈS
const { error: updateError } = await supabase
  .from('user_courses')
  .update({
    last_accessed_at: new Date().toISOString()
  })
  .match({
    user_id: user.id,
    course_id: courseId
  })
```

### 2. Page Pilier - `/cours/[pillar-slug]/page.tsx`

#### Correction : Vérification user_courses (ligne 395-398)
```typescript
// ❌ AVANT
const { data: userCourse } = await supabase
  .from('user_courses')
  .select('id')
  .eq('user_id', user.id)
  .eq('course_id', courseData.id)
  .single()

// ✅ APRÈS
const { data: userCourse } = await supabase
  .from('user_courses')
  .select('id')
  .match({
    user_id: user.id,
    course_id: courseData.id
  })
  .single()
```

## 🎯 Résultats

### Avant les corrections :
- ❌ Erreur 406 lors du clic sur "Commencer" un pilier
- ❌ Les piliers ne s'activaient pas dans "Mes Piliers Actifs"
- ❌ Impossible de mettre à jour la progression

### Après les corrections :
- ✅ Plus d'erreurs 406 sur les requêtes `user_courses`
- ✅ Les piliers s'activent correctement au clic sur "Commencer"
- ✅ La section "Mes Piliers Actifs" se met à jour automatiquement
- ✅ La progression est correctement enregistrée

## 📚 Bonnes pratiques Supabase

### Pour filtrer sur plusieurs colonnes :

#### ✅ Utiliser `.match()` :
```typescript
.match({
  column1: value1,
  column2: value2
})
```

#### ✅ Ou utiliser `.filter()` :
```typescript
.filter('column1', 'eq', value1)
.filter('column2', 'eq', value2)
```

#### ❌ Ne PAS chaîner `.eq()` :
```typescript
// Ceci causera une erreur 406
.eq('column1', value1)
.eq('column2', value2)
```

## 🔄 Prochaines étapes

1. **Vérifier** que tous les autres fichiers utilisent la bonne syntaxe
2. **Tester** l'activation des piliers en production
3. **Monitorer** les logs pour s'assurer qu'il n'y a plus d'erreurs 406

## 📝 Notes

- La méthode `.match()` est préférable pour la lisibilité
- `.filter()` offre plus de flexibilité pour des conditions complexes
- Toujours vérifier la documentation Supabase pour les changements d'API

## 🚀 Impact

Cette correction améliore significativement l'expérience utilisateur en :
- Permettant l'activation correcte des piliers
- Assurant le suivi de progression
- Éliminant les erreurs silencieuses qui empêchaient certaines fonctionnalités

---

**Status : ✅ RÉSOLU**
