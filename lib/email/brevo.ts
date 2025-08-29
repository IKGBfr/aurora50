import { getPaymentSuccessTemplate, EmailData } from './templates/payment-success';

export async function sendWelcomeEmailWithMagicLink(data: {
  email: string;
  name: string;
  amount: number;
  magicLink: string;
  sessionId: string;
}) {
  console.log('📬 Starting email send process:', {
    to: data.email,
    name: data.name,
    hasApiKey: !!process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL,
    hasMagicLink: !!data.magicLink
  });

  try {
    // 1. AJOUTER LE CONTACT À LA LISTE BREVO
    console.log('👤 Adding contact to list #15:', data.email);
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
        updateEnabled: true
      })
    });

    if (!contactResponse.ok) {
      const errorBody = await contactResponse.text();
      console.error('❌ Brevo contact error details:', {
        status: contactResponse.status,
        statusText: contactResponse.statusText,
        body: errorBody
      });
    } else {
      const responseText = await contactResponse.text();
      console.log('✅ Contact added successfully, response:', responseText || 'OK');
    }

    // 2. CRÉER LE CONTENU HTML AVEC MAGIC LINK MIS EN AVANT
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header Aurora50 -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 42px; margin: 0; background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        Aurora50 🌿
      </h1>
      <p style="color: #6B7280; margin-top: 10px; font-size: 16px;">
        Votre Renaissance commence maintenant
      </p>
    </div>

    <!-- BOUTON PRINCIPAL TRÈS VISIBLE -->
    <div style="background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899); padding: 3px; border-radius: 25px; margin-bottom: 40px;">
      <div style="background: white; border-radius: 23px; padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 28px; margin: 0 0 20px 0;">
          🎉 Bienvenue ${data.name} !
        </h2>
        <p style="color: #4B5563; font-size: 18px; margin: 0 0 30px 0; line-height: 1.6;">
          Votre inscription est confirmée.<br>
          <strong>Cliquez sur le bouton ci-dessous pour accéder immédiatement à votre espace :</strong>
        </p>
        
        <!-- GROS BOUTON DE CONNEXION -->
        <a href="${data.magicLink}" 
           style="display: inline-block; 
                  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
                  color: white; 
                  padding: 20px 60px; 
                  border-radius: 50px; 
                  text-decoration: none;
                  font-weight: bold;
                  font-size: 20px;
                  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
                  text-transform: uppercase;
                  letter-spacing: 1px;">
          🚀 ACCÉDER À MON ESPACE
        </a>
        
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 20px;">
          💡 Un simple clic et vous êtes connectée !<br>
          <small>(Lien valable 24 heures)</small>
        </p>
      </div>
    </div>

    <!-- Confirmation de paiement -->
    <div style="background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #E5E7EB;">
      <h3 style="color: #6B7280; font-size: 14px; text-transform: uppercase; margin: 0 0 15px 0;">
        Confirmation de paiement
      </h3>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="color: #111827; font-size: 24px; margin: 5px 0; font-weight: bold;">
            ${data.amount}€
          </p>
          <p style="color: #6B7280; font-size: 14px; margin: 5px 0;">
            Accès complet Aurora50
          </p>
        </div>
        <div style="text-align: right;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
            Référence<br>
            <strong>${data.sessionId.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Ce qui vous attend -->
    <div style="background: #F9FAFB; border-radius: 20px; padding: 30px; margin-bottom: 30px;">
      <h3 style="color: #111827; font-size: 20px; margin: 0 0 20px 0;">
        Ce qui vous attend dans votre espace 🎁
      </h3>
      <ul style="color: #4B5563; font-size: 16px; line-height: 2; padding-left: 20px;">
        <li>📚 <strong>Votre parcours personnalisé</strong> de transformation</li>
        <li>💬 <strong>La communauté bienveillante</strong> Aurora50</li>
        <li>🎯 <strong>Exercices et méditations</strong> guidées</li>
        <li>🌟 <strong>Suivi de votre progression</strong> en temps réel</li>
      </ul>
    </div>

    <!-- Rappel du bouton -->
    <div style="text-align: center; padding: 30px; background: #FEF3F2; border-radius: 20px; margin-bottom: 30px;">
      <p style="color: #111827; font-size: 18px; margin: 0 0 20px 0; font-weight: bold;">
        N'oubliez pas de cliquer sur le bouton pour vous connecter 👇
      </p>
      <a href="${data.magicLink}" 
         style="display: inline-block; 
                background: #EC4899;
                color: white; 
                padding: 15px 40px; 
                border-radius: 50px; 
                text-decoration: none;
                font-weight: bold;
                font-size: 18px;">
        ME CONNECTER MAINTENANT
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 14px; margin-bottom: 15px;">
        Des questions ? Répondez simplement à cet email.<br>
        Nous sommes là pour vous accompagner.
      </p>
      <p style="color: #6B7280; font-size: 16px; font-weight: 600;">
        Avec toute notre bienveillance,<br>
        L'équipe Aurora50 💜
      </p>
    </div>
    
  </div>
</body>
</html>
    `;

    // 3. ENVOYER L'EMAIL AVEC LE MAGIC LINK
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
          name: process.env.BREVO_SENDER_NAME || 'Aurora50 - Sigrid Larsen'
        },
        to: [{ 
          email: data.email, 
          name: data.name 
        }],
        subject: "🌟 [ACTION REQUISE] Cliquez pour accéder à Aurora50",
        htmlContent: htmlContent,
        tags: ['welcome', 'aurora50', 'magic-link', 'payment-success'],
        params: {
          amount: data.amount,
          sessionId: data.sessionId,
          name: data.name,
          magicLink: data.magicLink
        }
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    const result = await emailResponse.json();
    
    console.log('✅ Email avec Magic Link envoyé:', {
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

// Garder l'ancienne fonction pour compatibilité si besoin
export async function sendWelcomeEmail(data: any) {
  return sendWelcomeEmailWithMagicLink(data);
}

export async function sendReminderEmail(email: string, name: string) {
  console.log('Reminder email function placeholder');
}