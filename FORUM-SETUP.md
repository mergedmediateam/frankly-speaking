# Forum signups → Google Sheet (live)

The Forum form (`#/forum`) posts each signup into a **Google Form** owned by
**mergedmediateam@gmail.com**; responses land automatically in a linked Google Sheet.
No server, no Apps Script, free, and updates in real time.

## What's connected
- **Form (edit):** Google Forms → "Frankly Speaking — The Forum" (mergedmediateam account).
- **Responses Sheet:** "Frankly Speaking — The Forum (Responses)" — columns: Timestamp · Name · Email.
- **Wiring:** `src/config.ts` → `FORUM_FORM` holds the public `formResponse` URL + the two
  field IDs. The site POSTs `name` + `email` with `mode: 'no-cors'` (opaque, fire-and-forget),
  then shows the success state.

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
