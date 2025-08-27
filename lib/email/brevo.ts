const SibApiV3Sdk = require('@sib-api-v3-sdk');
import { getPaymentSuccessTemplate, EmailData } from './templates/payment-success';

// Configuration du client Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

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

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{
      email: data.email,
      name: data.name
    }];

    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL || 'hello@aurora50.fr',
      name: process.env.BREVO_SENDER_NAME || 'Aurora50'
    };

    sendSmtpEmail.subject = "🌟 Bienvenue dans Aurora50 - Votre transformation commence maintenant !";
    sendSmtpEmail.htmlContent = getPaymentSuccessTemplate(emailData);
    
    // Tags pour le suivi dans Brevo
    sendSmtpEmail.tags = ['welcome', 'aurora50', 'payment-success'];
    
    // Paramètres pour le tracking
    sendSmtpEmail.params = {
      amount: data.amount,
      sessionId: data.sessionId,
      name: data.name
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé avec succès:', {
      messageId: response.messageId,
      recipient: data.email,
      timestamp: new Date().toISOString()
    });

    return response;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    // Log détaillé pour debug
    console.error('Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      recipient: data.email,
      timestamp: new Date().toISOString()
    });

    throw error;
  }
}

// Fonction pour envoyer un email de rappel (optionnel)
export async function sendReminderEmail(email: string, name: string) {
  // À implémenter si besoin de relance
  console.log('Reminder email function placeholder');
}
