import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/brevo';

export async function GET() {
  try {
    // Test direct de l'envoi d'email
    await sendWelcomeEmail({
      email: 'altowebfr@gmail.com',
      name: 'Test Manual',
      amount: 47,
      sessionId: 'test_session_' + Date.now(),
      subscriptionId: 'test_sub_' + Date.now()
    });

    return NextResponse.json({
      status: 'success',
      message: 'Test email sent'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
