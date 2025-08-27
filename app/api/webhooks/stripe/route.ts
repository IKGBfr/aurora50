import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET, checkStripeConfig } from '@/lib/stripe';
import { sendWelcomeEmail } from '@/lib/email/brevo';
import Stripe from 'stripe';

// Désactive le bodyParser de Next.js pour les webhooks
export const runtime = 'nodejs';

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

        console.log('📧 Envoi de l\'email de bienvenue à:', customerEmail);

        // Envoyer l'email de bienvenue
        try {
          await sendWelcomeEmail({
            email: customerEmail,
            name: customerName,
            amount: amount,
            sessionId: session.id,
            subscriptionId: session.subscription as string | undefined
          });

          console.log('✅ Email de bienvenue envoyé avec succès');
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
          // On ne retourne pas d'erreur 500 ici pour éviter que Stripe retry
          // L'erreur est loggée et on peut mettre en place une alerte
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('📝 Nouvel abonnement créé:', subscription.id);
        // Logique additionnelle si nécessaire
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🚫 Abonnement annulé:', subscription.id);
        // Logique pour gérer l'annulation si nécessaire
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Paiement réussi:', paymentIntent.id);
        // Généralement géré via checkout.session.completed
        break;
      }

      default:
        console.log(`⚠️ Type d'événement non géré: ${event.type}`);
    }

    // Toujours retourner 200 pour confirmer la réception
    return NextResponse.json({ 
      received: true,
      type: event.type,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Erreur dans le traitement du webhook:', err);
    // On retourne quand même 200 pour éviter les retries inutiles
    return NextResponse.json({ 
      received: true,
      error: 'Processing failed but acknowledged'
    });
  }
}

// Support pour GET (vérification que l'endpoint fonctionne)
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}