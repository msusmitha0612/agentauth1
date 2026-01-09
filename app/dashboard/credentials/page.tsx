'use client'

import { useState, useEffect } from 'react'
import { Copy, CheckCheck, ExternalLink, Check, AlertCircle, Loader2, Settings, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CredentialsPage() {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const callbackUrl = 'https://agentauth.online/api/oauth/callback'

  useEffect(() => {
    loadCredentials()
  }, [])

  const loadCredentials = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/credentials')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load credentials')
      }

      if (data.credentials) {
        setClientId(data.credentials.clientId || '')
        setIsConfigured(true)
      } else {
        setIsConfigured(false)
      }
    } catch (err) {
      console.error('Failed to load credentials:', err)
      setError(err instanceof Error ? err.message : 'Failed to load credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(callbackUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Both Client ID and Client Secret are required')
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          redirectUri: callbackUrl,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save credentials')
      }

      setIsConfigured(true)
      setSuccess(true)
      setClientSecret('') // Clear secret after saving
    } catch (err) {
      console.error('Failed to save credentials:', err)
      setError(err instanceof Error ? err.message : 'Failed to save credentials')
    } finally {
      setIsSaving(false)
    }
  }

  const steps = [
    {
      title: 'Create a Google Cloud Project',
      content: (
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            Go to{' '}
            <a 
              href="https://console.cloud.google.com" 
              target="_blank"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              Google Cloud Console
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>Create a new project or select an existing one</li>
          <li>Enable the APIs you need (Gmail, Calendar, Drive, etc.)</li>
        </ol>
      )
    },
    {
      title: 'Create OAuth Credentials',
      content: (
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Go to APIs & Services then Credentials</li>
          <li>Click Create Credentials then OAuth client ID</li>
          <li>Select Web application</li>
          <li>
            Add this redirect URI:
            <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
              <code className="flex-1 font-mono text-sm text-foreground break-all">
                {callbackUrl}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? (
                  <CheckCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </li>
          <li>Copy your Client ID and Client Secret</li>
        </ol>
      )
    },
    {
      title: 'Add your credentials here',
      content: null
    }
  ]

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading credentials...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Google OAuth Credentials</h1>
        <p className="text-muted-foreground mt-1">
          Connect your Google Cloud project to enable OAuth for your users
        </p>
      </div>

      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border",
        isConfigured 
          ? "bg-green-500/10 border-green-500/20" 
          : "bg-amber-500/10 border-amber-500/20"
      )}>
        {isConfigured ? (
          <>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400">Credentials configured</p>
              <p className="text-sm text-muted-foreground">Your Google OAuth credentials are set up and ready to use</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-400">Not configured</p>
              <p className="text-sm text-muted-foreground">Add your Google OAuth credentials to get started</p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-semibold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-3">{step.title}</h3>
                {step.content}
                
                {i === 2 && (
                  <form onSubmit={handleSave} className="space-y-4 mt-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                        Credentials saved successfully!
                      </div>
                    )}

                    <div>
                      <label className="label">Client ID</label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="123456789-xxxxxxxxxx.apps.googleusercontent.com"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label">Client Secret {isConfigured && '(enter new value to update)'}</label>
                      <input
                        type="password"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder={isConfigured ? "Enter new secret to update" : "GOCSPX-xxxxxxxxxxxxxxxxxx"}
                        className="input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4" />
                          {isConfigured ? 'Update credentials' : 'Save credentials'}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Why do I need to add my own credentials?</strong>
          <br />
          Your users will see your app name on Google's consent screen, not AgentAuth's. This means a seamless, white-label experience for your users. Your credentials are encrypted and stored securely.
        </p>
      </div>
    </div>
  )
}
