import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('OAuth callback error:', sessionError)
      return NextResponse.redirect(`${origin}/login?error=oauth_error`)
    }

    if (session) {
      // Check if user has organization record (determines if onboarding needed)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, organization_id')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        // New OAuth user - needs onboarding
        console.log('New OAuth user detected - redirecting to onboarding')
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Existing user with organization - redirect to admin
      console.log('Existing user authenticated - redirecting to admin')
      return NextResponse.redirect(`${origin}/admin`)
    }
  }

  // Fallback: redirect to login if something went wrong
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
