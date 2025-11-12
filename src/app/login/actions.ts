'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-casting for form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Get form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const organizationName = formData.get('organizationName') as string
  const websiteUrl = formData.get('websiteUrl') as string

  // Validate required fields
  if (!organizationName || organizationName.length < 2) {
    redirect('/login?error=Organization name must be at least 2 characters')
  }

  if (!websiteUrl || !websiteUrl.match(/^https?:\/\//)) {
    redirect('/login?error=Please enter a valid website URL (must start with http:// or https://)')
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    redirect(`/login?error=${encodeURIComponent(authError?.message || 'Failed to create account')}`)
  }

  // Save organization details to users table
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: authData.user.id,
      email: authData.user.email,
      organization_name: organizationName,
      website_url: websiteUrl,
    })

  if (userError) {
    console.error('Failed to save user details:', userError)
    redirect('/login?error=Failed to save organization details')
  }

  // Create File Search store for the organization
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/store/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organizationName }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create store')
    }

    console.log('✅ File Search store created successfully')
  } catch (storeError) {
    console.error('Failed to create File Search store:', storeError)
    // Continue anyway - user can try again later or we can fix manually
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/error')
  }

  // Show success message (we'll create a success page or use the same login page with a message)
  redirect('/login?message=Check your email for the magic link')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
