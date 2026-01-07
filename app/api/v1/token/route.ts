import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashApiKey } from '@/lib/api-key'
import { decrypt, encrypt } from '@/lib/encryption'
import { refreshAccessToken } from '@/lib/google-oauth'

export async function GET(req: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'invalid_api_key', message: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.slice(7)
    const keyHash = hashApiKey(apiKey)

    // Validate API key
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from('api_keys')
      .select('developer_id, is_active')
      .eq('key_hash', keyHash)
      .single()

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json(
        { error: 'invalid_api_key', message: 'The API key provided is invalid or inactive.' },
        { status: 401 }
      )
    }

    if (!apiKeyData.is_active) {
      return NextResponse.json(
        { error: 'invalid_api_key', message: 'This API key has been deactivated.' },
        { status: 401 }
      )
    }

    // Update last_used_at
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash)

    const developerId = apiKeyData.developer_id

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const service = searchParams.get('service') || 'google'

    if (!userId) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'userId is required' },
        { status: 400 }
      )
    }

    // Look up user token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_tokens')
      .select('*')
      .eq('developer_id', developerId)
      .eq('external_user_id', userId)
      .eq('service', service)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'user_not_connected', message: 'This user has not connected their Google account. Generate a connect URL first.' },
        { status: 404 }
      )
    }

    // Check if token is expired (with 5 minute buffer)
    const tokenExpiry = new Date(tokenData.token_expiry)
    const now = new Date()
    const bufferMs = 5 * 60 * 1000 // 5 minutes

    if (tokenExpiry.getTime() - bufferMs <= now.getTime()) {
      // Token expired or about to expire, refresh it
      try {
        // Get developer's Google credentials
        const { data: credentials, error: credError } = await supabaseAdmin
          .from('google_credentials')
          .select('client_id, client_secret_encrypted')
          .eq('developer_id', developerId)
          .single()

        if (credError || !credentials) {
          return NextResponse.json(
            { error: 'credentials_not_configured', message: 'Google OAuth credentials not configured.' },
            { status: 400 }
          )
        }

        const clientSecret = decrypt(credentials.client_secret_encrypted)
        const refreshToken = decrypt(tokenData.refresh_token_encrypted)

        const newTokens = await refreshAccessToken({
          refreshToken,
          clientId: credentials.client_id,
          clientSecret
        })

        // Update token in database
        const newExpiry = new Date(Date.now() + newTokens.expiresIn * 1000)
        
        await supabaseAdmin
          .from('user_tokens')
          .update({
            access_token_encrypted: encrypt(newTokens.accessToken),
            token_expiry: newExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', tokenData.id)

        return NextResponse.json({
          success: true,
          accessToken: newTokens.accessToken,
          expiresAt: newExpiry.toISOString(),
          scopes: tokenData.scopes
        })

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        return NextResponse.json(
          { error: 'refresh_failed', message: 'Failed to refresh token. User may need to reconnect.' },
          { status: 400 }
        )
      }
    }

    // Token is valid, decrypt and return
    const accessToken = decrypt(tokenData.access_token_encrypted)

    return NextResponse.json({
      success: true,
      accessToken,
      expiresAt: tokenData.token_expiry,
      scopes: tokenData.scopes
    })

  } catch (error) {
    console.error('Token endpoint error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
