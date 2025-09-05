#!/usr/bin/env node

/**
 * Script pour appliquer les corrections des vues salons dans Supabase
 * Cela permettra d'afficher les images de couverture des salons
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySQLFile(filePath: string) {
  try {
    console.log(`📄 Lecture du fichier SQL: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('🚀 Exécution du script SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Si la fonction exec_sql n'existe pas, essayer d'exécuter directement
      console.log('⚠️  Fonction exec_sql non trouvée, exécution directe...');
      
      // Diviser le SQL en statements individuels
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.includes('DROP VIEW') || 
            statement.includes('CREATE OR REPLACE VIEW') ||
            statement.includes('GRANT') ||
            statement.includes('DO $$')) {
          console.log(`Exécution: ${statement.substring(0, 50)}...`);
          // Note: Ces opérations nécessitent des privilèges admin
          // Elles doivent être exécutées directement dans Supabase Dashboard
        }
      }
      
      console.log('⚠️  Certaines opérations nécessitent des privilèges admin.');
      console.log('📝 Veuillez exécuter le script suivant dans Supabase SQL Editor:');
      console.log('\n' + sql);
      return false;
    }
    
    console.log('✅ Script SQL appliqué avec succès');
    return true;
  } catch (err) {
    console.error('❌ Erreur lors de l\'application du script SQL:', err);
    return false;
  }
}

async function main() {
  console.log('🔧 Application des corrections pour les vues salons...\n');
  
  const sqlFile = path.join(__dirname, 'fix-salons-view-cover.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Fichier SQL non trouvé: ${sqlFile}`);
    process.exit(1);
  }
  
  const success = await applySQLFile(sqlFile);
  
  if (!success) {
    console.log('\n⚠️  Le script n\'a pas pu être appliqué automatiquement.');
    console.log('👉 Veuillez copier le contenu du fichier scripts/fix-salons-view-cover.sql');
    console.log('   et l\'exécuter dans l\'éditeur SQL de Supabase Dashboard.');
    console.log('\n📍 Étapes:');
    console.log('   1. Allez sur https://app.supabase.com');
    console.log('   2. Sélectionnez votre projet');
    console.log('   3. Allez dans SQL Editor');
    console.log('   4. Collez et exécutez le script');
  } else {
    console.log('\n✅ Toutes les corrections ont été appliquées avec succès!');
    console.log('🎉 Les images de couverture des salons devraient maintenant s\'afficher correctement.');
  }
  
  // Vérifier si les colonnes existent
  console.log('\n🔍 Vérification des colonnes dans la table salons...');
  
  const { data: columns, error: columnsError } = await supabase
    .from('salons')
    .select('cover_url, emoji, theme_color, tags, visibility')
    .limit(1);
  
  if (columnsError) {
    console.log('⚠️  Impossible de vérifier les colonnes:', columnsError.message);
    console.log('   Assurez-vous d\'avoir exécuté le script update-salons-schema.sql d\'abord.');
  } else {
    console.log('✅ Les colonnes nécessaires sont présentes dans la table salons');
  }
}

main().catch(console.error);
