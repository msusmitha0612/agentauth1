import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { generateApiKey } from '@/lib/api-key'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is logged in
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in to create an API key.' },
        { status: 401 }
      )
    }

    // 2. Get developer_id from clerk_id
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (devError || !developer) {
      console.error('Developer lookup error:', devError)
      return NextResponse.json(
        { error: 'developer_not_found', message: 'Developer account not found. Please contact support.' },
        { status: 404 }
      )
    }

    // 3. Parse request body for optional name
    let name = 'Default'
    try {
      const body = await request.json()
      if (body.name) {
        name = body.name
      }
    } catch {
      // No body or invalid JSON is fine, use default name
    }

    // 4. Generate API key
    const { key, prefix, hash } = generateApiKey()

    // 5. Save to database (only the hash, never the full key)
    const { data: apiKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        developer_id: developer.id,
        key_prefix: prefix,
        key_hash: hash,
        name: name,
        is_active: true,
      })
      .select('id, name, key_prefix, created_at')
      .single()

    if (insertError) {
      console.error('API key insert error:', insertError)
      return NextResponse.json(
        { error: 'creation_failed', message: 'Failed to create API key. Please try again.' },
        { status: 500 }
      )
    }

    // 6. Return the full key (only shown once!)
    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: key,  // Full key - only returned on creation
        prefix: apiKey.key_prefix,
        createdAt: apiKey.created_at,
      }
    })

  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

// GET /api/api-keys - List all API keys for the user
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

    // Get all API keys for this developer
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, is_active, last_used_at, created_at')
      .eq('developer_id', developer.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (keysError) {
      console.error('API keys fetch error:', keysError)
      return NextResponse.json(
        { error: 'fetch_failed', message: 'Failed to fetch API keys.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys || []
    })

  } catch (error) {
    console.error('API keys fetch error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

// DELETE /api/api-keys - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'API key ID is required.' },
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

    // Soft delete - set is_active to false (or hard delete if preferred)
    const { error: deleteError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('developer_id', developer.id)  // Security: only delete own keys

    if (deleteError) {
      console.error('API key delete error:', deleteError)
      return NextResponse.json(
        { error: 'delete_failed', message: 'Failed to delete API key.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API key delete error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}