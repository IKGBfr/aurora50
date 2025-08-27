import { NextResponse } from 'next/server';

export async function GET() {
  // Vérifier les variables d'environnement (sans exposer les valeurs complètes)
  const config = {
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasPaymentLinkId: !!process.env.STRIPE_PAYMENT_LINK_ID,
    },
    brevo: {
      hasApiKey: !!process.env.BREVO_API_KEY,
      hasSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
      hasSenderName: !!process.env.BREVO_SENDER_NAME,
      hasListId: !!process.env.BREVO_LIST_ID,
    },
    app: {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      nodeEnv: process.env.NODE_ENV,
    }
  };

  return NextResponse.json({
    status: 'Configuration check',
    config,
    timestamp: new Date().toISOString()
  });
}
