'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Users, Activity, KeyRound, ArrowRight, Check, AlertCircle, Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

interface Stats {
  connectedUsers: number
  tokenRequests: number
  apiKeys: number
}

interface Checklist {
  hasCredentials: boolean
  hasApiKey: boolean
  hasConnectedUser: boolean
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({ connectedUsers: 0, tokenRequests: 0, apiKeys: 0 })
  const [checklist, setChecklist] = useState<Checklist>({ hasCredentials: false, hasApiKey: false, hasConnectedUser: false })
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch this from the API
    const fetchData = async () => {
      setLoading(false)
      // Mock data for demo
      setStats({ connectedUsers: 0, tokenRequests: 0, apiKeys: 1 })
      setChecklist({ hasCredentials: false, hasApiKey: true, hasConnectedUser: false })
      setApiKey('aa_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    }
    fetchData()
  }, [])

  const handleCopy = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const quickStartCode = `import { AgentAuth } from 'agentauth'

const auth = new AgentAuth('${apiKey || 'your-api-key'}')

// Generate a connect URL for your user
const url = await auth.getConnectUrl({
  userId: 'user_123',
  service: 'google',
  scopes: ['gmail.send'],
  redirectUrl: 'https://yourapp.com/connected'
})

// After they connect, get their token anytime
const token = await auth.getToken('user_123', 'google')

// Use the token with Google APIs
// Token auto-refreshes. Always valid.`

  const statCards = [
    { 
      label: 'Connected Users', 
      value: stats.connectedUsers, 
      icon: Users,
      color: 'text-blue-400'
    },
    { 
      label: 'Token Requests', 
      value: stats.tokenRequests, 
      icon: Activity,
      suffix: '(last 24h)',
      color: 'text-green-400'
    },
    { 
      label: 'API Keys', 
      value: stats.apiKeys, 
      icon: KeyRound,
      color: 'text-purple-400'
    },
  ]

  const checklistItems = [
    {
      label: 'Add Google OAuth credentials',
      completed: checklist.hasCredentials,
      href: '/dashboard/credentials',
      buttonText: 'Add credentials'
    },
    {
      label: 'Generate API key',
      completed: checklist.hasApiKey,
      href: '/dashboard/api-keys',
      buttonText: 'Generate key'
    },
    {
      label: 'Connect your first user',
      completed: checklist.hasConnectedUser,
      href: '/docs',
      buttonText: 'View docs',
      external: true
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || 'Developer'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your OAuth tokens
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div 
            key={stat.label}
            className="p-5 rounded-2xl bg-card border border-border card-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">
              {stat.label} {stat.suffix && <span className="text-xs">{stat.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Getting Started Checklist */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
        <div className="space-y-3">
          {checklistItems.map((item, i) => (
            <div 
              key={i}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                item.completed 
                  ? "bg-green-500/5 border-green-500/20" 
                  : "bg-muted/30 border-border hover:border-accent/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  item.completed 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {item.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{i + 1}</span>
                  )}
                </div>
                <span className={cn(
                  "font-medium",
                  item.completed && "text-muted-foreground line-through"
                )}>
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                <Link 
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  className="btn-ghost text-sm !px-3 !py-1.5"
                >
                  {item.buttonText}
                  {item.external ? (
                    <ExternalLink className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Key */}
      {apiKey && (
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your API Key</h2>
            <Link href="/dashboard/api-keys" className="text-sm text-accent hover:underline">
              Manage keys
            </Link>
          </div>
          <div className="flex items-center gap-2 p-4 rounded-xl bg-muted border border-border">
            <code className="flex-1 font-mono text-sm text-muted-foreground">
              {apiKey.slice(0, 12)}{'•'.repeat(20)}{apiKey.slice(-4)}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              {copied ? (
                <CheckCheck className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Keep this secret. Never share in public repositories.
          </p>
        </div>
      )}

      {/* Quick Start Code */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Quick Start</h2>
          <span className="text-xs text-muted-foreground font-mono">JavaScript</span>
        </div>
        <div className="code-block !border-0 !rounded-none">
          <SyntaxHighlighter
            language="javascript"
            style={vscDarkPlus}
            customStyle={{ 
              background: 'transparent', 
              padding: '1.5rem',
              margin: 0,
              fontSize: '0.85rem'
            }}
          >
            {quickStartCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
