import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { supabaseAdmin } from '@/lib/supabase'
import { generateApiKey } from '@/lib/api-key'
import { sendWelcomeEmail } from '@/lib/resend'

interface ClerkUser {
  id: string
  email_addresses: Array<{
    email_address: string
    id: string
  }>
  first_name: string | null
  last_name: string | null
}

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Get headers
    const svix_id = req.headers.get('svix-id')
    const svix_timestamp = req.headers.get('svix-timestamp')
    const svix_signature = req.headers.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 })
    }

    // Get body
    const body = await req.text()

    // Verify webhook
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: { type: string; data: ClerkUser }

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as { type: string; data: ClerkUser }
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle user.created event
    if (evt.type === 'user.created') {
      const user = evt.data
      const email = user.email_addresses[0]?.email_address
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || null

      if (!email) {
        console.error('User has no email:', user.id)
        return NextResponse.json({ error: 'User has no email' }, { status: 400 })
      }

      // Create developer record
      const { data: developer, error: devError } = await supabaseAdmin
        .from('developers')
        .insert({
          clerk_id: user.id,
          email,
          name
        })
        .select()
        .single()

      if (devError) {
        console.error('Failed to create developer:', devError)
        return NextResponse.json({ error: 'Failed to create developer' }, { status: 500 })
      }

      // Generate initial API key
      const { key, prefix, hash } = generateApiKey()

      const { error: keyError } = await supabaseAdmin
        .from('api_keys')
        .insert({
          developer_id: developer.id,
          key_prefix: prefix,
          key_hash: hash,
          name: 'Default'
        })

      if (keyError) {
        console.error('Failed to create API key:', keyError)
        // Don't fail the webhook, the user can generate a new key
      }

      // Send welcome email
      await sendWelcomeEmail({
        email,
        firstName: user.first_name || 'Developer'
      })

      console.log('New developer created:', developer.id, email)
    }

    // Handle user.deleted event
    if (evt.type === 'user.deleted') {
      const user = evt.data

      // Delete developer and all related data (cascades due to foreign keys)
      const { error: deleteError } = await supabaseAdmin
        .from('developers')
        .delete()
        .eq('clerk_id', user.id)

      if (deleteError) {
        console.error('Failed to delete developer:', deleteError)
        return NextResponse.json({ error: 'Failed to delete developer' }, { status: 500 })
      }

      console.log('Developer deleted:', user.id)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
