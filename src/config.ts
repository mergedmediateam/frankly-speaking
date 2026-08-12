// Forum signups → Google Form (responses land in a linked Google Sheet, owned by
// mergedmediateam@gmail.com). The form is public ("anyone with the link"), so these
// values are safe to ship in the client. To repoint: create a new form, link a Sheet,
// open the live form and read the entry IDs (see FORUM-SETUP.md).
export const FORUM_FORM = {
  action:
    'https://docs.google.com/forms/d/e/1FAIpQLSdUmwmIOMxgtfuErXF-rNqVIF2ihdEZB5QxdX2VZfd690pz6w/formResponse',
  nameField: 'entry.1567136615',
  emailField: 'entry.474959345',
  // "Who are you, and why do you want to be on the show?" paragraph question.
  messageField: 'entry.743505614',
}

// Partner interest → its own Google Form + Sheet (same recipe, separate list so
// partner leads never mix with community signups).
export const PARTNER_FORM = {
  action:
    'https://docs.google.com/forms/d/e/1FAIpQLSdDcM53z0erZEtuQeN7OGAkWGu9Y3-urQZuULS5-2oxS7NbCw/formResponse',
  nameField: 'entry.1184791873',
  emailField: 'entry.1532441216',
  messageField: 'entry.147624919',
}

/* --------------------------------- GIVING --------------------------------- */
// Donations run on Square. The give form POSTs the chosen amount to
// `/api/donate` (a Vercel serverless function in this repo, see api/donate.ts),
// which creates a Square-hosted checkout and hands back its URL — same pattern
// as the WorshipFlow/NCW app, no card data ever touches us.
//
// Nothing secret lives here; the token stays in Vercel env vars. See DONATE.md.
export const DONATE = {
  endpoint: '/api/donate',
  oneTimeAmounts: [25, 50, 100, 250, 500],
  monthlyAmounts: [10, 25, 50, 100, 250],
  // Shown under the give form. Keep legally accurate — update once the client
  // confirms the receiving entity + tax status.
  receiptNote:
    'Gifts are received by Touch Heaven International Ministries. You will get an email receipt for every gift.',
}
