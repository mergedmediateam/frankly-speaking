// POST /api/donate  { freq: "once" | "monthly", amount: <dollars> }
//   → { url }  — a Square-hosted checkout for exactly that gift.
//
// Same approach as the WorshipFlow/NCW app (lib/square.ts): the server creates
// a Square-hosted Checkout (payment link), so card data never touches us. This
// site is a static Vite SPA, so it lives in a Vercel function instead of a
// Next.js route.
//
// Kept deliberately as ONE self-contained file: the project is `"type":
// "module"` and Vercel compiles each api/*.ts separately without bundling, so a
// relative import of a sibling helper fails at runtime unless it carries a .js
// extension. One file, no import to get wrong.
//
// Required env vars on the Vercel project (Frank / Touch Heaven's OWN Square
// account — never reuse the NCW token):
//   SQUARE_ACCESS_TOKEN   Access token from Square Developer → your app
//   SQUARE_LOCATION_ID    Location the gifts are attributed to
//   SQUARE_ENV            "sandbox" to test against fake money; anything else
//                         (or unset) = PRODUCTION, real charges

const PROD_BASE = 'https://connect.squareup.com'
const SANDBOX_BASE = 'https://connect.squareupsandbox.com'

// Square's API is versioned by header; pin it so behaviour can't shift under us.
const SQUARE_VERSION = '2025-01-23'

const MIN_DOLLARS = 1
const MAX_DOLLARS = 100_000

type Req = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}
type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader: (k: string, v: string) => void
}

function env(name: string): string {
  return (process.env[name] ?? '').trim()
}

function squareBase(): string {
  return env('SQUARE_ENV').toLowerCase() === 'sandbox' ? SANDBOX_BASE : PROD_BASE
}

function squareConfigured(): boolean {
  return !!(env('SQUARE_ACCESS_TOKEN') && env('SQUARE_LOCATION_ID'))
}

async function squareFetch(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${squareBase()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('SQUARE_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      'Square-Version': SQUARE_VERSION,
    },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Square ${path} failed: ${JSON.stringify(json.errors ?? json)}`)
  }
  return json
}

const uuid = () => globalThis.crypto.randomUUID()

/* ------------------------------ monthly plans ----------------------------- */
// A recurring Square checkout needs a catalog SUBSCRIPTION_PLAN_VARIATION.
// Rather than hand-creating one per tier in the dashboard, we look one up by a
// stable name and create it on first use. Needs catalog read/write scope.

const PLAN_NAME = 'Frankly Speaking — Monthly Giving'
const variationName = (cents: number) => `FS Monthly Gift $${(cents / 100).toFixed(0)}`

// Warm cache — one instance serves many requests, so this saves the catalog
// round-trip on all but the first.
const variationCache = new Map<number, string>()

async function searchCatalog(type: string, name: string): Promise<string | null> {
  const json = await squareFetch('/v2/catalog/search', {
    object_types: [type],
    query: { exact_query: { attribute_name: 'name', attribute_value: name } },
    limit: 1,
  })
  return json.objects?.[0]?.id ?? null
}

async function ensurePlan(): Promise<string> {
  const found = await searchCatalog('SUBSCRIPTION_PLAN', PLAN_NAME)
  if (found) return found
  const json = await squareFetch('/v2/catalog/object', {
    idempotency_key: uuid(),
    object: {
      type: 'SUBSCRIPTION_PLAN',
      id: '#plan',
      subscription_plan_data: { name: PLAN_NAME },
    },
  })
  return json.catalog_object.id
}

async function ensurePlanVariation(cents: number): Promise<string> {
  const cached = variationCache.get(cents)
  if (cached) return cached

  const name = variationName(cents)
  let id = await searchCatalog('SUBSCRIPTION_PLAN_VARIATION', name)

  if (!id) {
    const planId = await ensurePlan()
    const json = await squareFetch('/v2/catalog/object', {
      idempotency_key: uuid(),
      object: {
        type: 'SUBSCRIPTION_PLAN_VARIATION',
        id: '#var',
        subscription_plan_variation_data: {
          name,
          subscription_plan_id: planId,
          phases: [
            {
              cadence: 'MONTHLY',
              // No `periods` = bills until the giver cancels.
              pricing: { type: 'STATIC', price_money: { amount: cents, currency: 'USD' } },
            },
          ],
        },
      },
    })
    id = json.catalog_object.id as string
  }

  variationCache.set(cents, id)
  return id
}

/* -------------------------------- checkout -------------------------------- */

async function createDonationCheckout(opts: {
  amount: number // cents
  origin: string
  /** Present for recurring gifts: the catalog subscription plan VARIATION id. */
  planVariationId?: string
}): Promise<{ url: string; orderId: string }> {
  const monthly = !!opts.planVariationId
  const json = await squareFetch('/v2/online-checkout/payment-links', {
    idempotency_key: uuid(),
    order: {
      location_id: env('SQUARE_LOCATION_ID'),
      line_items: [
        {
          name: monthly ? 'Frankly Speaking — monthly gift' : 'Frankly Speaking — gift',
          quantity: '1',
          base_price_money: { amount: opts.amount, currency: 'USD' },
        },
      ],
      // Tag every gift so any future webhook can tell donations apart from
      // other Square flows on this account (the NCW webhook guard lesson).
      metadata: {
        channel: 'donation',
        show: 'frankly-speaking',
        freq: monthly ? 'monthly' : 'once',
      },
    },
    checkout_options: {
      redirect_url: `${opts.origin}/#/thanks`,
      ask_for_shipping_address: false,
      ...(monthly ? { subscription_plan_id: opts.planVariationId } : {}),
    },
    payment_note: monthly ? 'Frankly Speaking monthly gift' : 'Frankly Speaking gift',
  })
  const link = json.payment_link
  if (!link?.url) throw new Error('Square returned no payment link')
  return { url: link.url, orderId: link.order_id }
}

/* --------------------------------- handler -------------------------------- */

function originOf(req: Req): string {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || ''
  return `${proto}://${host}`
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return undefined
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!squareConfigured()) {
    return res.status(503).json({
      error:
        'Secure checkout is not connected yet. Please reach the team through Become a Sponsor.',
    })
  }

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as
    | { freq?: string; amount?: unknown }
    | undefined

  // The browser sends the amount because a donation is buyer-chosen by nature;
  // it is still sanitised here and the order is built server-side.
  const dollars = Math.floor(Number(body?.amount))
  if (!Number.isFinite(dollars) || dollars < MIN_DOLLARS || dollars > MAX_DOLLARS) {
    return res.status(400).json({ error: 'Please enter a valid amount.' })
  }
  const monthly = body?.freq === 'monthly'
  const cents = dollars * 100

  try {
    const planVariationId = monthly ? await ensurePlanVariation(cents) : undefined
    const { url } = await createDonationCheckout({
      amount: cents,
      origin: originOf(req),
      planVariationId,
    })
    return res.status(200).json({ url })
  } catch (err) {
    // Never leak Square's raw error to the giver — log it for us, show a
    // human sentence to them.
    console.error('[donate]', err)
    return res.status(502).json({
      error: 'We could not open the secure checkout. Please try again in a moment.',
    })
  }
}
