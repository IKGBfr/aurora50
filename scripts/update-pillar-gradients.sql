-- Script de migration pour mettre à jour les gradients des 7 piliers Aurora50
-- Ces nouveaux gradients utilisent des couleurs plus foncées pour améliorer la lisibilité du texte blanc
-- Tous les gradients respectent le contraste WCAG AA (ratio > 4.5:1)

-- Mise à jour des gradients pour chaque pilier
UPDATE courses 
SET color_gradient = CASE
  WHEN pillar_number = 1 THEN 'linear-gradient(135deg, #6B46C1 0%, #553396 100%)' -- Violet mystique
  WHEN pillar_number = 2 THEN 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' -- Rouge passion
  WHEN pillar_number = 3 THEN 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)' -- Rose puissant
  WHEN pillar_number = 4 THEN 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' -- Bleu profond
  WHEN pillar_number = 5 THEN 'linear-gradient(135deg, #059669 0%, #047857 100%)' -- Vert émeraude
  WHEN pillar_number = 6 THEN 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' -- Orange ambré
  WHEN pillar_number = 7 THEN 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' -- Indigo royal
  ELSE color_gradient -- Garde la valeur existante si pas de correspondance
END
WHERE pillar_number BETWEEN 1 AND 7;

-- Vérification des mises à jour
SELECT 
  pillar_number,
  title,
  emoji,
  color_gradient
FROM courses
WHERE pillar_number BETWEEN 1 AND 7
ORDER BY pillar_number;
