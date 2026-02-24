import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization_id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.organization_id) {
      return NextResponse.json(
        { error: 'User organization not found' },
        { status: 400 }
      )
    }

    const orgId = userData.organization_id

    // Fetch all data in parallel
    const [examplesResult, taglinesResult, verticalsResult, archetypesResult] = await Promise.all([
      supabaseAdmin
        .from('cotd_examples')
        .select('*, vertical:cotd_verticals(*), archetype:cotd_archetypes(*), series_tagline:cotd_series_taglines(*)')
        .eq('organization_id', orgId)
        .order('volume_number'),
      supabaseAdmin
        .from('cotd_series_taglines')
        .select('*')
        .eq('organization_id', orgId)
        .order('category'),
      supabaseAdmin
        .from('cotd_verticals')
        .select('*')
        .eq('organization_id', orgId)
        .order('label'),
      supabaseAdmin
        .from('cotd_archetypes')
        .select('*')
        .eq('organization_id', orgId)
        .order('label'),
    ])

    if (examplesResult.error) throw examplesResult.error
    if (taglinesResult.error) throw taglinesResult.error
    if (verticalsResult.error) throw verticalsResult.error
    if (archetypesResult.error) throw archetypesResult.error

    return NextResponse.json({
      examples: examplesResult.data || [],
      taglines: taglinesResult.data || [],
      verticals: verticalsResult.data || [],
      archetypes: archetypesResult.data || [],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error fetching chat mockup data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat mockup data' },
      { status: 500 }
    )
  }
}
