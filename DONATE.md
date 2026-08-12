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
