// Fetches the Frankly Speaking YouTube playlist into src/data/videos.json,
// sorted NEWEST-FIRST by the broadcast date in each title.
//
// Why sort by title date instead of playlist order: YouTube appends newly-added
// videos to the END of this playlist (not the top), and yt-dlp's fast
// --flat-playlist mode does not expose upload dates. Every broadcast title carries
// its date ("... | June 22, 2026", "May 22nd, 2026 Global Dispatch ..."), so we
// parse that and sort by it — guaranteeing the most recent episode is always first.
//
// Re-run whenever new episodes are published:  node scripts/fetch-playlist.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PLAYLIST_ID = 'PLjxZripGCNoRFIX8HQIoufzmXD7Hegavj'
const url = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`

const MONTH = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

// Returns a sortable YYYYMMDD number, or null when no date is found in the title.
// Matches "June 22, 2026" and "May 22nd, 2026" (ordinal + optional comma), anywhere.
function dateKey(title) {
  const m = /\b([A-Z][a-z]{2,8})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/.exec(title)
  if (!m) return null
  const mon = MONTH[m[1].slice(0, 3).toLowerCase()]
  if (!mon) return null
  return Number(m[3]) * 10000 + mon * 100 + Number(m[2])
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

// Sort newest-first by parsed date. Undated titles (no reliable signal) sink to the
// bottom while keeping their original relative order (stable sort).
const ordered = entries
  .map((e, i) => ({ e, i, key: dateKey(e.title) }))
  .sort((a, b) => {
    const ak = a.key ?? -1
    const bk = b.key ?? -1
    if (ak !== bk) return bk - ak // newer date first
    return a.i - b.i // tie / undated → preserve playlist order
  })
  .map(({ e }) => ({
    id: e.id,
    title: e.title.normalize('NFC'),
    duration: e.duration ? Math.round(e.duration) : null,
  }))

const undated = entries.filter((e) => dateKey(e.title) === null)
if (undated.length) {
  console.warn(`⚠ ${undated.length} title(s) had no parseable date (sorted to the bottom):`)
  undated.forEach((e) => console.warn(`   - ${e.title}`))
}

const outDir = fileURLToPath(new URL('../src/data/', import.meta.url))
mkdirSync(outDir, { recursive: true })
const payload = {
  playlistId: PLAYLIST_ID,
  playlistUrl: url,
  count: ordered.length,
  videos: ordered, // newest-first by broadcast date
}
writeFileSync(outDir + 'videos.json', JSON.stringify(payload, null, 2))
console.log(`Wrote ${ordered.length} videos to src/data/videos.json (newest: ${ordered[0]?.title})`)
