import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UcfZem Tech — Outils',
  description: 'Outils techniques pour e-commerce et développement',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
