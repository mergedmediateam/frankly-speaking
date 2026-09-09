# Donations — Square setup

The donate page (`#/donate`) never handles card data. It POSTs the chosen amount
to `/api/donate`, a Vercel serverless function in this repo, which asks Square to
create a hosted checkout and returns its URL. Same pattern as the WorshipFlow/NCW
app (`lib/square.ts`), adapted for this static Vite site.

```
DonatePage (src/App.tsx)
  └─ POST /api/donate { freq, amount }
       └─ api/donate.ts  → api/_square.ts
            ├─ one-time : POST /v2/online-checkout/payment-links
            └─ monthly  : ensure catalog SUBSCRIPTION_PLAN_VARIATION for that
                          amount, then the same payment-link call with
                          checkout_options.subscription_plan_id
  └─ browser goes to the Square checkout
       └─ on success Square redirects to  https://<site>/#/thanks
```

## 1. Get the credentials (Frank / Touch Heaven's Square account)

⚠ Use **their** account. Do not reuse the NCW/WorshipFlow token — different
entity, different money.

1. Sign in at <https://developer.squareup.com/apps> with the ministry's Square
   login.
2. Create an application (e.g. "Frankly Speaking Website") — or open the existing
   one.
3. **Credentials → Production** → copy the **Access token**.
4. **Locations** → copy the **Location ID** the gifts should be attributed to.
5. Token scopes needed: `PAYMENTS_WRITE`, `ORDERS_WRITE`, `ITEMS_READ`,
   `ITEMS_WRITE` (the last two only so monthly plans can be auto-created), plus
   `SUBSCRIPTIONS_WRITE` for recurring gifts.

## 2. Set them on Vercel

Project `frankly-speaking` (team `mergedmediateam-2410`) → Settings → Environment
Variables, or from the project dir:

```bash
vercel env add SQUARE_ACCESS_TOKEN production
```

| Variable | Value |
|---|---|
| `SQUARE_ACCESS_TOKEN` | production access token |
| `SQUARE_LOCATION_ID` | location id |
| `SQUARE_ENV` | *(optional)* `sandbox` to test with fake money. Unset = **PRODUCTION, real charges.** |

Redeploy after adding them (`vercel --prod --yes`, or push to `master`).

### ⚠ Sandbox vs Production tokens

Sandbox and production credentials look identical (both start `EAAA`) but are
**not interchangeable** — a sandbox token against the production host returns
`AUTHENTICATION_ERROR / UNAUTHORIZED`, which is exactly what a wrong-token setup
looks like. The location ID must come from the **same** side as the token.

Current state (2026-08-12): **production** credentials are set, `SQUARE_ENV` is
unset (= production), verified — Square returns real `square.link` checkouts for
both one-time and monthly. Receiving account is **Mars Media LLC**, location
`LRYY1AE2HZW3A` (ACTIVE, USD, card processing enabled).

Two traps that cost real time here, both of which look identical to a bad setup:

1. **Copying the Application ID instead of the Access token.** They sit in
   adjacent rows on the same Credentials page. The app id is 29 chars starting
   `sq0i`; the token is 64 chars starting `EAAA`. A wrong one gives
   `AUTHENTICATION_ERROR / UNAUTHORIZED` — same error as a sandbox/production
   mismatch.
2. **Sandbox vs Production toggle.** Both tokens start `EAAA`. A sandbox token
   against the production host gives that same `UNAUTHORIZED`.

If donations ever fail with UNAUTHORIZED, check those two before anything else.

## 3. Test

Local — plain `npm run dev` does **not** run the API function, so the button will
report that checkout is unavailable. To exercise the real flow locally:

```bash
vercel dev
```

with the same vars in a local `.env.local` (never commit it).

Sandbox test cards: <https://developer.squareup.com/docs/devtools/sandbox/payments>
(e.g. `4111 1111 1111 1111`, any future expiry, CVV `111`, ZIP `94103`).

In production, testing means a real charge — refund it from the Square dashboard.

## Notes

- Every order carries `metadata.channel = "donation"`. If a webhook is ever added
  to this Square account, make it check that tag (the NCW webhook once granted
  course access on *any* completed payment — don't repeat it).
- Monthly plans are created on first use and named `FS Monthly Gift $25` etc.
  under the plan **"Frankly Speaking — Monthly Giving"**. They appear in Square's
  catalog; don't rename them or the lookup will create duplicates.
- Amounts are sanitised server-side: whole dollars, $1–$100,000.
- Tiers shown on the page live in `DONATE` in `src/config.ts`.
- `DONATE.receiptNote` is the line under the form — update it once the client
  confirms the receiving entity and tax-deductibility wording.

---

# Thank-you email after a gift (`api/square-webhook.ts`)

Added 2026-09-09. **Listen-only.** Square calls this URL after every payment;
the function sends a thank-you from the Frankly Speaking team to the giver. It never
touches the checkout, `api/donate.ts`, or any payment — if it is down or
misconfigured, donations keep working exactly as before.

```
Square  payment.created / payment.updated (COMPLETED)
  └─ POST https://franklyspeakingshow.com/api/square-webhook
       ├─ verify Square HMAC signature (raw body)
       ├─ Frankly gift?  payment.note == "Frankly Speaking gift" /
       │                 "Frankly Speaking monthly gift" (set by api/donate.ts),
       │                 else order.metadata.channel == "donation"
       ├─ Resend → giver   (one-time or monthly version, team voice, send-only)
       └─ Resend → DONATION_NOTIFY_EMAIL (optional "New gift: $50 from …" log)
```

- Idempotent per Square payment id (Resend `Idempotency-Key`), so Square's
  retries / the created+updated pair never send two emails.
- Monthly givers are thanked **once**, on the checkout charge. Renewal charges
  come from Square subscription invoices without our note, so they're skipped.
- Anything else on this Square account (other sales, refunds) is ignored.
- Copy lives in `thankYouCopy()` in the file — edit there.

## Current state (2026-09-09): LIVE

- Resend: account `mergedmediateam@gmail.com`, domain `franklyspeakingshow.com` **Verified**
  (DKIM TXT `resend._domainkey`, MX + SPF TXT on `send`, DMARC TXT `_dmarc` p=none — added at GoDaddy; root MX for
  Microsoft 365 untouched). API key `frankly-thank-you` (sending only).
- Vercel env (production): `RESEND_API_KEY`, `SQUARE_WEBHOOK_SIGNATURE_KEY`,
  `DONATION_NOTIFY_EMAIL=mergedmediateam@gmail.com`. Sender = default `hello@franklyspeakingshow.com`.
- Square: subscription **Frankly thank-you** (`wbhk_34cdb29375b04f6a9f109895e9c8bc32`,
  Production, API version 2026-07-15, events payment.created + payment.updated) on the
  Mars Media LLC app "Frankly speaking".
- Verified: signed test POST → `200 {"ok":true,"sent":true}`; both emails **Delivered** in
  Resend. Unsigned POST → 401. Non-Frankly payment → ignored.
- Still to do: one real $1 gift on the live site (then refund) to confirm Square's real
  payload carries the note/email as expected.

## Setup (three steps, ~15 min) — done, kept for reference

The sender is send-only: the email never invites a reply, it points questions
to the website / video comments instead. No mailbox has to exist behind it.

### 1. Resend — the sender
1. <https://resend.com> → sign up (free tier: 3,000 emails/month, plenty).
2. **Domains → Add** `franklyspeakingshow.com`. Resend shows 3 DNS records
   (a DKIM TXT, plus MX + TXT on `send.franklyspeakingshow.com`). Add them at
   **GoDaddy** (that's where the domain's DNS lives — `ns0x.domaincontrol.com`).
   They don't touch the existing Microsoft 365 mail on the root domain.
3. **API Keys → Create** (sending access only) → copy `re_…`.

### 2. Vercel env vars (project `frankly-speaking`)
```bash
vercel env add RESEND_API_KEY production
vercel env add SQUARE_WEBHOOK_SIGNATURE_KEY production   # from step 3
vercel env add DONATION_NOTIFY_EMAIL production          # optional: gift log inbox
```
| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square webhook subscription → Signature key |
| `DONATION_NOTIFY_EMAIL` | *(optional)* Frank/Alvar gets one short email per gift = running donor log |
| `THANKS_FROM` | *(optional)* default `Frankly Speaking <hello@franklyspeakingshow.com>` — any address on the verified domain works, the mailbox need not exist |
| `SQUARE_WEBHOOK_URL` | *(optional)* only if the URL entered in Square differs from the default |

Then redeploy (`vercel --prod --yes`) so the new function exists at the URL
before step 3 (Square pings it when you save the subscription).

### 3. Square — the webhook subscription
Same Square account that receives the gifts (Mars Media LLC, location
`LRYY1AE2HZW3A`).
1. <https://developer.squareup.com/apps> → the app whose token is on Vercel →
   **Webhooks → Subscriptions → Add subscription**.
2. Name: `Frankly thank-you`. API version: `2025-01-23`.
   URL: `https://franklyspeakingshow.com/api/square-webhook`.
3. Events: tick **`payment.created`** and **`payment.updated`** only.
4. Save → copy the **Signature key** → that's `SQUARE_WEBHOOK_SIGNATURE_KEY`
   (step 2). Redeploy once more after adding it.
5. In the subscription page use **Send test event** (`payment.updated`) — the
   function should answer `200 {"ok":true,"ignored":"not a Frankly gift"}`
   (the test payload has no Frankly note). Signature failures answer `401`.

## Test for real
Give **$1 one-time** on the live site with your own email → thank-you email
within ~10 s, plus the notify email if set. Refund the $1 from the Square
Dashboard (the refund event is ignored, nothing else fires). For monthly, use
$10 → cancel the subscription in Dashboard → Customers → Subscriptions.

Logs: Vercel → project → Logs, filter `square-webhook`.
