import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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
      // Use service role to bypass RLS when checking if user exists
      // (RLS might not be fully active yet during OAuth callback)
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Check if user has organization record (determines if onboarding needed)
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, organization_id')
        .eq('id', session.user.id)
        .single()

      console.log('OAuth callback - checking user:', {
        userId: session.user.id,
        email: session.user.email,
        userData,
        userError
      })

      if (userError || !userData || !userData.organization_id) {
        // No existing user record — check if email is on the approved allowlist
        const email = session.user.email?.toLowerCase()

        const { data: approved } = await supabaseAdmin
          .from('early_access_signups')
          .select('id')
          .eq('email', email)
          .eq('approved', true)
          .single()

        if (approved) {
          // Approved user — send to onboarding (creates org + store + user record)
          console.log('Approved signup via allowlist:', email)
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // Not approved — reject
        console.log('OAuth signup blocked - not on approved list:', email)
        return NextResponse.redirect(`${origin}/login?error=Account not found. Contact admin for access.`)
      }

      // Existing user with organization - redirect to admin
      console.log('Existing user authenticated - redirecting to admin')
      return NextResponse.redirect(`${origin}/admin`)
    }
  }

  // Fallback: redirect to login if something went wrong
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
