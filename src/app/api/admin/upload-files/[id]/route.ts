import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const serverSupabase = await createServerClient()

    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Get file upload record (scoped to user's org)
    const { data: upload, error } = await supabaseAdmin
      .from('file_uploads')
      .select('file_path, filename')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (error || !upload) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Generate signed URL (valid for 60 seconds)
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('uploaded-docs')
      .createSignedUrl(upload.file_path, 60)

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedData.signedUrl })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
