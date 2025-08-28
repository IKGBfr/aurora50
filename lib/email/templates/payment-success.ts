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
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #F9FAFB; /* Gris Cocon */
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #FFFFFF;
          border-radius: 20px; /* Coins très arrondis */
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
          padding: 40px;
          text-align: center;
          background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899); /* Dégradé Signature */
        }
        .logo {
          font-size: 36px;
          font-weight: 800;
          color: white;
        }
        .content {
          padding: 40px;
        }
        h1 {
          font-size: 28px;
          font-weight: 800;
          color: #111827; /* Noir Profond */
          margin: 0 0 20px 0;
        }
        p {
          font-size: 18px; /* Police plus grande */
          line-height: 1.7;
          color: #4B5563; /* Gris de Lecture */
          margin-bottom: 25px;
        }
        .cta-section {
          margin: 40px 0;
          padding: 30px;
          background-color: #F9FAFB; /* Gris Cocon */
          border-radius: 16px;
        }
        h2 {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 20px 0;
        }
        .steps {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .steps li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .steps li:last-child {
          margin-bottom: 0;
        }
        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #10B981, #8B5CF6);
          color: white;
          font-size: 18px;
          font-weight: 700;
          border-radius: 50%;
          margin-right: 20px;
        }
        .step-text {
          font-size: 16px;
          line-height: 1.6;
          color: #4B5563;
        }
        .footer {
          text-align: center;
          padding: 30px 40px;
          border-top: 1px solid #E5E7EB;
          font-size: 14px;
          color: #6B7280;
        }
        .footer a {
          color: #8B5CF6; /* Violet Indigo */
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Aurora50</div>
        </div>

        <div class="content">
          <h1>Bienvenue dans votre cocon, ${data.name} ! 🌿</h1>
          
          <p>Félicitations ! Votre inscription est confirmée. Nous sommes infiniment heureux de vous accueillir dans la communauté Aurora50. La décision de commencer ce voyage est le premier pas le plus important, et vous l'avez fait.</p>

          <div class="cta-section">
            <h2>🚀 Vos prochaines étapes</h2>
            <ul class="steps">
              <li>
                <div class="step-number">1</div>
                <div class="step-text">
                  <strong>Accédez à votre espace membre</strong><br>
                  Vous allez recevoir dans un instant un second email avec votre lien de connexion personnel et sécurisé.
                </div>
              </li>
              <li>
                <div class="step-number">2</div>
                <div class="step-text">
                  <strong>Rejoignez la communauté</strong><br>
                  Une fois connecté(e), vous trouverez le lien pour rejoindre notre groupe Telegram privé.
                </div>
              </li>
              <li>
                <div class="step-number">3</div>
                <div class="step-text">
                  <strong>Explorez votre premier module</strong><br>
                  Votre voyage de transformation commence dès votre première connexion.
                </div>
              </li>
            </ul>
          </div>

          <p>Gardez cet email précieusement. Il confirme votre accès à Aurora50 du ${data.date} au ${formattedEndDate}.</p>
        </div>

        <div class="footer">
          <p>
            Des questions ? <a href="mailto:sigrid@aurora50.fr">Contactez-nous</a>.<br>
            Pour gérer votre abonnement, accédez à votre <a href="https://billing.stripe.com/p/login/test_9AQaEY5g94Oad5C144">espace client</a>.
          </p>
          <p style="font-size: 12px; margin-top: 20px;">© 2024 Aurora50. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
