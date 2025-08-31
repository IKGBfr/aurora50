import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

// Client Supabase avec service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Messages de chat réalistes
const CHAT_MESSAGES = [
  { email: 'marie.dubois@test.aurora50.com', content: 'Bonjour tout le monde ! Ravie de rejoindre cette belle communauté Aurora50 🌿' },
  { email: 'catherine.leroy@test.aurora50.com', content: 'Bienvenue Marie ! Tu vas adorer, l\'ambiance ici est vraiment bienveillante 💚' },
  { email: 'sylvie.martin@test.aurora50.com', content: 'Salut les filles ! Quelqu\'un a commencé le module sur le développement personnel ?' },
  { email: 'isabelle.moreau@test.aurora50.com', content: 'Oui Sylvie ! C\'est vraiment transformateur. Les exercices de méditation sont top 🧘‍♀️' },
  { email: 'philippe.lefebvre@test.aurora50.com', content: 'Hello la team ! Content de voir qu\'il y a aussi des hommes ici 😄' },
  { email: 'jeanmarc.thomas@test.aurora50.com', content: 'Salut Philippe ! On est moins nombreux mais on est là 💪' },
  { email: 'christine.petit@test.aurora50.com', content: 'J\'ai adoré l\'atelier créativité d\'hier soir ! Qui était présent ? 🎨' },
  { email: 'nathalie.bernard@test.aurora50.com', content: 'Moi j\'y étais Christine ! C\'était vraiment inspirant ✨' },
  { email: 'veronique.durand@test.aurora50.com', content: 'Les filles, j\'ai besoin de vos conseils pour équilibrer vie pro et perso... 🤔' },
  { email: 'catherine.leroy@test.aurora50.com', content: 'Véronique, on en parle en privé si tu veux ! J\'ai quelques astuces qui m\'ont beaucoup aidée 🌸' },
  { email: 'brigitte.rousseau@test.aurora50.com', content: 'Cette communauté est une vraie pépite ! Merci à toutes et tous 🌺' },
  { email: 'marie.dubois@test.aurora50.com', content: 'Quelqu\'un pour un défi 30 jours de méditation ? On se motive ensemble ! 🌿' },
  { email: 'isabelle.moreau@test.aurora50.com', content: 'Je suis partante Marie ! On commence demain ? 🧘‍♀️' },
  { email: 'sylvie.martin@test.aurora50.com', content: 'Moi aussi ! Team méditation 💪' },
  { email: 'christine.petit@test.aurora50.com', content: 'J\'organise un atelier créatif en ligne samedi, qui est intéressé ? 🎨' },
  { email: 'nathalie.bernard@test.aurora50.com', content: 'Super idée Christine ! Je m\'inscris 🌟' },
  { email: 'philippe.lefebvre@test.aurora50.com', content: 'Les amis, des conseils pour mieux gérer le stress au travail ?' },
  { email: 'jeanmarc.thomas@test.aurora50.com', content: 'Philippe, le module sur la gestion du stress est excellent, je te le recommande 🏃‍♂️' },
  { email: 'veronique.durand@test.aurora50.com', content: 'Merci Catherine pour notre échange ! Tes conseils sont en or 🚀' },
  { email: 'brigitte.rousseau@test.aurora50.com', content: 'Bon weekend à toutes et tous ! Profitez bien 🌺' }
];

async function seedChatMessages() {
  console.log('💬 Début du seeding des messages de chat...\n');
  
  let successCount = 0;
  let errorCount = 0;

  // Récupérer les IDs des utilisateurs
  const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
  
  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', fetchError.message);
    return;
  }

  // Créer une map email -> userId
  const userMap = new Map<string, string>();
  users.users.forEach(user => {
    if (user.email) {
      userMap.set(user.email, user.id);
    }
  });

  // Insérer les messages avec un délai pour simuler une conversation naturelle
  for (let i = 0; i < CHAT_MESSAGES.length; i++) {
    const message = CHAT_MESSAGES[i];
    const userId = userMap.get(message.email);
    
    if (!userId) {
      console.warn(`⚠️  Utilisateur non trouvé: ${message.email}`);
      errorCount++;
      continue;
    }

    // Créer un timestamp décalé pour chaque message
    const createdAt = new Date(Date.now() - (CHAT_MESSAGES.length - i) * 5 * 60 * 1000); // 5 minutes entre chaque message
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: message.content,
        created_at: createdAt.toISOString()
      });

    if (error) {
      console.error(`❌ Erreur pour le message de ${message.email}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ Message de ${message.email.split('@')[0]} ajouté`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DU SEEDING CHAT');
  console.log('='.repeat(50));
  console.log(`✅ Succès: ${successCount}/${CHAT_MESSAGES.length} messages`);
  if (errorCount > 0) {
    console.log(`❌ Erreurs: ${errorCount}`);
  }
  console.log('\n💬 Seeding des messages terminé!');
}

async function cleanChatMessages() {
  console.log('🧹 Nettoyage des messages de chat...\n');
  
  // Récupérer les IDs des utilisateurs de test
  const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
  
  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', fetchError.message);
    return;
  }

  // Filtrer les utilisateurs de test
  const testUserIds = users.users
    .filter(u => u.email?.endsWith('@test.aurora50.com'))
    .map(u => u.id);

  if (testUserIds.length === 0) {
    console.log('⚠️  Aucun utilisateur de test trouvé');
    return;
  }

  // Supprimer les messages de ces utilisateurs
  const { error, count } = await supabase
    .from('chat_messages')
    .delete()
    .in('user_id', testUserIds);

  if (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
  } else {
    console.log(`✅ ${count || 0} messages supprimés`);
  }
  
  console.log('\n🧹 Nettoyage terminé!');
}

// Fonction principale
async function main() {
  const command = process.argv[2];
  
  if (command === 'seed') {
    await seedChatMessages();
  } else if (command === 'clean') {
    await cleanChatMessages();
  } else {
    console.log('Usage:');
    console.log('  npm run seed:chat    # Créer les messages de chat');
    console.log('  npm run clean:chat   # Supprimer les messages de chat');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

export { seedChatMessages, cleanChatMessages };
