// Fetches the Frankly Speaking YouTube playlist (newest-first) into src/data/videos.json
// Re-run whenever new episodes are published:  node scripts/fetch-playlist.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PLAYLIST_ID = 'PLjxZripGCNoRFIX8HQIoufzmXD7Hegavj'
const url = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`

console.log('Fetching playlist via yt-dlp…')
const raw = execFileSync(
  'yt-dlp',
  ['--flat-playlist', '--no-warnings', '-J', url],
  { maxBuffer: 1024 * 1024 * 128, encoding: 'utf8' }
)

const data = JSON.parse(raw)
const videos = (data.entries || [])
  .filter((e) => e && e.id && e.title && e.title !== '[Private video]' && e.title !== '[Deleted video]')
  .map((e) => ({
    id: e.id,
    title: e.title.normalize('NFC'),
    duration: e.duration ? Math.round(e.duration) : null,
  }))

const outDir = fileURLToPath(new URL('../src/data/', import.meta.url))
mkdirSync(outDir, { recursive: true })
const payload = {
  playlistId: PLAYLIST_ID,
  playlistUrl: url,
  count: videos.length,
  videos, // already newest-first (playlist order)
}
writeFileSync(outDir + 'videos.json', JSON.stringify(payload, null, 2))
console.log(`Wrote ${videos.length} videos to src/data/videos.json`)
