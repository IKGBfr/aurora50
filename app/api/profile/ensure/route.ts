import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('[API Profile Ensure] Début de la requête');
  
  try {
    const supabase = await createClient();
    
    // Récupérer l'utilisateur authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[API Profile Ensure] Erreur auth:', authError);
      return NextResponse.json({ 
        error: 'Erreur d\'authentification',
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.log('[API Profile Ensure] Aucun utilisateur connecté');
      return NextResponse.json({ 
        error: 'Non authentifié' 
      }, { status: 401 });
    }
    
    console.log('[API Profile Ensure] Utilisateur trouvé:', user.id, user.email);
    
    // Vérifier si le profil existe déjà
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[API Profile Ensure] Erreur lors de la vérification:', selectError);
    }
    
    if (existingProfile) {
      console.log('[API Profile Ensure] Profil existant trouvé:', existingProfile.id);
      return NextResponse.json({ 
        profile: existingProfile, 
        created: false,
        needsOnboarding: !existingProfile.onboarding_completed
      });
    }
    
    console.log('[API Profile Ensure] Aucun profil trouvé, création...');
    
    // Créer le profil avec upsert pour éviter les conflits
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Nouveau membre',
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: 'Nouveau membre de la communauté Aurora50 🌿',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subscription_status: 'free',
      subscription_plan: 'free',
      onboarding_completed: false,
      daily_messages_count: 0,
      last_message_reset: new Date().toISOString()
    };
    
    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select('id, onboarding_completed')
      .single();
    
    if (upsertError) {
      console.error('[API Profile Ensure] Erreur lors de l\'upsert:', upsertError);
      
      // Si l'upsert échoue, essayer de récupérer le profil existant
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();
      
      if (retryProfile) {
        console.log('[API Profile Ensure] Profil récupéré après erreur upsert');
        return NextResponse.json({ 
          profile: retryProfile, 
          created: false,
          needsOnboarding: !retryProfile.onboarding_completed
        });
      }
      
      return NextResponse.json({ 
        error: 'Impossible de créer le profil', 
        details: upsertError.message 
      }, { status: 500 });
    }
    
    console.log('[API Profile Ensure] Profil créé avec succès:', newProfile?.id);
    
    return NextResponse.json({ 
      profile: newProfile, 
      created: true,
      needsOnboarding: true
    });
    
  } catch (error) {
    console.error('[API Profile Ensure] Erreur inattendue:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Endpoint GET pour vérifier que l'API fonctionne
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'API Profile Ensure is running'
  });
}
