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

/* --------------------------------- PODCAST -------------------------------- */
// The audio show. Hosted on Buzzsprout (show 2643016); everything else — Apple,
// Spotify, etc. — is syndicated from that one RSS feed. Episode data is pulled
// into src/data/podcast.json by scripts/fetch-podcast.mjs (run by the same
// GitHub Action that refreshes the video playlist), so the browser never has to
// fetch RSS (CORS-blocked) and the site stays a plain static build.
//
// SUBSCRIBE LINKS: only entries with a non-empty `href` are rendered, so a
// platform that hasn't finished indexing the feed yet simply doesn't show up.
// Fill one in the moment the listing goes live — no code change needed.
export const PODCAST = {
  // 2026-08-31: Apple listing id6806338119 was REMOVED from Apple's catalog
  // (lookup returns 0 results — likely fallout of the unclaimed-show/2FA saga).
  // Left EMPTY so no dead link ships; the moment the show is re-listed, paste
  // the new URL here and in the platform entry below and Apple reappears
  // everywhere (hero chips, About panels, per-episode links) with no other change.
  appleUrl: '',
  // Kept for reference/tooling. Deliberately NOT surfaced in the UI — a raw RSS
  // link means nothing to this audience; the apps below are how people listen.
  feedUrl: 'https://rss.buzzsprout.com/2643016.rss',
  // Only entries with a non-empty `href` render, so a platform that hasn't
  // finished indexing the feed simply doesn't appear. Marks are drawn in code
  // (PlatformIcon in App.tsx), keyed by `id` — no icon paths live here.
  platforms: [
    {
      id: 'apple' as const,
      label: 'Apple Podcasts',
      cta: 'Follow the show',
      href: '', // dead listing — see appleUrl note above
      // Brand hue, used only for the hover glow — never to repaint the tile.
      hue: '168, 74, 233',
    },
    {
      id: 'spotify' as const,
      label: 'Spotify',
      cta: 'Follow the show',
      href: 'https://open.spotify.com/show/3Ccs9o53RD4fcCpwbhh7zQ',
      hue: '29, 185, 84',
    },
    // Add YouTube Music / Amazon here the day their listing goes live — paste a
    // URL into `href`, add a case to PlatformIcon, done.
  ],
}
