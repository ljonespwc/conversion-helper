import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Creates a new Google File Search store for the user's organization
 * This is called during signup to automatically provision a dedicated store
 */
export async function POST(request: NextRequest) {
  try {
    const serverSupabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { organizationName } = await request.json()

    if (!organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
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

    // Check if organization already has a store
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('file_search_store_name')
      .eq('id', userData.organization_id)
      .single()

    if (existingOrg?.file_search_store_name) {
      return NextResponse.json(
        { error: 'Organization already has a File Search store', storeName: existingOrg.file_search_store_name },
        { status: 400 }
      )
    }

    // Create new File Search store
    console.log('Creating File Search store for:', organizationName)

    const store = await ai.fileSearchStores.create({
      config: {
        displayName: `${organizationName} - Knowledge Base`
      }
    })

    if (!store?.name) {
      throw new Error('Failed to create File Search store - no store name returned')
    }

    console.log('✅ File Search store created:', store.name)

    // Update organization record with store name
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({ file_search_store_name: store.name })
      .eq('id', userData.organization_id)

    if (updateError) {
      console.error('Failed to save store name to database:', updateError)
      // Try to clean up the store we just created
      try {
        await ai.fileSearchStores.delete({ name: store.name })
      } catch (cleanupError) {
        console.error('Failed to cleanup store after database error:', cleanupError)
      }
      throw updateError
    }

    return NextResponse.json({
      success: true,
      storeName: store.name,
      displayName: store.displayName
    })

  } catch (error) {
    console.error('Store creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create File Search store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
