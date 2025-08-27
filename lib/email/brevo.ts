import { getPaymentSuccessTemplate, EmailData } from './templates/payment-success';

export async function sendWelcomeEmail(data: {
  email: string;
  name: string;
  amount: number;
  sessionId: string;
  subscriptionId?: string;
}) {
  try {
    const emailData: EmailData = {
      name: data.name,
      email: data.email,
      amount: data.amount,
      sessionId: data.sessionId,
      date: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL || 'sigrid@aurora50.fr',
          name: process.env.BREVO_SENDER_NAME || 'Aurora50'
        },
        to: [{ 
          email: data.email, 
          name: data.name 
        }],
        subject: "🌟 Bienvenue dans Aurora50 - Votre transformation commence !",
        htmlContent: getPaymentSuccessTemplate(emailData),
        tags: ['welcome', 'aurora50', 'payment-success'],
        params: {
          amount: data.amount,
          sessionId: data.sessionId,
          name: data.name
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    console.log('✅ Email envoyé avec succès:', {
      messageId: result.messageId,
      recipient: data.email,
      timestamp: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    console.error('Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      recipient: data.email,
      timestamp: new Date().toISOString()
    });

    throw error;
  }
}

export async function sendReminderEmail(email: string, name: string) {
  console.log('Reminder email function placeholder');
}