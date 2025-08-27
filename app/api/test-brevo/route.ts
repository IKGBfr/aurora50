import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tester la connexion à Brevo
    const response = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || ''
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({
        status: 'error',
        message: 'Brevo API connection failed',
        error
      }, { status: 500 });
    }

    const account = await response.json();
    
    // Vérifier la liste #15
    const listResponse = await fetch('https://api.brevo.com/v3/contacts/lists/15', {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || ''
      }
    });

    const list = listResponse.ok ? await listResponse.json() : null;

    return NextResponse.json({
      status: 'success',
      account: {
        email: account.email,
        companyName: account.companyName
      },
      list: list ? {
        id: list.id,
        name: list.name,
        totalSubscribers: list.totalSubscribers
      } : 'List #15 not accessible',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
