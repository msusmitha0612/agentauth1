'use client'

import { useState } from 'react'
import { Plus, Copy, CheckCheck, Trash2, RefreshCw, AlertTriangle, Key, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string
  createdAt: string
  lastUsed: string | null
  isNew?: boolean
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Default',
      key: 'aa_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      prefix: 'aa_live_',
      createdAt: new Date().toISOString(),
      lastUsed: null,
    }
  ])
  const [copied, setCopied] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const randomPart = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('')
    const fullKey = `aa_live_${randomPart}`
    
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      name: `Key ${apiKeys.length + 1}`,
      key: fullKey,
      prefix: 'aa_live_',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isNew: true
    }
    
    setApiKeys([newApiKey, ...apiKeys])
    setNewKey(fullKey)
    setShowKey(newApiKey.id)
    setIsGenerating(false)
  }

  const handleDelete = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
    setDeleteConfirm(null)
  }

  const maskKey = (key: string) => {
    return `${key.slice(0, 12)}${'•'.repeat(20)}${key.slice(-4)}`
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for authenticating with the AgentAuth API
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Generate new key
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">Keep your API keys secure</p>
          <p className="text-sm text-muted-foreground mt-1">
            API keys grant full access to your AgentAuth account. Never share them in public repositories or client-side code.
          </p>
        </div>
      </div>

      {/* New Key Alert */}
      {newKey && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-400">New API key created</p>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Copy this key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
                <code className="flex-1 font-mono text-sm break-all">{newKey}</code>
                <button
                  onClick={() => handleCopy(newKey, 'new')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                >
                  {copied === 'new' ? (
                    <CheckCheck className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={cn(
              "p-5 rounded-2xl bg-card border border-border card-hover",
              apiKey.isNew && "ring-2 ring-green-500/20"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {apiKey.name}
                  {apiKey.isNew && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      New
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Created {formatDate(apiKey.createdAt)} • {apiKey.lastUsed ? `Last used ${formatDate(apiKey.lastUsed)}` : 'Never used'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title={showKey === apiKey.id ? 'Hide key' : 'Show key'}
                >
                  {showKey === apiKey.id ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {deleteConfirm === apiKey.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(apiKey.id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
              <code className="flex-1 font-mono text-sm text-muted-foreground">
                {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
              </code>
              <button
                onClick={() => handleCopy(apiKey.key, apiKey.id)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                {copied === apiKey.id ? (
                  <CheckCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-card border border-border">
          <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API keys</h3>
          <p className="text-muted-foreground mb-4">
            Generate your first API key to start using AgentAuth
          </p>
          <button onClick={handleGenerate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Generate API key
          </button>
        </div>
      )}
    </div>
  )
}
