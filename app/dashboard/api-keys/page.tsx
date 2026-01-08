'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, CheckCheck, Trash2, RefreshCw, Key, Eye, EyeOff, AlertCircle } from 'lucide-react'
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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/api-keys')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load API keys')
      }
      
      const keys: ApiKey[] = (data.apiKeys || []).map((k: {
        id: string
        name: string
        key_prefix: string
        created_at: string
        last_used_at: string | null
      }) => ({
        id: k.id,
        name: k.name,
        key: k.key_prefix + 'x'.repeat(32),
        prefix: k.key_prefix,
        createdAt: k.created_at,
        lastUsed: k.last_used_at,
      }))
      
      setApiKeys(keys)
    } catch (err) {
      console.error('Failed to load API keys:', err)
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Key ' + (apiKeys.length + 1)
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create API key')
      }
      
      const newApiKey: ApiKey = {
        id: data.apiKey.id,
        name: data.apiKey.name,
        key: data.apiKey.key,
        prefix: data.apiKey.prefix,
        createdAt: data.apiKey.createdAt,
        lastUsed: null,
        isNew: true
      }
      
      setApiKeys([newApiKey, ...apiKeys])
      setNewKey(data.apiKey.key)
      setShowKey(newApiKey.id)
      
    } catch (err) {
      console.error('Failed to generate API key:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate API key')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setError(null)
      
      const response = await fetch('/api/api-keys?id=' + id, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete API key')
      }
      
      setApiKeys(apiKeys.filter(k => k.id !== id))
      setDeleteConfirm(null)
      
    } catch (err) {
      console.error('Failed to delete API key:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete API key')
    }
  }

  const maskKey = (key: string) => {
    return key.slice(0, 12) + '\u2022'.repeat(20) + key.slice(-4)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading API keys...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
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

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-muted-foreground hover:text-foreground text-sm ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">Keep your API keys secure</p>
          <p className="text-sm text-muted-foreground mt-1">
            API keys grant full access to your AgentAuth account. Never share them in public repositories or client-side code.
          </p>
        </div>
      </div>

      {newKey && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-400">New API key created</p>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Copy this key now. You will not be able to see it again.
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
                  Created {formatDate(apiKey.createdAt)} {apiKey.lastUsed ? ' \u2022 Last used ' + formatDate(apiKey.lastUsed) : ' \u2022 Never used'}
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
                {showKey === apiKey.id && apiKey.isNew ? apiKey.key : maskKey(apiKey.key)}
              </code>
              <button
                onClick={() => handleCopy(apiKey.isNew ? apiKey.key : apiKey.key, apiKey.id)}
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

