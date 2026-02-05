import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { rateLimits, getClientIP } from '@/lib/ratelimit'

const resend = new Resend(process.env.RESEND_API_KEY)

// Use service role client to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 signups per IP per hour
    const clientIP = getClientIP(request)
    try {
      const { success } = await rateLimits.earlyAccess.limit(clientIP)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    } catch (rateLimitError) {
      console.error('Rate limiting error (allowing request):', rateLimitError)
    }

    const { email, source } = await request.json()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const signupSource = source === 'partner' ? 'partner' : 'early_access'

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('early_access_signups')
      .insert({ email: normalizedEmail, source: signupSource })

    if (dbError) {
      // Check for duplicate
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'Already signed up!' }, { status: 409 })
      }
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save signup' }, { status: 500 })
    }

    // Send notification email to Lance
    const isPartner = signupSource === 'partner'
    const subjectPrefix = isPartner ? 'New Partner Application' : 'New Early Access Signup'
    const { data: notifyData, error: notifyError } = await resend.emails.send({
      from: 'EasyAsk <noreply@easyask.io>',
      to: 'lancecj@gmail.com',
      subject: `${subjectPrefix}: ${normalizedEmail}`,
      text: `${isPartner ? 'New partner application' : 'New early access signup'}!\n\nEmail: ${normalizedEmail}\nSource: ${signupSource}\nTime: ${new Date().toISOString()}`
    })
    console.log('Resend notify:', { data: notifyData, error: notifyError })

    // Send confirmation email to user
    const confirmSubject = isPartner
      ? "Your EasyAsk partner application is in!"
      : "You're on the EasyAsk early access list!"
    const confirmText = isPartner
      ? `Thanks for applying to the EasyAsk Partner Program!\n\nI'll review your application and get back to you shortly with next steps — including your free Growth account and referral link.\n\nIf you have any questions in the meantime, just reply to this email.\n\n— Lance\nFounder, EasyAsk`
      : `Thanks for signing up for early access to EasyAsk!\n\nWe're rolling out access in batches and will reach out when your spot is ready.\n\nIn the meantime, if you have any questions, just reply to this email.\n\n— Lance\nFounder, EasyAsk`
    const { data: confirmData, error: confirmError } = await resend.emails.send({
      from: 'Lance from EasyAsk <lance@easyask.io>',
      replyTo: 'lancecj@gmail.com',
      to: normalizedEmail,
      subject: confirmSubject,
      text: confirmText
    })
    console.log('Resend confirm:', { data: confirmData, error: confirmError })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Early access signup error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
