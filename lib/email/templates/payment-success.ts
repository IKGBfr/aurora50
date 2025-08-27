export interface EmailData {
  name: string;
  email: string;
  amount: number;
  sessionId: string;
  date: string;
}

export const getPaymentSuccessTemplate = (data: EmailData): string => {
  // Calculer la date de fin (1 mois après)
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  const formattedEndDate = endDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f7f7;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .welcome-box {
          background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .info-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .info-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        .cta-section {
          margin: 30px 0;
          padding: 25px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .steps {
          list-style: none;
          padding: 0;
        }
        .steps li {
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .steps li:last-child {
          border-bottom: none;
        }
        .step-number {
          display: inline-block;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%);
          color: white;
          text-align: center;
          line-height: 30px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #666;
          font-size: 14px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          margin: 0 10px;
          color: #8B5CF6;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Aurora50</div>
          <p style="color: #666;">Programme de transformation personnelle</p>
        </div>

        <h1>Bienvenue ${data.name} ! 🌟</h1>
        
        <div class="welcome-box">
          <h2 style="margin-top: 0; color: white;">Votre inscription est confirmée !</h2>
          <p style="color: white;">Félicitations pour avoir pris cette décision importante pour votre développement personnel. Vous faites maintenant partie de la communauté Aurora50.</p>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Montant payé</div>
            <div class="info-value">${data.amount}€</div>
          </div>
          <div class="info-item">
            <div class="info-label">Période de validité</div>
            <div class="info-value" style="font-size: 14px; line-height: 1.4;">
              Du ${data.date}<br>
              Au ${formattedEndDate}
            </div>
          </div>
        </div>

        <div class="cta-section">
          <h2>🚀 Prochaines étapes</h2>
          <ul class="steps">
            <li>
              <span class="step-number">1</span>
              <strong>Rejoignez le groupe WhatsApp</strong><br>
              Accédez à notre communauté privée pour échanger avec les autres membres
            </li>
            <li>
              <span class="step-number">2</span>
              <strong>Accédez à votre premier module</strong><br>
              Commencez votre transformation dès aujourd'hui avec notre contenu exclusif
            </li>
            <li>
              <span class="step-number">3</span>
              <strong>Participez au prochain appel de groupe</strong><br>
              Chaque semaine, retrouvons-nous pour approfondir votre pratique
            </li>
          </ul>

          <center>
            <a href="https://wa.me/33766743192?text=Bonjour,%20je%20viens%20de%20m'inscrire%20à%20Aurora50" class="button" style="color: white !important;">
              📱 Rejoindre le groupe WhatsApp
            </a>
          </center>
        </div>

        <div style="background: #fff9e6; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <strong>💡 Conseil :</strong> Gardez cet email précieusement, il contient toutes les informations importantes pour bien démarrer.
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <small>
            <strong>Référence de paiement :</strong> ${data.sessionId}<br>
            Cette référence peut être utile si vous avez besoin de nous contacter concernant votre inscription.
          </small>
        </div>

        <div class="footer">
          <p>Des questions ? Besoin d'aide ?</p>
          <div class="social-links">
            <a href="https://wa.me/33766743192">WhatsApp</a>
            <a href="mailto:hello@aurora50.fr">Email</a>
            <a href="https://www.aurora50.fr">Site web</a>
          </div>
          <p>
            Avec gratitude,<br>
            <strong>Sigrid Larsen</strong><br>
            Fondatrice d'Aurora50
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <small>
            © 2024 Aurora50. Tous droits réservés.<br>
            Vous recevez cet email car vous venez de vous inscrire à Aurora50.<br>
            Pour gérer votre abonnement, connectez-vous à votre <a href="https://billing.stripe.com/p/login/test_9AQaEY5g94Oad5C144" style="color: #8B5CF6;">espace client Stripe</a>.
          </small>
        </div>
      </div>
    </body>
    </html>
  `;
};