// Fetches the Frankly Speaking YouTube playlist into src/data/videos.json,
// sorted NEWEST-FIRST, with a real broadcast date per video.
//
// Date resolution, per video (first hit wins):
//   1. Date written in the title ("… | June 22, 2026", "May 22nd, 2026 …") —
//      older titles carry these; they name the BROADCAST date, so they win.
//   2. Date cached in the existing videos.json from a previous run.
//   3. YouTube's upload_date via a per-video yt-dlp call. Fast --flat-playlist
//      mode doesn't expose dates, so this costs one metadata request per video —
//      capped per run (FETCH_CAP, default 20) so the 10-minute GitHub Action
//      only ever pays for the handful of genuinely new episodes.
//
// Sorting: date desc; same-day / undated keep playlist-relative order.
//
// Visibility: the same per-video call also reads availability, and anything
// CONFIRMED unlisted/private is dropped — being in the playlist isn't enough,
// yt-dlp can see videos the public channel doesn't show.
//
// Re-run whenever new episodes are published:  node scripts/fetch-playlist.mjs
// Full backfill (first run):                   FETCH_CAP=500 node scripts/fetch-playlist.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PLAYLIST_ID = 'PLjxZripGCNoRFIX8HQIoufzmXD7Hegavj'
const url = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`
const FETCH_CAP = Number(process.env.FETCH_CAP || 20)

const MONTH = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

// Returns a sortable YYYYMMDD number, or null when no date is found in the title.
// Matches "June 22, 2026" and "May 22nd, 2026" (ordinal + optional comma), anywhere.
function titleDate(title) {
  const m = /\b([A-Z][a-z]{2,8})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/.exec(title)
  if (!m) return null
  const mon = MONTH[m[1].slice(0, 3).toLowerCase()]
  if (!mon) return null
  return Number(m[3]) * 10000 + mon * 100 + Number(m[2])
}

// One metadata request for a single video → { date, availability }.
// --flat-playlist never exposes availability, so this is also the only way to
// catch a video that's in the playlist but unlisted/private on the channel
// (yt-dlp can still see those; they just shouldn't show up on the site).
function fetchVideoMeta(id) {
  try {
    const out = execFileSync(
      'yt-dlp',
      ['--no-warnings', '--skip-download', '--print', '%(upload_date)s|%(availability)s', `https://www.youtube.com/watch?v=${id}`],
      { encoding: 'utf8', timeout: 90_000 }
    ).trim()
    const [datePart, availPart] = out.split('|')
    return {
      date: /^\d{8}$/.test(datePart) ? Number(datePart) : null,
      availability: availPart && availPart !== 'NA' ? availPart : null,
    }
  } catch {
    /* video gone / throttled — leave unresolved, a later run retries */
    return { date: null, availability: null }
  }
}

const outDir = fileURLToPath(new URL('../src/data/', import.meta.url))
const outFile = outDir + 'videos.json'

// Cache: dates + availability already resolved by previous runs (so the Action never re-fetches).
const cachedDate = new Map()
const cachedAvailability = new Map()
try {
  const prev = JSON.parse(readFileSync(outFile, 'utf8'))
  for (const v of prev.videos || []) {
    if (v.id && v.date) cachedDate.set(v.id, v.date)
    if (v.id && v.availability) cachedAvailability.set(v.id, v.availability)
  }
} catch {
  /* first run — no cache yet */
}

console.log('Fetching playlist via yt-dlp…')
const raw = execFileSync(
  'yt-dlp',
  ['--flat-playlist', '--no-warnings', '-J', url],
  { maxBuffer: 1024 * 1024 * 128, encoding: 'utf8' }
)

const data = JSON.parse(raw)
const entries = (data.entries || []).filter(
  (e) => e && e.id && e.title && e.title !== '[Private video]' && e.title !== '[Deleted video]'
)

// Ids that existed in the previous videos.json — used to tell genuinely NEW
// videos apart from old ones that merely never got a date resolved.
const previouslySeen = new Set()
try {
  const prev = JSON.parse(readFileSync(outFile, 'utf8'))
  for (const v of prev.videos || []) if (v.id) previouslySeen.add(v.id)
} catch {
  /* first run */
}

// Today as YYYYMMDD, for the first-seen fallback below.
const now = new Date()
const todayNum = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()

let fetched = 0
const resolved = entries.map((e, i) => {
  let date = titleDate(e.title) ?? cachedDate.get(e.id) ?? null
  let availability = cachedAvailability.get(e.id) ?? null
  if ((date == null || availability == null) && fetched < FETCH_CAP) {
    fetched++
    const meta = fetchVideoMeta(e.id)
    if (date == null && meta.date) {
      date = meta.date
      console.log(`  ↳ fetched date ${date} for ${e.title.slice(0, 60)}`)
    }
    if (availability == null) availability = meta.availability
  }
  // FIRST-SEEN FALLBACK: on GitHub's runners YouTube often bot-blocks the
  // per-video metadata call, and an undated video sinks to the BOTTOM of the
  // site (this buried two brand-new episodes for days). A genuinely new video
  // appears here within hours of upload, so its first-seen date is the upload
  // date to within a day — good enough to sort by, and cached forever after.
  // Old videos that were already undated are left null (their true date is
  // unknowable this way; backfill those with a local run where yt-dlp works).
  if (date == null && !previouslySeen.has(e.id)) {
    date = todayNum
    console.log(`  ↳ stamped first-seen date ${date} for NEW video ${e.title.slice(0, 60)}`)
  }
  return { e, i, date, availability }
})

// Drop videos CONFIRMED unlisted/private — yt-dlp can still see them inside
// the playlist even though they don't appear on the public channel, which is
// exactly how "Bishop Glenn Plummer pt 1" ended up on the site (2026-09-14).
// Unresolved (null — same bot-blocking risk as dates above) is left visible
// for now; a later run, local or CI, resolves it and removes it if needed.
const hidden = resolved.filter((r) => r.availability && r.availability !== 'public')
if (hidden.length) {
  console.warn(`⚠ Excluding ${hidden.length} non-public video(s):`)
  hidden.forEach((r) => console.warn(`   - [${r.availability}] ${r.e.title}`))
}
const visible = resolved.filter((r) => !hidden.includes(r))

// Newest first; same-day or undated keep playlist-relative order (stable).
const ordered = visible
  .slice()
  .sort((a, b) => {
    const ak = a.date ?? -1
    const bk = b.date ?? -1
    if (ak !== bk) return bk - ak
    return a.i - b.i
  })
  .map(({ e, date, availability }) => ({
    id: e.id,
    title: e.title.normalize('NFC'),
    duration: e.duration ? Math.round(e.duration) : null,
    date, // YYYYMMDD number, or null while still unresolved
    availability, // 'public' | 'unlisted' | 'private' | … | null while unresolved — cached so we don't re-fetch every run
  }))

const undated = ordered.filter((v) => v.date == null)
if (undated.length) {
  console.warn(`⚠ ${undated.length} video(s) still undated (cap ${FETCH_CAP}/run; later runs will fill them):`)
  undated.slice(0, 10).forEach((v) => console.warn(`   - ${v.title}`))
}

mkdirSync(outDir, { recursive: true })
const payload = {
  playlistId: PLAYLIST_ID,
  playlistUrl: url,
  count: ordered.length,
  videos: ordered, // newest-first by broadcast/upload date
}
writeFileSync(outFile, JSON.stringify(payload, null, 2))
console.log(`Wrote ${ordered.length} videos to src/data/videos.json (newest: ${ordered[0]?.title})`)
