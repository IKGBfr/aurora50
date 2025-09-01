-- Script pour ajouter les colonnes manquantes à la table courses
-- Aurora50 - Préparation pour les 7 piliers

-- Ajouter les colonnes manquantes à la table courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS pillar_number INTEGER,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS emoji TEXT,
ADD COLUMN IF NOT EXISTS color_gradient TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_courses_pillar_number ON courses(pillar_number);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_order_index ON courses(order_index);
