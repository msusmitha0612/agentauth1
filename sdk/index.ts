/**
 * AgentAuth SDK
 * OAuth token management for AI agents
 * 
 * @example
 * ```typescript
 * import { AgentAuth } from 'agentauth'
 * 
 * const auth = new AgentAuth('your-api-key')
 * 
 * // Generate a connect URL
 * const url = await auth.getConnectUrl({
 *   userId: 'user_123',
 *   service: 'google',
 *   scopes: ['gmail.send'],
 *   redirectUrl: 'https://yourapp.com/connected'
 * })
 * 
 * // Get a valid token
 * const token = await auth.getToken('user_123', 'google')
 * ```
 */

export interface ConnectUrlOptions {
  /** Your internal user ID */
  userId: string
  /** Service to connect (currently only 'google') */
  service: 'google'
  /** OAuth scopes to request */
  scopes?: string[]
  /** URL to redirect after successful connection */
  redirectUrl?: string
}

export interface ConnectUrlResponse {
  success: boolean
  connectUrl: string
  expiresIn: number
}

export interface TokenResponse {
  success: boolean
  accessToken: string
  expiresAt: string
  scopes: string[]
}

export interface AgentAuthOptions {
  /** Custom API base URL (defaults to https://agentauth.dev) */
  baseUrl?: string
}

export class AgentAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AgentAuthError'
  }
}

export class AgentAuth {
  private apiKey: string
  private baseUrl: string

  /**
   * Create a new AgentAuth client
   * @param apiKey - Your AgentAuth API key
   * @param options - Configuration options
   */
  constructor(apiKey: string, options?: AgentAuthOptions) {
    if (!apiKey) {
      throw new AgentAuthError('API key is required', 'missing_api_key')
    }
    
    this.apiKey = apiKey
    this.baseUrl = options?.baseUrl || 'https://agentauth.dev'
  }

  /**
   * Generate a connect URL for a user to authorize their Google account
   * @param options - Connect URL options
   * @returns The OAuth URL to redirect the user to
   */
  async getConnectUrl(options: ConnectUrlOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/v1/connect-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: options.userId,
        service: options.service,
        scopes: options.scopes || ['gmail.readonly'],
        redirectUrl: options.redirectUrl,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new AgentAuthError(
        data.message || 'Failed to generate connect URL',
        data.error || 'unknown_error',
        response.status
      )
    }

    return data.connectUrl
  }

  /**
   * Get a valid access token for a user
   * Tokens are automatically refreshed if expired
   * @param userId - Your internal user ID
   * @param service - Service to get token for (default: 'google')
   * @returns A valid access token
   */
  async getToken(userId: string, service: 'google' = 'google'): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/token?userId=${encodeURIComponent(userId)}&service=${service}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new AgentAuthError(
        data.message || 'Failed to get token',
        data.error || 'unknown_error',
        response.status
      )
    }

    return data.accessToken
  }

  /**
   * Get full token details including expiry and scopes
   * @param userId - Your internal user ID
   * @param service - Service to get token for (default: 'google')
   * @returns Token details
   */
  async getTokenDetails(userId: string, service: 'google' = 'google'): Promise<TokenResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/token?userId=${encodeURIComponent(userId)}&service=${service}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new AgentAuthError(
        data.message || 'Failed to get token',
        data.error || 'unknown_error',
        response.status
      )
    }

    return data
  }

  /**
   * Check if a user has connected their account
   * @param userId - Your internal user ID
   * @param service - Service to check (default: 'google')
   * @returns true if user is connected
   */
  async isConnected(userId: string, service: 'google' = 'google'): Promise<boolean> {
    try {
      await this.getToken(userId, service)
      return true
    } catch (error) {
      if (error instanceof AgentAuthError && error.code === 'user_not_connected') {
        return false
      }
      throw error
    }
  }
}

export default AgentAuth
