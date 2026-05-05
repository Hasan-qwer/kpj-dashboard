import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KPJ Damansara — Voice Agent Dashboard',
  description: 'Monitor calls, appointments, and doctors for KPJ Damansara Specialist Hospital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
