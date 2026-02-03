import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Webhook } from 'svix'

const resend = new Resend(process.env.RESEND_API_KEY)
const FORWARD_TO = 'lancecj@gmail.com'

type WebhookEvent = {
  type: string
  data: {
    from: string
    to: string | string[]
    subject: string
    html?: string
    text?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify svix signature
    const svixHeaders = {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    }

    const body = await request.text()

    let event: WebhookEvent
    try {
      const wh = new Webhook(webhookSecret)
      event = wh.verify(body, svixHeaders) as WebhookEvent
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('Resend webhook received:', JSON.stringify(event, null, 2))

    // Only handle received emails
    if (event.type !== 'email.received') {
      return NextResponse.json({ received: true })
    }

    // Inbound email data is in the webhook payload directly
    const { from, to, subject, html, text } = event.data
    const emailBody = html || text || 'No content'

    // Forward to Gmail
    const { data, error } = await resend.emails.send({
      from: 'EasyAsk Inbox <noreply@easyask.io>',
      to: FORWARD_TO,
      replyTo: from, // Reply goes back to original sender
      subject: `[Fwd] ${subject}`,
      html: `
        <div style="border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 12px; color: #666; font-size: 13px;">
          <strong>From:</strong> ${from}<br>
          <strong>To:</strong> ${Array.isArray(to) ? to.join(', ') : to}<br>
          <strong>Subject:</strong> ${subject}
        </div>
        ${emailBody}
      `
    })

    if (error) {
      console.error('Failed to forward email:', error)
      return NextResponse.json({ error: 'Forward failed' }, { status: 500 })
    }

    console.log('Forwarded email from', from, 'to', FORWARD_TO, 'id:', data?.id)
    return NextResponse.json({ forwarded: true, id: data?.id })
  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
