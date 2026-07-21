# Signups → Google Sheets (live)

Two site forms post into **Google Forms** owned by **mergedmediateam@gmail.com**;
responses land automatically in linked Google Sheets (Drive: My Drive › Frank › frankly speaking).
No server, no Apps Script, free, and updates in real time.

## What's connected
- **Beyond the Show** (`#/beyond`, formerly The Forum — `#/forum` still aliases to it):
  Form "Frankly Speaking — The Forum" → Sheet "… (Responses)" — Timestamp · Name · Email.
  Wiring: `src/config.ts` → `FORUM_FORM`.
- **Become a Partner** (`#/partner`, added 2026-07-21): Form "Frankly Speaking — Partners"
  (edit id `1QP6_C8jXGxjN1BGhHBRX8bWrT6PLKYc4rK11JR9xUTU`) → Sheet "Frankly Speaking — Partners
  (Responses)" (`16XrDmRJ8e6Lwc8Sj8gWkgMrC6-b6uVevqntq_OPm3dI`) — Timestamp · Name · Email · Message.
  Wiring: `src/config.ts` → `PARTNER_FORM`.
- The site POSTs urlencoded with `mode: 'no-cors'` (opaque, fire-and-forget), then shows
  the success state.

## To see the leads
Open the linked Sheet from the Form (Responses tab → green Sheets icon → **View in Sheets**),
or directly in Drive under the mergedmediateam account.

## To change / rebuild the collector
1. Create a new Google Form (under the right account), add **Name** + **Email** short-answer questions.
2. Responses tab → **Link to Sheets** → create.
3. **Publish** → Responders: *Anyone with the link*.
4. Open the live form (`/viewform`), and in the console read the field IDs:
   ```js
   FB_PUBLIC_LOAD_DATA_[1][1].map(q => ({ title: q[1], entry: 'entry.' + q[4][0][0] }))
   ```
5. Put the `formResponse` action URL + the two `entry.…` IDs into `src/config.ts` → `FORUM_FORM`.

> The form is public, so these IDs are safe to ship in the client bundle.
