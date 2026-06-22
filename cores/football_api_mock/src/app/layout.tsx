import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Football API Mock — Betlandia',
  description: 'Mock football data API with simulation dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  )
}
