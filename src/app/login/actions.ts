'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

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

  // Use service role for remaining operations (bypasses RLS)
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Step 1: Create organization
  const { data: orgData, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: organizationName,
      website_url: websiteUrl,
    })
    .select()
    .single()

  if (orgError || !orgData) {
    console.error('Failed to create organization:', orgError)
    redirect('/login?error=Failed to create organization')
  }

  // Step 2: Create File Search store for the organization
  let fileSearchStoreName: string | null = null
  try {
    const store = await ai.fileSearchStores.create({
      config: {
        displayName: `${organizationName} - Knowledge Base`
      }
    })

    if (!store?.name) {
      throw new Error('Failed to create File Search store - no store name returned')
    }

    fileSearchStoreName = store.name

    // Update organization record with store name
    const { error: storeUpdateError } = await supabaseAdmin
      .from('organizations')
      .update({ file_search_store_name: store.name })
      .eq('id', orgData.id)

    if (storeUpdateError) {
      console.error('Failed to save store name:', storeUpdateError)
      // Try to clean up the store
      try {
        await ai.fileSearchStores.delete({ name: store.name })
      } catch (cleanupError) {
        console.error('Failed to cleanup store:', cleanupError)
      }
      throw storeUpdateError
    }

    console.log('✅ File Search store created:', store.name)
  } catch (storeError) {
    console.error('Failed to create File Search store:', storeError)
    // Continue anyway - user can create it later from admin
  }

  // Step 3: Create user record with organization_id and role
  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email: authData.user.email,
      organization_id: orgData.id,
      role: 'owner', // First user is the owner
    })

  if (userError) {
    console.error('Failed to save user details:', userError)
    redirect('/login?error=Failed to save user details')
  }

  revalidatePath('/', 'layout')
  redirect('/admin/pages')  // New users need to set up widget pages first
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
