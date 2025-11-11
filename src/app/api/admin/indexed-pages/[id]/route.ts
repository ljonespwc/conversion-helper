import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Note: Google File Search API doesn't support deletion
    // So we just mark the page as deleted in our database
    // and it won't be included in future queries

    const { error } = await supabase
      .from('indexed_pages')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting indexed page:', error)
      return NextResponse.json(
        { error: 'Failed to delete indexed page' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Page marked as deleted'
    })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
