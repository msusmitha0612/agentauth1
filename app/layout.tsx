import { ClerkProvider } from '@clerk/nextjs'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'AgentAuth | OAuth infrastructure for AI agents',
  description: 'Your agent needs user permissions. We handle the tokens. OAuth token management made simple for AI developers.',
  keywords: ['oauth', 'ai', 'agents', 'authentication', 'tokens', 'google oauth', 'api'],
  authors: [{ name: 'AgentAuth' }],
  openGraph: {
    title: 'AgentAuth | OAuth infrastructure for AI agents',
    description: 'Your agent needs user permissions. We handle the tokens.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentAuth | OAuth infrastructure for AI agents',
    description: 'Your agent needs user permissions. We handle the tokens.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#0a0a0a',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          colorInputBackground: '#171717',
          colorInputText: '#fafafa',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-card border border-border',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          formButtonPrimary: 'bg-accent hover:bg-accent/90',
          footerActionLink: 'text-accent hover:text-accent/80',
          formFieldInput: 'bg-muted border-border',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
        }
      }}
    >
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
