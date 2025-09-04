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

async function runMigration() {
  console.log('🚀 Début de la migration pour le système de salons...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), 'scripts', 'create-salons-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Diviser le SQL en commandes individuelles
    const commands = sqlContent
      .split(/;(?=\s*(?:--|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT))/i)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 ${commands.length} commandes SQL à exécuter\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const commandPreview = command.substring(0, 50).replace(/\n/g, ' ');
      
      try {
        // Exécuter la commande SQL
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        }).single();

        if (error) {
          // Essayer directement si la fonction exec_sql n'existe pas
          const { error: directError } = await supabase.from('_').select().limit(0);
          
          // Si c'est juste une erreur de fonction manquante, on continue
          if (error.message.includes('exec_sql') || error.message.includes('function')) {
            console.log(`⚠️  Commande ${i + 1}: Fonction exec_sql non disponible, utilisation alternative...`);
            
            // Pour les commandes critiques, on les signale
            if (command.includes('CREATE TABLE') || command.includes('ALTER TABLE')) {
              console.log(`   → ${commandPreview}...`);
              console.log('   ℹ️  Cette commande doit être exécutée manuellement dans Supabase Dashboard\n');
            }
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Commande ${i + 1}: ${commandPreview}...`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ Erreur commande ${i + 1}: ${commandPreview}...`);
        console.error(`   Message: ${err.message}\n`);
        errorCount++;
        
        // Continuer malgré les erreurs (certaines tables peuvent déjà exister)
        if (!command.includes('CREATE TABLE IF NOT EXISTS') && !command.includes('ALTER TABLE')) {
          // Pour les commandes critiques, on arrête
          if (command.includes('CREATE FUNCTION') || command.includes('CREATE POLICY')) {
            console.error('⚠️  Erreur critique détectée. Arrêt de la migration.');
            break;
          }
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Résumé de la migration:');
    console.log(`   ✅ Succès: ${successCount} commandes`);
    console.log(`   ❌ Erreurs: ${errorCount} commandes`);
    console.log('='.repeat(50));

    // Instructions pour exécution manuelle
    console.log('\n📋 IMPORTANT - Actions manuelles requises:\n');
    console.log('1. Allez dans Supabase Dashboard > SQL Editor');
    console.log('2. Copiez et exécutez le contenu de: scripts/create-salons-tables.sql');
    console.log('3. Vérifiez que les tables suivantes ont été créées:');
    console.log('   - salons');
    console.log('   - salon_members');
    console.log('   - salon_invitations');
    console.log('4. Vérifiez que la colonne salon_id a été ajoutée à chat_messages');
    console.log('5. Vérifiez que les fonctions RPC ont été créées:');
    console.log('   - create_salon_with_code');
    console.log('   - join_salon_via_code');
    console.log('   - create_salon_invitation');
    
    console.log('\n✨ Une fois les tables créées, vous pouvez continuer avec l\'implémentation frontend.');

  } catch (error: any) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration().catch(console.error);
