'use client'

import Link from 'next/link'
import { ArrowLeft, Key, ExternalLink } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function DocsPage() {
  const installCode = `npm install agentauth`

  const quickStartCode = `import { AgentAuth } from 'agentauth'

const auth = new AgentAuth('your-api-key')

// 1. Generate a connect URL for your user
const url = await auth.getConnectUrl({
  userId: 'user_123',
  service: 'google',
  scopes: ['gmail.send'],
  redirectUrl: 'https://yourapp.com/connected'
})

// 2. Redirect your user to this URL
// They will see Google's consent screen

// 3. After they approve, get their token anytime
const token = await auth.getToken('user_123', 'google')

// 4. Use the token with Google APIs
// Token auto-refreshes. Always valid.`

  const errorHandlingCode = `import { AgentAuth } from 'agentauth'

const auth = new AgentAuth('your-api-key')

try {
  const token = await auth.getToken('user_123', 'google')
  // Use token with Google APIs
} catch (error) {
  if (error.message.includes('not connected')) {
    // User needs to connect their account first
    const url = await auth.getConnectUrl({ 
      userId: 'user_123', 
      service: 'google' 
    })
    // Redirect user to url
  }
}`

  const scopes = [
    { scope: 'gmail.readonly', description: 'Read emails' },
    { scope: 'gmail.send', description: 'Send emails' },
    { scope: 'gmail.full', description: 'Full Gmail access' },
    { scope: 'calendar.readonly', description: 'Read calendar events' },
    { scope: 'calendar.write', description: 'Read and write calendar events' },
    { scope: 'drive.readonly', description: 'Read Drive files' },
    { scope: 'drive.file', description: 'Read and write Drive files' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">
              Agent<span className="text-accent">Auth</span>
            </span>
          </Link>
          <Link href="/dashboard" className="btn-ghost text-sm">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Everything you need to integrate AgentAuth into your application.
        </p>

        {/* Installation */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4" id="installation">Installation</h2>
          <div className="code-block">
            <SyntaxHighlighter
              language="bash"
              style={vscDarkPlus}
              customStyle={{ background: 'transparent', padding: '1.25rem', margin: 0 }}
            >
              {installCode}
            </SyntaxHighlighter>
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4" id="quickstart">Quick Start</h2>
          <div className="code-block">
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{ background: 'transparent', padding: '1.25rem', margin: 0, fontSize: '0.85rem' }}
            >
              {quickStartCode}
            </SyntaxHighlighter>
          </div>
        </section>

        {/* Available Scopes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4" id="scopes">Available Scopes</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-sm">Scope</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {scopes.map((item, i) => (
                  <tr key={item.scope} className={i !== scopes.length - 1 ? 'border-b border-border' : ''}>
                    <td className="px-4 py-3">
                      <code className="text-sm text-accent bg-accent/10 px-2 py-1 rounded">{item.scope}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" id="api">API Reference</h2>
          
          {/* getConnectUrl */}
          <div className="mb-8 p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-2">
              <code className="text-accent">auth.getConnectUrl(options)</code>
            </h3>
            <p className="text-muted-foreground mb-4">
              Generates a URL for users to connect their Google account.
            </p>
            <h4 className="font-medium mb-2">Options:</h4>
            <ul className="space-y-1 text-muted-foreground mb-4">
              <li><code className="text-foreground">userId</code> (required): Your internal user ID</li>
              <li><code className="text-foreground">service</code> (required): 'google'</li>
              <li><code className="text-foreground">scopes</code> (optional): Array of scopes. Default: ['gmail.readonly']</li>
              <li><code className="text-foreground">redirectUrl</code> (optional): Where to redirect after connection</li>
            </ul>
            <h4 className="font-medium mb-2">Returns:</h4>
            <p className="text-muted-foreground"><code className="text-foreground">Promise&lt;string&gt;</code> - The OAuth URL</p>
          </div>

          {/* getToken */}
          <div className="mb-8 p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-2">
              <code className="text-accent">auth.getToken(userId, service)</code>
            </h3>
            <p className="text-muted-foreground mb-4">
              Gets a valid access token for a user. Automatically refreshes if expired.
            </p>
            <h4 className="font-medium mb-2">Parameters:</h4>
            <ul className="space-y-1 text-muted-foreground mb-4">
              <li><code className="text-foreground">userId</code> (required): Your internal user ID</li>
              <li><code className="text-foreground">service</code> (optional): 'google' (default)</li>
            </ul>
            <h4 className="font-medium mb-2">Returns:</h4>
            <p className="text-muted-foreground"><code className="text-foreground">Promise&lt;string&gt;</code> - A valid access token</p>
          </div>

          {/* isConnected */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-2">
              <code className="text-accent">auth.isConnected(userId, service)</code>
            </h3>
            <p className="text-muted-foreground mb-4">
              Checks if a user has connected their account.
            </p>
            <h4 className="font-medium mb-2">Returns:</h4>
            <p className="text-muted-foreground"><code className="text-foreground">Promise&lt;boolean&gt;</code></p>
          </div>
        </section>

        {/* Error Handling */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4" id="errors">Error Handling</h2>
          <div className="code-block">
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{ background: 'transparent', padding: '1.25rem', margin: 0, fontSize: '0.85rem' }}
            >
              {errorHandlingCode}
            </SyntaxHighlighter>
          </div>
        </section>

        {/* Help */}
        <section className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-xl font-bold mb-2">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you have questions or run into issues, we're here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="mailto:hello@agentauth.dev" 
              className="btn-secondary text-sm"
            >
              Email support
            </a>
            <a 
              href="https://github.com" 
              target="_blank"
              className="btn-ghost text-sm"
            >
              GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-muted-foreground text-sm">
          © 2025 AgentAuth. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
