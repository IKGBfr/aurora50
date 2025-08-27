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

    // 1. AJOUTER LE CONTACT À LA LISTE BREVO
    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email: data.email,
        attributes: {
          PRENOM: data.name.split(' ')[0],
          NOM: data.name.split(' ').slice(1).join(' ') || '',
          DATE_INSCRIPTION: new Date().toISOString(),
          MONTANT_ABONNEMENT: data.amount,
          SESSION_ID: data.sessionId
        },
        listIds: [parseInt(process.env.BREVO_LIST_ID || '15')],
        updateEnabled: true // Met à jour si le contact existe déjà
      })
    });

    if (!contactResponse.ok) {
      const error = await contactResponse.json();
      console.error('Erreur ajout contact Brevo:', error);
    } else {
      console.log('✅ Contact ajouté à la liste Aurora50');
    }

    // 2. ENVOYER L'EMAIL DE BIENVENUE
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
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

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    const result = await emailResponse.json();
    
    console.log('✅ Email envoyé avec succès:', {
      messageId: result.messageId,
      recipient: data.email,
      timestamp: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

export async function sendReminderEmail(email: string, name: string) {
  console.log('Reminder email function placeholder');
}