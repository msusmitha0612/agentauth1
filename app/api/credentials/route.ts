import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { encrypt, decrypt } from '@/lib/encryption'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/credentials - Get current credentials (masked)
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in.' },
        { status: 401 }
      )
    }

    // Get developer_id
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (devError || !developer) {
      return NextResponse.json(
        { error: 'developer_not_found', message: 'Developer account not found.' },
        { status: 404 }
      )
    }

    // Get credentials
    const { data: credentials, error: credError } = await supabase
      .from('google_credentials')
      .select('id, client_id, redirect_uri, created_at, updated_at')
      .eq('developer_id', developer.id)
      .single()

    if (credError || !credentials) {
      return NextResponse.json({
        success: true,
        credentials: null
      })
    }

    return NextResponse.json({
      success: true,
      credentials: {
        id: credentials.id,
        clientId: credentials.client_id,
        redirectUri: credentials.redirect_uri,
        createdAt: credentials.created_at,
        updatedAt: credentials.updated_at,
      }
    })

  } catch (error) {
    console.error('Credentials fetch error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

// POST /api/credentials - Save or update credentials
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { clientId, clientSecret, redirectUri } = body

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Client ID and Client Secret are required.' },
        { status: 400 }
      )
    }

    // Get developer_id
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (devError || !developer) {
      return NextResponse.json(
        { error: 'developer_not_found', message: 'Developer account not found.' },
        { status: 404 }
      )
    }

    // Encrypt the client secret
    const encryptedSecret = encrypt(clientSecret)

    // Check if credentials already exist
    const { data: existing } = await supabase
      .from('google_credentials')
      .select('id')
      .eq('developer_id', developer.id)
      .single()

    let result
    if (existing) {
      // Update existing
      result = await supabase
        .from('google_credentials')
        .update({
          client_id: clientId,
          client_secret_encrypted: encryptedSecret,
          redirect_uri: redirectUri || 'https://agentauth.online/api/oauth/callback',
          updated_at: new Date().toISOString(),
        })
        .eq('developer_id', developer.id)
        .select('id, client_id, redirect_uri, created_at, updated_at')
        .single()
    } else {
      // Insert new
      result = await supabase
        .from('google_credentials')
        .insert({
          developer_id: developer.id,
          client_id: clientId,
          client_secret_encrypted: encryptedSecret,
          redirect_uri: redirectUri || 'https://agentauth.online/api/oauth/callback',
        })
        .select('id, client_id, redirect_uri, created_at, updated_at')
        .single()
    }

    if (result.error) {
      console.error('Credentials save error:', result.error)
      return NextResponse.json(
        { error: 'save_failed', message: 'Failed to save credentials.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      credentials: {
        id: result.data.id,
        clientId: result.data.client_id,
        redirectUri: result.data.redirect_uri,
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at,
      }
    })

  } catch (error) {
    console.error('Credentials save error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

// DELETE /api/credentials - Remove credentials
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in.' },
        { status: 401 }
      )
    }

    // Get developer_id
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (devError || !developer) {
      return NextResponse.json(
        { error: 'developer_not_found', message: 'Developer account not found.' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('google_credentials')
      .delete()
      .eq('developer_id', developer.id)

    if (deleteError) {
      console.error('Credentials delete error:', deleteError)
      return NextResponse.json(
        { error: 'delete_failed', message: 'Failed to delete credentials.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Credentials delete error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
