import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { exchangeCodeForTokens, parseScopesFromGoogle } from '@/lib/google-oauth'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle Google errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/oauth-error?error=${encodeURIComponent(error)}`, process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/oauth-error?error=missing_params', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Look up OAuth state
    const { data: oauthState, error: stateError } = await supabaseAdmin
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single()

    if (stateError || !oauthState) {
      console.error('Invalid OAuth state:', stateError)
      return NextResponse.redirect(
        new URL('/oauth-error?error=invalid_state', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Check if state is expired
    if (new Date(oauthState.expires_at) < new Date()) {
      // Delete expired state
      await supabaseAdmin.from('oauth_states').delete().eq('id', oauthState.id)
      return NextResponse.redirect(
        new URL('/oauth-error?error=state_expired', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Get developer's Google credentials
    const { data: credentials, error: credError } = await supabaseAdmin
      .from('google_credentials')
      .select('client_id, client_secret_encrypted')
      .eq('developer_id', oauthState.developer_id)
      .single()

    if (credError || !credentials) {
      console.error('Missing credentials:', credError)
      return redirectWithError(oauthState.redirect_url, 'credentials_not_found', oauthState.external_user_id)
    }

    // Decrypt client secret
    const clientSecret = decrypt(credentials.client_secret_encrypted)

    // Exchange code for tokens
    let tokens
    try {
      tokens = await exchangeCodeForTokens({
        code,
        clientId: credentials.client_id,
        clientSecret,
        redirectUri: process.env.GOOGLE_OAUTH_CALLBACK_URL!
      })
    } catch (exchangeError) {
      console.error('Token exchange failed:', exchangeError)
      return redirectWithError(oauthState.redirect_url, 'token_exchange_failed', oauthState.external_user_id)
    }

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000)

    // Parse scopes
    const scopes = parseScopesFromGoogle(tokens.scope)

    // Encrypt tokens
    const accessTokenEncrypted = encrypt(tokens.accessToken)
    const refreshTokenEncrypted = encrypt(tokens.refreshToken)

    // Store/update user token (upsert)
    const { error: upsertError } = await supabaseAdmin
      .from('user_tokens')
      .upsert({
        developer_id: oauthState.developer_id,
        external_user_id: oauthState.external_user_id,
        service: oauthState.service,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_expiry: tokenExpiry.toISOString(),
        scopes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'developer_id,external_user_id,service'
      })

    if (upsertError) {
      console.error('Failed to store token:', upsertError)
      return redirectWithError(oauthState.redirect_url, 'storage_failed', oauthState.external_user_id)
    }

    // Delete the OAuth state
    await supabaseAdmin.from('oauth_states').delete().eq('id', oauthState.id)

    // Redirect to developer's redirect URL with success
    if (oauthState.redirect_url) {
      const redirectUrl = new URL(oauthState.redirect_url)
      redirectUrl.searchParams.set('success', 'true')
      redirectUrl.searchParams.set('userId', oauthState.external_user_id)
      return NextResponse.redirect(redirectUrl.toString())
    }

    // If no redirect URL, show success page
    return NextResponse.redirect(
      new URL(`/oauth-success?userId=${encodeURIComponent(oauthState.external_user_id)}`, process.env.NEXT_PUBLIC_APP_URL!)
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/oauth-error?error=internal_error', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}

function redirectWithError(redirectUrl: string | null, error: string, userId: string) {
  if (redirectUrl) {
    const url = new URL(redirectUrl)
    url.searchParams.set('error', error)
    url.searchParams.set('userId', userId)
    return NextResponse.redirect(url.toString())
  }
  
  return NextResponse.redirect(
    new URL(`/oauth-error?error=${error}`, process.env.NEXT_PUBLIC_APP_URL!)
  )
}
