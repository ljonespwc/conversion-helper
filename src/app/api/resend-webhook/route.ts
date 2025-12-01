import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FORWARD_TO = 'lancecj@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Only handle received emails
    if (event.type !== 'email.received') {
      return NextResponse.json({ received: true })
    }

    const { email_id, from, to, subject } = event.data

    // Fetch full email content (webhook only has metadata)
    const { data: email } = await resend.emails.get(email_id)

    if (!email) {
      console.error('Could not fetch email:', email_id)
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // Forward to Gmail
    await resend.emails.send({
      from: 'EasyAsk Inbox <noreply@easyask.io>',
      to: FORWARD_TO,
      replyTo: from, // Reply goes back to original sender
      subject: `[Fwd] ${subject}`,
      html: `
        <div style="border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 12px; color: #666; font-size: 13px;">
          <strong>From:</strong> ${from}<br>
          <strong>To:</strong> ${to.join(', ')}<br>
          <strong>Subject:</strong> ${subject}
        </div>
        ${(email as any).html || (email as any).text || 'No content'}
      `
    })

    console.log('Forwarded email from', from, 'to', FORWARD_TO)
    return NextResponse.json({ forwarded: true })
  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
