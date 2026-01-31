import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isValidKeyFormat } from '@/lib/api-keys'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key, visitor_id, external_order_id, amount, currency, product_name } = body

    // Validate required fields
    if (!api_key || !visitor_id) {
      return NextResponse.json({ ok: false, error: 'api_key and visitor_id are required' }, { status: 400 })
    }

    // Validate API key format
    if (!isValidKeyFormat(api_key)) {
      return NextResponse.json({ ok: false, error: 'Invalid API key' }, { status: 401 })
    }

    // Look up organization by publishable key
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('publishable_key', api_key)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ ok: false, error: 'Invalid API key' }, { status: 401 })
    }

    // Verify visitor belongs to this org
    const { data: visitor } = await supabase
      .from('visitors')
      .select('id')
      .eq('id', visitor_id)
      .eq('organization_id', org.id)
      .single()

    if (!visitor) {
      // Fire-and-forget style — don't expose that visitor wasn't found
      return NextResponse.json({ ok: true })
    }

    // Find the visitor's most recent conversation session for attribution
    const { data: recentSession } = await supabase
      .from('conversation_sessions')
      .select('session_id')
      .eq('visitor_id', visitor_id)
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Insert purchase event, deduplicating on external_order_id
    const insertData: Record<string, unknown> = {
      organization_id: org.id,
      visitor_id: visitor.id,
      attributed_session_id: recentSession?.session_id || null,
      amount: amount || null,
      currency: currency || 'USD',
      product_name: product_name || null,
      external_order_id: external_order_id || null,
    }

    if (external_order_id) {
      // Upsert to deduplicate on external_order_id
      await supabase
        .from('purchase_events')
        .upsert(insertData, {
          onConflict: 'organization_id,external_order_id',
          ignoreDuplicates: true,
        })
    } else {
      await supabase
        .from('purchase_events')
        .insert(insertData)
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Fire-and-forget — always return ok from client perspective
    return NextResponse.json({ ok: true })
  }
}
