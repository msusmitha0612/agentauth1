export interface Developer {
  id: string
  clerk_id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  developer_id: string
  key_prefix: string
  key_hash: string
  name: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export interface GoogleCredentials {
  id: string
  developer_id: string
  client_id: string
  client_secret_encrypted: string
  redirect_uri: string
  created_at: string
  updated_at: string
}

export interface UserToken {
  id: string
  developer_id: string
  external_user_id: string
  service: string
  access_token_encrypted: string
  refresh_token_encrypted: string
  token_expiry: string
  scopes: string[]
  created_at: string
  updated_at: string
}

export interface OAuthState {
  id: string
  state: string
  developer_id: string
  external_user_id: string
  service: string
  redirect_url: string | null
  expires_at: string
  created_at: string
}

export interface ConnectUrlRequest {
  userId: string
  service: 'google'
  scopes?: string[]
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

export interface ApiError {
  error: string
  message: string
}
