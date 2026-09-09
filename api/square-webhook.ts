// POST /api/square-webhook  — called by Square, never by the browser.
//
// Sends a thank-you email from the Frankly Speaking team after a completed
// gift. Listen-only: it never creates, changes, or refunds a payment,
// and api/donate.ts (the checkout) does not know this file exists. If this
// function is misconfigured or down, donations keep working exactly as before —
// the giver just doesn't get the extra email (Square's own receipt still goes
// out).
//
// Flow:  Square payment.created / payment.updated (status COMPLETED)
//          → verify Square's HMAC signature over the raw body
//          → is it a Frankly Speaking gift? (payment note set by api/donate.ts,
//            with the order metadata tag as a second check)
//          → email the giver via Resend (idempotent per payment id, so Square
//            retries never produce a second email)
//          → optionally email Frank a one-line "new gift" note
//
// Monthly gifts: only the checkout payment carries the Frankly note/metadata.
// Square's later renewal charges come from subscription invoices, which don't,
// so a monthly giver is thanked once, on the first charge — not every month.
//
// One self-contained file for the same reason as api/donate.ts (Vercel compiles
// each api/*.ts alone; a relative sibling import would break at runtime).
//
// Required env vars on the Vercel project:
//   SQUARE_WEBHOOK_SIGNATURE_KEY  From Square Developer → Webhooks → the
//                                 subscription's "Signature key"
//   RESEND_API_KEY                From resend.com → API Keys
// Optional:
//   SQUARE_WEBHOOK_URL       Exact URL entered in Square for the subscription.
//                            Default: https://franklyspeakingshow.com/api/square-webhook
//                            (the signature is computed over URL + body, so it
//                            must match byte for byte).
//   THANKS_FROM              Sender. Default below. The domain must be verified
//                            in Resend; the mailbox itself need not exist.
//   DONATION_NOTIFY_EMAIL    If set, Frank gets a short "new gift" email for
//                            every donation — a running donor log in his inbox.
//   SQUARE_ACCESS_TOKEN      Already set for checkout; used here only to READ
//                            the order's metadata tag. Not required.
//   SQUARE_ENV               "sandbox" → sandbox host for that read.

import { createHmac, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Square must sign the RAW body; Vercel's default JSON parsing would re-encode
// it and the signature would never match.
export const config = { api: { bodyParser: false } }

const DEFAULT_WEBHOOK_URL = 'https://franklyspeakingshow.com/api/square-webhook'
// Send-only address: the copy never asks anyone to reply to it.
const DEFAULT_FROM = 'Frankly Speaking <hello@franklyspeakingshow.com>'
const SITE = 'https://franklyspeakingshow.com'
const SQUARE_VERSION = '2025-01-23'

// The notes api/donate.ts puts on every gift's checkout. Matching on these is
// what keeps this from firing on anything else that runs through the same
// Square account (the NCW "granted access on any payment" lesson).
const NOTE_ONCE = 'Frankly Speaking gift'
const NOTE_MONTHLY = 'Frankly Speaking monthly gift'

function env(name: string): string {
  return (process.env[name] ?? '').trim()
}

/* ------------------------------ raw body + sig ----------------------------- */

async function readRawBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
}

function headerValue(req: IncomingMessage, name: string): string {
  const v = req.headers[name.toLowerCase()]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

// Square: base64( HMAC-SHA256( signature_key, notification_url + raw_body ) )
function signatureValid(req: IncomingMessage, rawBody: string): boolean {
  const key = env('SQUARE_WEBHOOK_SIGNATURE_KEY')
  if (!key) return false
  const url = env('SQUARE_WEBHOOK_URL') || DEFAULT_WEBHOOK_URL
  const expected = createHmac('sha256', key).update(url + rawBody).digest()
  const given = Buffer.from(headerValue(req, 'x-square-hmacsha256-signature'), 'base64')
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/* ----------------------------- Square read-only ---------------------------- */

type Payment = {
  id?: string
  status?: string
  order_id?: string
  buyer_email_address?: string
  note?: string
  amount_money?: { amount?: number; currency?: string }
  card_details?: { card?: { cardholder_name?: string } }
  billing_address?: { first_name?: string }
  shipping_address?: { first_name?: string }
}

function squareBase(): string {
  return env('SQUARE_ENV').toLowerCase() === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com'
}

// Second opinion on "is this a Frankly gift", via the order metadata tag.
// Best-effort: returns null when the token lacks ORDERS_READ or anything fails.
async function orderMetadata(orderId: string): Promise<Record<string, string> | null> {
  const token = env('SQUARE_ACCESS_TOKEN')
  if (!token) return null
  try {
    const res = await fetch(`${squareBase()}/v2/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}`, 'Square-Version': SQUARE_VERSION },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.order?.metadata ?? null
  } catch {
    return null
  }
}

type Gift = { kind: 'once' | 'monthly' } | null

async function classify(payment: Payment): Promise<Gift> {
  const note = (payment.note ?? '').trim()
  if (note === NOTE_MONTHLY) return { kind: 'monthly' }
  if (note === NOTE_ONCE) return { kind: 'once' }

  // No note (Square occasionally drops it on some checkout paths) — fall back
  // to the order tag written by api/donate.ts.
  if (payment.order_id) {
    const meta = await orderMetadata(payment.order_id)
    if (meta?.channel === 'donation' && meta?.show === 'frankly-speaking') {
      return { kind: meta.freq === 'monthly' ? 'monthly' : 'once' }
    }
  }
  return null
}

/* ------------------------------- the email -------------------------------- */

function firstName(payment: Payment): string | null {
  const raw =
    payment.billing_address?.first_name ||
    payment.shipping_address?.first_name ||
    payment.card_details?.card?.cardholder_name ||
    ''
  const first = raw.trim().split(/\s+/)[0] ?? ''
  // Skip placeholders like "CARDHOLDER" / "VALUED CUSTOMER" and anything odd.
  if (!/^[A-Za-zÀ-ÿ'-]{2,}$/.test(first)) return null
  if (/^(cardholder|customer|valued|card)$/i.test(first)) return null
  return first[0].toUpperCase() + first.slice(1).toLowerCase()
}

function dollars(payment: Payment): string {
  const cents = payment.amount_money?.amount ?? 0
  const whole = cents % 100 === 0
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

type Copy = { subject: string; paragraphs: string[] }

// Team voice ("we"), short. Never invites a reply — this address is a
// send-only sender, so questions are pointed at the website / video comments.
function thankYouCopy(kind: 'once' | 'monthly', name: string | null, amount: string): Copy {
  const hi = name ? `Hi ${name},` : 'Hi,'
  if (kind === 'monthly') {
    return {
      subject: 'You’re now a monthly partner — thank you',
      paragraphs: [
        hi,
        `We just saw that you set up a monthly gift of ${amount} to Frankly Speaking, and we wanted to say thank you.`,
        'A monthly partner changes how we can work. Instead of planning the next week, we can plan the next season: more broadcasts, more dispatches, more of the message going further than we could carry it alone.',
        'Square will send you a receipt each month. If you ever need to change or pause your gift, let us know through the website and we’ll take care of it.',
        'Thank you for standing with us.',
        'Frank and the Frankly Speaking team',
      ],
    }
  }
  return {
    subject: 'Thank you from Frankly Speaking',
    paragraphs: [
      hi,
      `We just saw your gift of ${amount} come through, and we wanted to say thank you.`,
      'Frankly Speaking exists because people like you decide the message is worth carrying. Your gift keeps the broadcast on the air, the podcast going out, and tomorrow’s dispatch in the works.',
      'Your receipt from Square is on its way separately. If you have a question about the show, or a story you think needs telling, come find us on the website or leave a comment under the latest broadcast — we read every one.',
      'With gratitude,',
      'Frank and the Frankly Speaking team',
    ],
  }
}

function renderHtml(copy: Copy): string {
  const body = copy.paragraphs
    .map((p, i) => {
      const last = i === copy.paragraphs.length - 1
      const style = last
        ? 'margin:0;font-size:17px;line-height:1.6;color:#070a11;font-weight:600;'
        : 'margin:0 0 18px;font-size:17px;line-height:1.6;color:#070a11;'
      return `<p style="${style}">${escapeHtml(p)}</p>`
    })
    .join('')
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f5f9;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#070a11;padding:22px 36px;">
  <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:0.02em;color:#eef2f8;">Frankly Speaking</span>
</td></tr>
<tr><td style="height:4px;background:#1f6fe5;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:36px 36px 32px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  ${body}
</td></tr>
<tr><td style="padding:0 36px 32px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <a href="${SITE}" style="display:inline-block;background:#1f6fe5;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 22px;border-radius:999px;">Watch the latest broadcast</a>
</td></tr>
<tr><td style="padding:22px 36px;border-top:1px solid #e6e9f0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b7689;">
  Frankly Speaking &middot; Touch Heaven Studios &middot; Canfield, Ohio<br>
  Gifts are received by Touch Heaven International Ministries.
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function renderText(copy: Copy): string {
  return `${copy.paragraphs.join('\n\n')}\n\n${SITE}\nFrankly Speaking · Touch Heaven Studios · Canfield, Ohio`
}

/* --------------------------------- Resend --------------------------------- */

async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  text: string
  idempotencyKey: string
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
      // Resend drops a repeat send with the same key, so a Square retry (or the
      // created + updated pair for one payment) can't double-thank anyone.
      'Idempotency-Key': opts.idempotencyKey,
    },
    body: JSON.stringify({
      from: env('THANKS_FROM') || DEFAULT_FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${detail}`)
  }
}

/* --------------------------------- handler -------------------------------- */

// First-line dedupe for the created+updated pair within one warm instance.
// Resend's idempotency key is the real guarantee; this just saves API calls.
const handled = new Set<string>()

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { error: 'Method not allowed' })
  }

  const rawBody = await readRawBody(req)

  if (!signatureValid(req, rawBody)) {
    console.warn('[square-webhook] bad signature')
    return send(res, 401, { error: 'Invalid signature' })
  }

  let event: { type?: string; data?: { object?: { payment?: Payment } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return send(res, 400, { error: 'Bad JSON' })
  }

  // Anything that isn't a completed payment is acknowledged and ignored. Always
  // 200 from here on: a non-2xx makes Square retry for days.
  if (event.type !== 'payment.created' && event.type !== 'payment.updated') {
    return send(res, 200, { ok: true, ignored: event.type })
  }
  const payment = event.data?.object?.payment
  if (!payment?.id || payment.status !== 'COMPLETED') {
    return send(res, 200, { ok: true, ignored: 'not completed' })
  }
  if (handled.has(payment.id)) return send(res, 200, { ok: true, ignored: 'duplicate' })

  const gift = await classify(payment)
  if (!gift) return send(res, 200, { ok: true, ignored: 'not a Frankly gift' })

  handled.add(payment.id)

  const to = (payment.buyer_email_address ?? '').trim()
  const name = firstName(payment)
  const amount = dollars(payment)

  if (!env('RESEND_API_KEY')) {
    console.error('[square-webhook] RESEND_API_KEY missing — gift received, no email sent', payment.id)
    return send(res, 200, { ok: true, sent: false })
  }

  let sent = false
  if (to) {
    try {
      const copy = thankYouCopy(gift.kind, name, amount)
      await sendEmail({
        to,
        subject: copy.subject,
        html: renderHtml(copy),
        text: renderText(copy),
        idempotencyKey: `fs-thanks-${payment.id}`,
      })
      sent = true
    } catch (err) {
      console.error('[square-webhook] thank-you failed', payment.id, err)
    }
  } else {
    console.warn('[square-webhook] gift with no buyer email', payment.id)
  }

  // Frank's running log: one short email per gift.
  const notify = env('DONATION_NOTIFY_EMAIL')
  if (notify) {
    const who = [name, to].filter(Boolean).join(' · ') || 'no email given'
    const line = `${amount} ${gift.kind === 'monthly' ? 'monthly' : 'one-time'} gift from ${who}`
    try {
      await sendEmail({
        to: notify,
        subject: `New gift: ${line}`,
        html: `<p style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;">${escapeHtml(line)}<br><span style="color:#6b7689;font-size:13px;">${new Date().toUTCString()} · Square payment ${escapeHtml(payment.id)} · thank-you email ${sent ? 'sent' : 'NOT sent'}</span></p>`,
        text: `${line}\n${new Date().toUTCString()} · Square payment ${payment.id} · thank-you email ${sent ? 'sent' : 'NOT sent'}`,
        idempotencyKey: `fs-notify-${payment.id}`,
      })
    } catch (err) {
      console.error('[square-webhook] notify failed', payment.id, err)
    }
  }

  return send(res, 200, { ok: true, sent })
}
