import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const { email, userId } = await request.json()
  
  console.log('[API] Sending verification email to:', email, 'for user:', userId)
  
  // Générer un token unique
  const verificationToken = randomUUID()
  
  // Stocker le token dans profiles
  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      email_verification_token: verificationToken,
      email_verified: false 
    })
    .eq('id', userId)
  
  if (updateError) {
    console.error('[API] Erreur lors de la mise à jour du profil:', updateError)
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la préparation de la vérification'
    }, { status: 500 })
  }
  
  // URL avec notre token custom
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://www.aurora50.fr'}/auth/confirm?token=${verificationToken}`

  // Envoyer via Brevo
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: "Aurora50",
        email: "noreply@aurora50.fr"
      },
      to: [{ email }],
      subject: "Confirmez votre email - Aurora50 🌿",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899); color: white !important; text-decoration: none; border-radius: 50px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur Aurora50 🌿</h1>
            </div>
            <div class="content">
              <h2>Une dernière étape...</h2>
              <p>Merci de rejoindre Aurora50 ! Pour sécuriser votre compte, confirmez votre email :</p>
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button">Confirmer mon email</a>
              </div>
              <p style="font-size: 12px; color: #666;">Si le bouton ne fonctionne pas, copiez ce lien :<br/>${confirmUrl}</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  })

  const result = await response.json()
  console.log('[API] Brevo response:', result)
  
  return NextResponse.json({ 
    success: response.ok,
    messageId: result?.messageId,
    brevoResponse: result
  })
}
