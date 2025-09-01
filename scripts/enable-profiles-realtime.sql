-- Script pour activer Supabase Realtime sur la table profiles
-- Cela permettra d'écouter les changements en temps réel (INSERT, UPDATE, DELETE)

-- Activer Realtime pour la table profiles
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Vérifier que Realtime est bien activé
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Note: Ce script doit être exécuté dans le SQL Editor de Supabase
-- Après exécution, les changements sur la table profiles seront diffusés en temps réel
