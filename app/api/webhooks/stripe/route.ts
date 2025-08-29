import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET, checkStripeConfig } from '@/lib/stripe';
import { sendWelcomeEmailWithMagicLink } from '@/lib/email/brevo';
import { createServiceClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Désactive le bodyParser de Next.js pour les webhooks
export const runtime = 'nodejs';

// Créer le client Supabase Admin pour les opérations Auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  console.log('🔍 Webhook called at:', new Date().toISOString());
  console.log('🔍 Headers:', {
    hasSignature: !!(await headers()).get('stripe-signature'),
    contentType: req.headers.get('content-type'),
    userAgent: req.headers.get('user-agent')
  });

  // Vérifier la configuration Stripe au runtime seulement
  try {
    checkStripeConfig();
  } catch (error) {
    console.error('❌ Configuration Stripe manquante:', error);
    return NextResponse.json(
      { error: 'Stripe configuration missing' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('❌ Pas de signature Stripe trouvée');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Vérification de la signature du webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Signature verified for event:', event.id, event.type);
  } catch (err) {
    console.error('❌ Erreur de vérification de signature:', err);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err}` },
      { status: 400 }
    );
  }

  console.log(`📨 Webhook reçu: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('💳 Session de paiement complétée:', {
          id: session.id,
          email: session.customer_email,
          amount: session.amount_total,
          payment_link: session.payment_link
        });

        // Vérifier si c'est bien le Payment Link Aurora50
        if (process.env.STRIPE_PAYMENT_LINK_ID && 
            session.payment_link !== process.env.STRIPE_PAYMENT_LINK_ID) {
          console.log('⚠️ Payment Link ne correspond pas à Aurora50');
          break;
        }

        // Récupérer les informations du client
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerName = session.customer_details?.name || 'Membre Aurora50';

        if (!customerEmail) {
          console.error('❌ Email client non trouvé dans la session');
          break;
        }

        // Calculer le montant
        const amount = session.amount_total ? session.amount_total / 100 : 47;

        console.log('👤 Création du compte Aurora50...');

        try {
          // 1. Créer l'utilisateur SANS envoyer d'email d'invitation
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true, // Confirmer automatiquement car ils ont payé
            user_metadata: {
              full_name: customerName,
              stripe_customer_id: session.customer as string,
              payment_date: new Date().toISOString(),
              payment_amount: amount
            }
          });

          let userId = userData?.user?.id;

          if (userError) {
            // Si l'utilisateur existe déjà, le récupérer
            if (userError.message.includes('already registered')) {
              console.log('ℹ️ Utilisateur déjà existant, mise à jour...');
              const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
              const existingUser = users.find(u => u.email === customerEmail);
              
              if (existingUser) {
                userId = existingUser.id;
                // Mettre à jour les metadata
                await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                  user_metadata: {
                    ...existingUser.user_metadata,
                    last_payment_date: new Date().toISOString(),
                    last_payment_amount: amount
                  }
                });
              }
            } else {
              throw userError;
            }
          }

          if (userId) {
            // 2. Créer/Mettre à jour le profil
            await updateUserProfile(userId, customerEmail, customerName, session);

            // 3. Générer un Magic Link de connexion directe
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email: customerEmail,
              options: {
                redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aurora50.fr'}/auth/confirm?next=/dashboard?welcome=true`
              }
            });

            if (linkError) {
              console.error('❌ Erreur génération Magic Link:', linkError);
              // Fallback : envoyer sans Magic Link
              throw new Error('Magic Link generation failed');
            } else if (linkData?.properties?.action_link) {
              console.log('✅ Magic Link généré');
              
              // 4. Envoyer UN SEUL email de bienvenue avec le Magic Link intégré
              await sendWelcomeEmailWithMagicLink({
                email: customerEmail,
                name: customerName,
                amount: amount,
                magicLink: linkData.properties.action_link,
                sessionId: session.id
              });
              
              console.log('✅ Email unique envoyé avec Magic Link intégré');
            }
          }
        } catch (error) {
          console.error('❌ Erreur:', error);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('📝 Nouvel abonnement créé:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🚫 Abonnement annulé:', subscription.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Paiement réussi:', paymentIntent.id);
        break;
      }

      default:
        console.log(`⚠️ Type d'événement non géré: ${event.type}`);
    }

    return NextResponse.json({ 
      received: true,
      type: event.type,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Erreur dans le traitement du webhook:', err);
    return NextResponse.json({ 
      received: true,
      error: 'Processing failed but acknowledged'
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

async function updateUserProfile(
  userId: string, 
  email: string, 
  name: string, 
  session: Stripe.Checkout.Session
) {
  const supabaseService = await createServiceClient();
  
  const { error } = await supabaseService
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      full_name: name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      stripe_customer_id: session.customer as string,
      stripe_session_id: session.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('❌ Erreur mise à jour profil:', error);
  } else {
    console.log('✅ Profil mis à jour dans la table profiles');
  }
}