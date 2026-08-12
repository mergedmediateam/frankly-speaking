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

// One metadata request for a single video's upload date → YYYYMMDD or null.
function fetchUploadDate(id) {
  try {
    const out = execFileSync(
      'yt-dlp',
      ['--no-warnings', '--skip-download', '--print', '%(upload_date)s', `https://www.youtube.com/watch?v=${id}`],
      { encoding: 'utf8', timeout: 90_000 }
    ).trim()
    if (/^\d{8}$/.test(out)) return Number(out)
  } catch {
    /* video gone / throttled — leave undated, a later run retries */
  }
  return null
}

const outDir = fileURLToPath(new URL('../src/data/', import.meta.url))
const outFile = outDir + 'videos.json'

// Cache: dates already resolved by previous runs (so the Action never re-fetches).
const cachedDate = new Map()
try {
  const prev = JSON.parse(readFileSync(outFile, 'utf8'))
  for (const v of prev.videos || []) if (v.id && v.date) cachedDate.set(v.id, v.date)
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

let fetched = 0
const resolved = entries.map((e, i) => {
  let date = titleDate(e.title) ?? cachedDate.get(e.id) ?? null
  if (date == null && fetched < FETCH_CAP) {
    fetched++
    date = fetchUploadDate(e.id)
    if (date) console.log(`  ↳ fetched date ${date} for ${e.title.slice(0, 60)}`)
  }
  return { e, i, date }
})

// Newest first; same-day or undated keep playlist-relative order (stable).
const ordered = resolved
  .slice()
  .sort((a, b) => {
    const ak = a.date ?? -1
    const bk = b.date ?? -1
    if (ak !== bk) return bk - ak
    return a.i - b.i
  })
  .map(({ e, date }) => ({
    id: e.id,
    title: e.title.normalize('NFC'),
    duration: e.duration ? Math.round(e.duration) : null,
    date, // YYYYMMDD number, or null while still unresolved
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
