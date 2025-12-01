import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use service role client to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('early_access_signups')
      .insert({ email: normalizedEmail })

    if (dbError) {
      // Check for duplicate
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'Already signed up!' }, { status: 409 })
      }
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save signup' }, { status: 500 })
    }

    // Send notification email to Lance
    await resend.emails.send({
      from: 'EasyAsk <noreply@easyask.io>',
      to: 'lancecj@gmail.com',
      subject: `New Early Access Signup: ${normalizedEmail}`,
      text: `New early access signup!\n\nEmail: ${normalizedEmail}\nTime: ${new Date().toISOString()}`
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Lance from EasyAsk <lance@easyask.io>',
      replyTo: 'lancecj@gmail.com',
      to: normalizedEmail,
      subject: "You're on the EasyAsk early access list!",
      text: `Thanks for signing up for early access to EasyAsk!\n\nWe're rolling out access in batches and will reach out when your spot is ready.\n\nIn the meantime, if you have any questions, just reply to this email.\n\n— Lance\nFounder, EasyAsk`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Early access signup error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
