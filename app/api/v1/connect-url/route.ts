import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashApiKey } from '@/lib/api-key'
import { buildAuthUrl, SCOPE_MAP } from '@/lib/google-oauth'
import { decrypt } from '@/lib/encryption'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json()
    const { userId, service = 'google', scopes = ['gmail.readonly'], redirectUrl } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'userId is required' },
        { status: 400 }
      )
    }

    if (service !== 'google') {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Only google service is supported currently' },
        { status: 400 }
      )
    }

    // Validate scopes
    const invalidScopes = scopes.filter((s: string) => !SCOPE_MAP[s])
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: 'invalid_request', message: `Invalid scopes: ${invalidScopes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get developer's Google credentials
    const { data: credentials, error: credError } = await supabaseAdmin
      .from('google_credentials')
      .select('client_id, client_secret_encrypted')
      .eq('developer_id', developerId)
      .single()

    if (credError || !credentials) {
      return NextResponse.json(
        { error: 'credentials_not_configured', message: 'Google OAuth credentials not configured. Visit dashboard to add them.' },
        { status: 400 }
      )
    }

    // Generate state token
    const state = crypto.randomBytes(32).toString('hex')

    // Store OAuth state
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const { error: stateError } = await supabaseAdmin
      .from('oauth_states')
      .insert({
        state,
        developer_id: developerId,
        external_user_id: userId,
        service,
        redirect_url: redirectUrl || null,
        expires_at: expiresAt.toISOString()
      })

    if (stateError) {
      console.error('Failed to store OAuth state:', stateError)
      return NextResponse.json(
        { error: 'internal_error', message: 'Failed to generate connect URL' },
        { status: 500 }
      )
    }

    // Build Google OAuth URL
    const connectUrl = buildAuthUrl({
      clientId: credentials.client_id,
      redirectUri: process.env.GOOGLE_OAUTH_CALLBACK_URL!,
      scopes,
      state
    })

    return NextResponse.json({
      success: true,
      connectUrl,
      expiresIn: 600 // 10 minutes
    })

  } catch (error) {
    console.error('Connect URL error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
