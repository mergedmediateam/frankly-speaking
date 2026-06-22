# Frankly Speaking

Daily faith-leadership news broadcast site for **Frank Amedia** — a project of **Touch Heaven International Ministries** (Canfield, OH).

- **Live:** https://franklyspeakingshow.com
- **Stack:** Vite + React + TypeScript, Tailwind v4, GSAP + Lenis
- **Hosting:** Vercel (project `frankly-speaking`), auto-deploys on every push to `master`.

## Local development

```bash
npm install
npm run dev      # http://localhost:5190
npm run build    # tsc -b && vite build → dist/
```

## Content: the YouTube playlist

The Dispatches/Series pages are driven by `src/data/videos.json`, generated from the
Frankly Speaking YouTube playlist (`PLjxZripGCNoRFIX8HQIoufzmXD7Hegavj`).

Refresh manually:

```bash
node scripts/fetch-playlist.mjs   # needs yt-dlp on PATH
```

### Automatic daily updates

`.github/workflows/update-playlist.yml` runs **every day (09:00 UTC)** in GitHub
Actions: it installs yt-dlp, re-fetches the playlist, and — only if there are new
episodes — commits the updated `videos.json` and pushes. Because the repo is
connected to Vercel, that push triggers a production deploy automatically. So new
episodes appear on the site within a day of being published, with no manual steps.

You can also trigger it on demand from the repo's **Actions → Update playlist →
Run workflow** button.
