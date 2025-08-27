import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { EmotionRegistry } from '@/lib/emotion'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aurora50 - Votre Renaissance Après 50 Ans',
  description: 'Rejoignez la communauté premium de transformation personnelle après 50 ans. Sessions hebdomadaires avec Sigrid, psychologue spécialisée.',
  keywords: 'transformation 50 ans, développement personnel, psychologie, communauté',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'Aurora50 - Votre Renaissance Après 50 Ans',
    description: 'Communauté premium de transformation après 50 ans',
    images: ['/logo.png'],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  )
}
