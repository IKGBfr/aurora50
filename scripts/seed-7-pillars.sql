-- Script pour ajouter les colonnes manquantes et insérer les 7 piliers complets
-- Aurora50 - Refonte complète de la section Cours

-- 1. Ajouter les colonnes manquantes à la table courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS pillar_number INTEGER,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS emoji TEXT,
ADD COLUMN IF NOT EXISTS color_gradient TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- 2. Nettoyer les données existantes
DELETE FROM lessons;
DELETE FROM courses;

-- 3. Insérer les 7 piliers complets
INSERT INTO courses (
  title, 
  description, 
  pillar_number, 
  slug, 
  duration_weeks, 
  emoji, 
  color_gradient, 
  order_index, 
  is_published, 
  short_description
) VALUES
-- Pilier 1
(
  'Libération Émotionnelle', 
  'Libérez-vous des blocages invisibles qui vous retiennent depuis des années. Ce pilier fondamental vous guide à travers un processus de guérison profonde pour retrouver votre liberté intérieure et votre joie de vivre.',
  1, 
  'liberation-emotionnelle', 
  4, 
  '🦋', 
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
  1, 
  true, 
  'Guérir et pardonner pour renaître'
),

-- Pilier 2
(
  'Reconquête du Corps', 
  'Réconciliez-vous avec votre corps et retrouvez votre vitalité. Apprenez à aimer et honorer votre temple sacré avec des pratiques douces et puissantes adaptées aux femmes de plus de 50 ans.',
  2, 
  'reconquete-corps', 
  4, 
  '🌸', 
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
  2, 
  true, 
  'Votre corps, votre temple sacré'
),

-- Pilier 3
(
  'Renaissance Professionnelle', 
  'Réinventez votre carrière et découvrez vos talents cachés après 50 ans. Ce pilier vous accompagne dans votre transformation professionnelle avec des stratégies concrètes et adaptées à votre expérience unique.',
  3, 
  'renaissance-professionnelle', 
  6, 
  '💼', 
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
  3, 
  true, 
  'Vos talents valent de l''or'
),

-- Pilier 4
(
  'Relations Authentiques', 
  'Créez des liens profonds et nourrissants qui vous élèvent. Apprenez à établir des frontières saines, à communiquer avec authenticité et à attirer les bonnes personnes dans votre vie.',
  4, 
  'relations-authentiques', 
  4, 
  '💖', 
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
  4, 
  true, 
  'Des relations qui vous élèvent'
),

-- Pilier 5
(
  'Créativité Débridée', 
  'Libérez votre potentiel créatif endormi et exprimez votre art intérieur. Découvrez comment la créativité peut devenir votre superpouvoir après 50 ans.',
  5, 
  'creativite-debridee', 
  3, 
  '🎨', 
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
  5, 
  true, 
  'Votre art intérieur révélé'
),

-- Pilier 6
(
  'Liberté Financière', 
  'Construisez votre indépendance financière et créez l''abondance dans votre vie. Apprenez à gérer, investir et multiplier vos ressources avec sagesse et confiance.',
  6, 
  'liberte-financiere', 
  3, 
  '💎', 
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
  6, 
  true, 
  'L''abondance vous attend'
),

-- Pilier 7
(
  'Mission de Vie', 
  'Découvrez votre ikigai et votre raison d''être profonde. Ce pilier culminant vous guide vers votre mission unique et la création de votre héritage.',
  7, 
  'mission-vie', 
  4, 
  '⭐', 
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
  7, 
  true, 
  'Votre legacy commence maintenant'
);

-- 4. Insérer les leçons pour chaque pilier
-- Récupérer les IDs des cours créés
WITH course_ids AS (
  SELECT id, pillar_number FROM courses
)

-- Leçons pour Pilier 1 - Libération Émotionnelle
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Comprendre ses blocages invisibles', 'Dans cette première leçon gratuite, nous allons explorer ensemble les mécanismes cachés qui vous empêchent d''avancer.', 0),
  ('Guérir la petite fille intérieure', 'Cette leçon vous guide dans un processus de reconnexion avec votre enfant intérieur.', 7),
  ('Pardonner (aux autres et à soi)', 'Le pardon n''est pas pour l''autre, c''est pour vous.', 14),
  ('Technique EFT adaptée 50+', 'L''EFT (Emotional Freedom Technique) spécialement conçue pour les femmes de plus de 50 ans.', 21),
  ('Rituel de libération du passé', 'Un rituel puissant pour marquer votre renaissance.', 28)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 1;

-- Leçons pour Pilier 2 - Reconquête du Corps
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Réconciliation avec votre corps', 'Première leçon gratuite : apprenez à faire la paix avec votre corps tel qu''il est aujourd''hui.', 0),
  ('Yoga doux pour 50+', 'Séquences de yoga spécialement adaptées pour retrouver souplesse et vitalité.', 7),
  ('Nutrition intuitive', 'Libérez-vous des régimes et retrouvez une relation saine avec la nourriture.', 14),
  ('Rituel beauté sacrée', 'Créez votre propre rituel de soin pour honorer votre beauté unique.', 21),
  ('Danse de la déesse', 'Reconnectez avec votre sensualité à travers le mouvement libre.', 28)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 2;

-- Leçons pour Pilier 3 - Renaissance Professionnelle
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Identifier ses talents cachés', 'Dans cette leçon gratuite, vous allez découvrir vos talents uniques grâce à notre méthode exclusive.', 0),
  ('Vaincre le syndrome de l''imposteur', 'Libérez-vous définitivement du syndrome de l''imposteur.', 7),
  ('LinkedIn pour les 50+', 'Optimisez votre profil LinkedIn pour attirer les bonnes opportunités.', 14),
  ('Lancer une activité solo', 'Tout ce que vous devez savoir pour lancer votre activité en solo après 50 ans.', 21),
  ('Négocier sa valeur', 'Apprenez à négocier ce que vous valez vraiment.', 28),
  ('Transmission et mentorat', 'Transformez votre expérience en valeur pour les autres.', 35)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 3;

-- Leçons pour Pilier 4 - Relations Authentiques
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Établir des frontières saines', 'Leçon gratuite : apprenez à dire non avec grâce et fermeté.', 0),
  ('Communication non-violente', 'Maîtrisez l''art de communiquer avec authenticité et bienveillance.', 7),
  ('Attirer les bonnes personnes', 'Créez un cercle social qui vous nourrit et vous élève.', 14),
  ('Guérir les relations toxiques', 'Libérez-vous des schémas relationnels destructeurs.', 21),
  ('L''amour après 50 ans', 'Ouvrez-vous à l''amour sous toutes ses formes.', 28)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 4;

-- Leçons pour Pilier 5 - Créativité Débridée
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Réveiller l''artiste en vous', 'Leçon gratuite : découvrez votre potentiel créatif endormi.', 0),
  ('Journal créatif', 'Explorez votre monde intérieur à travers l''écriture et le dessin.', 7),
  ('Photographie intuitive', 'Capturez la beauté du monde avec votre regard unique.', 14),
  ('Créer votre œuvre', 'Donnez vie à votre projet créatif personnel.', 21)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 5;

-- Leçons pour Pilier 6 - Liberté Financière
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Mindset d''abondance', 'Leçon gratuite : transformez votre relation avec l''argent.', 0),
  ('Budget et planification', 'Créez un plan financier solide pour votre nouvelle vie.', 7),
  ('Investir après 50 ans', 'Stratégies d''investissement adaptées à votre situation.', 14),
  ('Créer des revenus passifs', 'Générez des revenus qui travaillent pour vous.', 21)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 6;

-- Leçons pour Pilier 7 - Mission de Vie
INSERT INTO lessons (course_id, title, content, release_day_offset)
SELECT 
  id,
  title,
  content,
  release_day_offset
FROM course_ids, 
(VALUES
  ('Découvrir votre ikigai', 'Leçon gratuite : trouvez votre raison d''être profonde.', 0),
  ('Clarifier votre vision', 'Créez une vision claire de votre futur idéal.', 7),
  ('Plan d''action aligné', 'Développez un plan concret pour réaliser votre mission.', 14),
  ('Créer votre héritage', 'Construisez quelque chose qui vous survivra.', 21),
  ('Célébration et intégration', 'Célébrez votre transformation et ancrez vos apprentissages.', 28)
) AS lessons(title, content, release_day_offset)
WHERE pillar_number = 7;

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_courses_pillar_number ON courses(pillar_number);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_order_index ON courses(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
