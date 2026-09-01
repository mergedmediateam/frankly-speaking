import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'
import playlist from './data/videos.json'
import podcast from './data/podcast.json'
import { FORUM_FORM, PARTNER_FORM, DONATE, PODCAST } from './config'

gsap.registerPlugin(ScrollTrigger)

/* Lenis owns scrolling for the whole site, so anything that wants to move the
   page has to go through it — a native scrollIntoView fights the smooth-scroll
   loop and lands in the wrong place. App assigns the instance here on mount so
   components further down can reach it without prop-drilling a ref. */
let lenisInstance: Lenis | null = null

function smoothScrollTo(target: HTMLElement, offset = -90) {
  if (lenisInstance) lenisInstance.scrollTo(target, { offset, duration: 1.1 })
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ---------------------------------- DATA ---------------------------------- */

const NAV = [
  { label: 'Episodes', href: '#/episodes' },
  { label: 'Series', href: '#/series' },
  { label: 'Podcast', href: '#/podcast' },
  { label: 'Be On The Show', href: '#/be-on-the-show' },
  { label: 'About', href: '#/about' },
]

const SOCIALS = [
  {
    label: 'YouTube',
    handle: 'Frankly Speaking with Pastor Frank Amedia',
    cta: 'Subscribe',
    href: 'https://www.youtube.com/@TCTTVNet/featured',
    // YouTube play button
    path: 'M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.19 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.42-4.81ZM10 15.13V8.87L15.25 12 10 15.13Z',
  },
  {
    label: 'Facebook',
    handle: 'Frankly Speaking',
    cta: 'Follow',
    href: 'https://www.facebook.com/people/Frankly-Speaking/61591621778787/',
    // Facebook "f"
    path: 'M13.5 21v-7.4h2.48l.37-2.88H13.5V8.88c0-.83.23-1.4 1.43-1.4h1.52V4.9c-.26-.03-1.17-.11-2.22-.11-2.2 0-3.7 1.34-3.7 3.8v2.13H8.04v2.88h2.49V21h2.97Z',
  },
  {
    label: 'Instagram',
    handle: '@franklyspeaking_show',
    cta: 'Follow',
    href: 'https://www.instagram.com/franklyspeaking_show/',
    // Instagram camera
    path: 'M12 2.2c-2.66 0-3 .01-4.04.06-1.05.05-1.76.21-2.39.46a4.8 4.8 0 0 0-1.74 1.13A4.8 4.8 0 0 0 2.7 5.59c-.25.63-.41 1.34-.46 2.39C2.2 9.02 2.2 9.36 2.2 12s.01 2.98.05 4.02c.05 1.05.21 1.76.46 2.39.26.66.6 1.22 1.13 1.74.52.52 1.08.87 1.74 1.13.63.24 1.34.41 2.39.46 1.04.04 1.38.05 4.03.05s2.99-.01 4.03-.05c1.05-.05 1.76-.22 2.39-.46a4.8 4.8 0 0 0 1.74-1.13c.52-.52.87-1.08 1.13-1.74.24-.63.41-1.34.46-2.39.04-1.04.05-1.38.05-4.02s-.01-2.98-.05-4.02c-.05-1.05-.22-1.76-.46-2.39a4.8 4.8 0 0 0-1.13-1.74A4.8 4.8 0 0 0 18.42 2.7c-.63-.25-1.34-.41-2.39-.46C14.99 2.2 14.65 2.2 12 2.2Zm0 1.76c2.6 0 2.92.01 3.95.06.96.04 1.48.2 1.82.34.46.17.79.38 1.13.72.34.34.55.67.72 1.13.13.34.3.86.34 1.82.05 1.03.06 1.34.06 3.95s-.01 2.92-.06 3.95c-.04.96-.21 1.48-.34 1.82-.17.46-.38.79-.72 1.13a3 3 0 0 1-1.13.72c-.34.13-.86.3-1.82.34-1.03.05-1.34.06-3.95.06s-2.92-.01-3.95-.06c-.96-.04-1.48-.21-1.82-.34a3 3 0 0 1-1.13-.72 3 3 0 0 1-.72-1.13c-.13-.34-.3-.86-.34-1.82-.05-1.03-.06-1.34-.06-3.95s.01-2.92.06-3.95c.04-.96.2-1.48.34-1.82.17-.46.38-.79.72-1.13.34-.34.67-.55 1.13-.72.34-.13.86-.3 1.82-.34 1.03-.05 1.34-.06 3.95-.06Zm0 3a5.04 5.04 0 1 0 0 10.08A5.04 5.04 0 0 0 12 6.96Zm0 8.31a3.27 3.27 0 1 1 0-6.54 3.27 3.27 0 0 1 0 6.54Zm6.41-8.51a1.18 1.18 0 1 1-2.36 0 1.18 1.18 0 0 1 2.36 0Z',
  },
]

function SocialLinks({ className = '', iconClass = 'w-5 h-5' }: { className?: string; iconClass?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Frankly Speaking on ${s.label}`}
          title={s.label}
          className="text-bone/60 hover:text-blue-bright transition-colors duration-300"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={iconClass}>
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  )
}

/** Large magnetic social tile — glow follows the cursor, icon drifts toward it,
    elastic settle on leave. Used in the home "Follow the broadcast" band. */
function SocialTile({ s }: { s: (typeof SOCIALS)[number] }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const icon = iconRef.current
    if (!el || !icon) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const ixTo = gsap.quickTo(icon, 'x', { duration: 0.35, ease: 'power3.out' })
    const iyTo = gsap.quickTo(icon, 'y', { duration: 0.35, ease: 'power3.out' })

    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      xTo(dx * 0.1)
      yTo(dy * 0.1)
      ixTo(dx * 0.22)
      iyTo(dy * 0.22)
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    const enter = () => gsap.to(icon, { scale: 1.12, duration: 0.4, ease: 'power3.out' })
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' })
      gsap.to(icon, { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' })
    }

    el.addEventListener('mousemove', move)
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <a
      ref={ref}
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Frankly Speaking on ${s.label} — ${s.handle}`}
      className="social-tile group relative overflow-hidden rounded-2xl border border-line bg-ink-soft px-8 py-12 flex flex-col items-center text-center will-change-transform"
    >
      <span aria-hidden className="social-tile-glow" />
      <div ref={iconRef} className="social-tile-icon relative text-bone transition-colors duration-300 group-hover:text-blue-bright">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-16 h-16 md:w-20 md:h-20">
          <path d={s.path} />
        </svg>
      </div>
      <span className="relative mt-7 font-display text-2xl tracking-tight">{s.label}</span>
      <span className="relative mt-1.5 font-mono text-xs text-slate">{s.handle}</span>
      <span className="relative mt-5 kicker text-blue-bright opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        {s.cta} →
      </span>
    </a>
  )
}

const TICKER = [
  'JUST LAUNCHED — the Frankly Speaking Podcast · listen on Apple Podcasts & Spotify',
  'GLOBAL DISPATCH — Israel & Iran: the prophetic timeline, decoded',
  'NEW EPISODE — The Case For Israel, Pt. 3',
  'BE ON THE SHOW — meet the guests, then take your seat at the desk',
  'BECOME A SPONSOR — help keep the broadcast on air',
  'LIVE WED 8PM ET — Touch Heaven Studios, Canfield OH',
]

type Video = { id: string; title: string; duration: number | null; date?: number | null }

const VIDEOS = playlist.videos as Video[]

/* Podcast cover art.

   The Buzzsprout feed still serves the old artwork, so podcast.json carries
   storage.buzzsprout.com URLs. Until the new covers are uploaded there, prefer
   the local files in public/podcast/ and fall back to whatever the feed gives
   us for anything we don't have art for. Applied once where EPISODES/SHOW are
   built, so every consumer picks it up.

   Once the new art is live on Buzzsprout, delete PODCAST_ART_COUNT/podcastCover
   and point these back at the feed. */
const PODCAST_ART_COUNT = 24
const podcastCover = (num: number, fallback: string) =>
  num >= 1 && num <= PODCAST_ART_COUNT
    ? `/podcast/ep-${String(num).padStart(2, '0')}.jpg`
    : fallback

// Show artwork, used by the home teaser as well as the podcast page.
const PODCAST_COVER = '/podcast/show.jpg'
const LATEST_ID = VIDEOS[0]?.id ?? ''

/* ------------------------------- HELPERS --------------------------------- */

function formatDuration(s: number | null) {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  return `${m}:${ss}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// videos.json stores dates as YYYYMMDD numbers → "Aug 11, 2026"
function formatDate(d: number | null | undefined) {
  if (!d) return ''
  const y = Math.floor(d / 10000)
  const m = Math.floor((d % 10000) / 100)
  const day = d % 100
  if (m < 1 || m > 12) return ''
  return `${MONTHS[m - 1]} ${day}, ${y}`
}

function cleanTitle(t: string) {
  return t
    .replace(/\s*\|\s*TCT\s*\/\s*Frankly Speaking\s*$/i, '')
    .replace(/\s*[—–-]\s*In-?Depth Analysis\s*/i, '')
    .replace(/\s*\|\s*$/g, '')
    .trim()
}

function seriesNameOf(title: string) {
  const m = /^(.*?)\s*\|\s*Part\s*\d+/i.exec(title)
  return m ? m[1].trim() : null
}

function partNumOf(title: string) {
  const m = /\|\s*Part\s*(\d+)/i.exec(title)
  return m ? parseInt(m[1], 10) : 0
}

function categoryOf(t: string) {
  if (seriesNameOf(t)) return 'Series'
  if (/global dispatch/i.test(t)) return 'Global Dispatch'
  if (/forum/i.test(t)) return 'The Forum'
  return 'Broadcast'
}

// Group by series name first, then only keep groups with 2+ parts as real series
const SERIES_GROUPS = (() => {
  const map = new Map<string, Video[]>()
  for (const v of VIDEOS) {
    const name = seriesNameOf(v.title)
    if (!name) continue
    if (!map.has(name)) map.set(name, [])
    map.get(name)!.push(v)
  }
  return [...map.entries()]
    .filter(([, eps]) => eps.length >= 2)
    .map(([name, eps]) => ({
      name,
      episodes: eps.slice().sort((a, b) => partNumOf(a.title) - partNumOf(b.title)),
    }))
})()

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

/* ------------------------------- PRIMITIVES ------------------------------ */

function Photo({
  label,
  src,
  className = '',
  imgClassName = '',
}: {
  label: string
  src?: string
  className?: string
  imgClassName?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-ink-soft border border-line ${className}`}>
      {src ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue/25 via-transparent to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
      {!src && <span className="absolute bottom-3 left-3 kicker text-slate">{label}</span>}
    </div>
  )
}

function VideoThumb({ v }: { v: Video }) {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-line bg-ink-soft transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:border-blue/40 group-hover:shadow-[0_24px_60px_-24px_rgba(31,111,229,0.6)]">
      <img
        src={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`}
        onError={(e) => {
          const img = e.currentTarget
          if (!img.dataset.fb) {
            img.dataset.fb = '1'
            img.src = `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`
          }
        }}
        onLoad={(e) => {
          // maxresdefault missing → YouTube serves a 120x90 placeholder with 200; swap to native 16:9 mq
          const img = e.currentTarget
          if (img.naturalWidth <= 121 && !img.dataset.fb) {
            img.dataset.fb = '1'
            img.src = `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`
          }
        }}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      {v.duration && (
        <span className="absolute bottom-2 right-2 font-mono text-[11px] bg-ink/80 text-bone px-1.5 py-0.5 rounded">
          {formatDuration(v.duration)}
        </span>
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid place-items-center w-14 h-14 rounded-full bg-ink/55 border border-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-blue group-hover:scale-110">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </div>
  )
}

function VideoCard({ v }: { v: Video }) {
  return (
    <a
      href={`#/watch/${v.id}`}
      className="group snap-start shrink-0 w-[280px] sm:w-[330px] lg:w-[360px] block"
    >
      <VideoThumb v={v} />
      <span className="mt-4 flex items-baseline gap-3">
        <span className="kicker text-blue-bright">{categoryOf(v.title)}</span>
        {v.date ? (
          <span className="font-mono text-[11px] text-slate tabular-nums">{formatDate(v.date)}</span>
        ) : null}
      </span>
      <h3 className="mt-2 font-display text-lg leading-snug tracking-tight text-bone line-clamp-2 group-hover:text-white transition-colors">
        {cleanTitle(v.title)}
      </h3>
    </a>
  )
}

function VideoTile({ v }: { v: Video }) {
  return (
    <a href={`#/watch/${v.id}`} className="group block">
      <VideoThumb v={v} />
      <span className="mt-3 flex items-baseline gap-3">
        <span className="kicker text-blue-bright">{categoryOf(v.title)}</span>
        {v.date ? (
          <span className="font-mono text-[11px] text-slate tabular-nums">{formatDate(v.date)}</span>
        ) : null}
      </span>
      <h3 className="mt-2 font-display text-base leading-snug tracking-tight text-bone line-clamp-2 group-hover:text-white transition-colors">
        {cleanTitle(v.title)}
      </h3>
    </a>
  )
}

function VideoRow({ videos }: { videos: Video[] }) {
  const scroller = useRef<HTMLDivElement>(null)
  const scrollByDir = (dir: number) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.9, 760), behavior: 'smooth' })
  }
  return (
    <>
      <div className="flex items-center gap-3 mb-6 justify-end">
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label="Previous"
          className="grid place-items-center w-11 h-11 rounded-full border border-line text-bone/80 hover:border-blue-bright hover:text-bone transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label="Next"
          className="grid place-items-center w-11 h-11 rounded-full border border-line text-bone/80 hover:border-blue-bright hover:text-bone transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6"
      >
        {videos.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>
    </>
  )
}

function PageHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-12" data-reveal style={{ transform: 'translateY(24px)' }}>
      <span className="kicker text-blue-bright">{kicker}</span>
      <h1 className="mt-3 font-display text-4xl md:text-6xl tracking-tight leading-[1.02]">{title}</h1>
      {sub && <p className="mt-5 max-w-2xl text-bone/65 leading-relaxed">{sub}</p>}
    </div>
  )
}

/* --------------------------------- PAGES --------------------------------- */

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[calc(100svh-104px)] flex items-end justify-center overflow-hidden bg-ink">
        {/* mobile (vertical 9:16) */}
        <video
          className="md:hidden absolute inset-0 w-full h-full object-cover bg-ink"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-frame-mobile.jpg"
        >
          <source src="/video/hero-mobile.mp4" type="video/mp4" />
        </video>
        {/* desktop (landscape 16:9) */}
        <video
          data-hero-video
          className="hidden md:block absolute inset-0 w-full h-full object-cover bg-ink will-change-transform"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-frame.jpg"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-ink via-ink/55 via-30% to-transparent to-70%"
        />
        <div data-hero-content className="relative z-10 w-full max-w-[1100px] px-6 pb-14 md:pb-20 flex flex-col items-center text-center">
          <h1 className="font-display font-medium leading-[0.95] tracking-tight text-[clamp(2.4rem,6.5vw,5.5rem)] drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
            <span className="block overflow-hidden">
              <span data-hero-line className="block" style={{ opacity: 0, transform: 'translateY(110%)' }}>
                I can only
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block" style={{ opacity: 0, transform: 'translateY(110%)' }}>
                be <span className="italic text-blue-bright">Frank.</span>
              </span>
            </span>
          </h1>
          <p
            className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-bone/75"
            data-hero-fade
            style={{ opacity: 0, transform: 'translateY(16px)' }}
          >
            A daily leadership broadcast with Frank Amedia — Kingdom insight,
            strategy, and alignment, read plainly for the people called to govern
            in their sphere.
          </p>
          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
            data-hero-fade
            style={{ opacity: 0, transform: 'translateY(16px)' }}
          >
            <a
              href="#/sponsor"
              className="inline-flex items-center gap-2 bg-blue text-white px-7 py-3.5 rounded-full font-medium hover:bg-blue-bright transition-colors"
            >
              Become a Sponsor
            </a>
            <a
              href="#/be-on-the-show"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-bone/25 text-bone hover:border-blue-bright hover:text-white transition-colors backdrop-blur-sm"
            >
              Be On The Show →
            </a>
            <a
              href={`#/watch/${LATEST_ID}`}
              className="group inline-flex items-center gap-3 bg-bone text-ink px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue" />
              Watch the latest broadcast
            </a>
          </div>
        </div>
      </section>

      {/* PODCAST LAUNCH BULLETIN — news-flash band pinned under the hero.
          Scaled up on request to protagonist weight: lockup-grade headline with
          the blue shimmer, large cover, and a periodic light sweep so the band
          reads as LIVE news. Still one clickable strip, not a second hero —
          the full podcast teaser further down does the big sell. */}
      <a
        href="#/podcast"
        className="podcast-bulletin group relative block border-y border-blue-bright/30 bg-gradient-to-r from-ink-soft via-[#101d38] to-ink-soft overflow-hidden"
        data-reveal
        style={{ transform: 'translateY(18px)' }}
      >
        {/* blue edge-bar + ambient glow + periodic light sweep */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-bright to-blue" />
        <span
          aria-hidden
          className="absolute -top-24 left-1/4 w-[540px] h-[220px] rounded-full bg-blue/20 blur-3xl pointer-events-none"
        />
        <span aria-hidden className="bulletin-sweep" />

        <div className="relative mx-auto max-w-[1400px] px-6 py-7 md:py-9 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
          <img
            src={PODCAST_COVER}
            alt=""
            className="hidden sm:block w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-blue-bright/30 shadow-[0_0_30px_-8px_rgba(59,139,255,0.5)] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2.5 font-body font-bold uppercase tracking-[0.2em] text-blue-bright text-[0.8rem] sm:text-sm">
              <span className="live-dot w-2 h-2 rounded-full bg-blue-bright" />
              Just launched
            </span>
            <p className="mt-1.5 font-body font-black uppercase tracking-[-0.015em] leading-[0.95] text-bone text-2xl sm:text-3xl md:text-[2.6rem]">
              The Frankly Speaking <span className="title-shimmer-blue">Podcast</span> is here
            </p>
            <p className="hidden md:block mt-2 text-[0.95rem] text-bone/60 truncate">
              The broadcast, cut down to the moments that still hold — new episodes on every platform.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-3 bg-blue text-white text-sm sm:text-base font-medium rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-[0_0_34px_-8px_rgba(59,139,255,0.7)] group-hover:bg-blue-bright transition-[background-color,transform] duration-300 group-hover:scale-[1.05]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-[1px]" aria-hidden>
              <path d="M8 5.14v13.72a.5.5 0 0 0 .77.42l10.4-6.86a.5.5 0 0 0 0-.84L8.77 4.72a.5.5 0 0 0-.77.42Z" />
            </svg>
            Listen now
          </span>
        </div>
      </a>

      {/* LATEST EPISODES (teaser carousel — motion-graphic header, same gallery) */}
      <section className="relative border-t border-line overflow-hidden">
        {/* ambient glow accents */}
        <div
          aria-hidden="true"
          className="absolute -top-28 -left-28 w-[440px] h-[440px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(31,111,229,0.15), transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-36 right-[-8%] w-[540px] h-[540px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(12,63,150,0.18), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 py-16">
          <div className="flex items-end justify-between gap-6 mb-7">
            <div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: SHOW_EASE }}
              >
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-bright opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-bright" />
                </span>
                <span className="kicker text-blue-bright">{playlist.count} episodes</span>
              </motion.div>
              {/* whileInView lives on the h2 (unclipped) and drives the masked
                  spans via variants — a fully-clipped span never "enters view" */}
              <motion.h2
                className="mt-3 font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl"
                aria-label="Latest episodes"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.6 }}
              >
                <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]" aria-hidden="true">
                  <motion.span
                    className="inline-block text-white"
                    variants={{
                      hidden: { y: '112%' },
                      visible: { y: '0%', transition: { duration: 0.8, ease: SHOW_EASE, delay: 0.1 } },
                    }}
                  >
                    LATEST&nbsp;
                  </motion.span>
                </span>
                <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]" aria-hidden="true">
                  <motion.span
                    className="inline-block title-shimmer-blue"
                    variants={{
                      hidden: { y: '112%' },
                      visible: { y: '0%', transition: { duration: 0.8, ease: SHOW_EASE, delay: 0.24 } },
                    }}
                  >
                    EPISODES
                  </motion.span>
                </span>
              </motion.h2>
              <motion.div
                aria-hidden="true"
                className="mt-4 h-[2px] w-44 md:w-72 bg-gradient-to-r from-blue-bright/80 to-transparent origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: SHOW_EASE, delay: 0.5 }}
              />
            </div>
            <motion.a
              href="#/episodes"
              className="hidden sm:inline-block shrink-0 px-6 py-3 rounded-full border border-blue-bright/50 bg-blue/15 kicker !text-[0.75rem] text-blue-bright hover:bg-blue-bright hover:text-white transition-colors mb-1"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: SHOW_EASE, delay: 0.4 }}
            >
              View all →
            </motion.a>
          </div>
          <div data-reveal style={{ transform: 'translateY(28px)' }}>
            <VideoRow videos={VIDEOS.slice(0, 15)} />
          </div>
        </div>
      </section>

      {/* SERIES TEASER */}
      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-[1400px] px-6 py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1" data-reveal style={{ transform: 'translateY(28px)' }}>
            <span className="kicker text-blue-bright">Featured Series</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.02] tracking-tight">
              The Seven Spheres of the Kingdom of God
            </h2>
            <p className="mt-6 max-w-lg text-bone/65 leading-relaxed">
              A leadership training on biblical governance — plus every multi-part
              teaching series, gathered in one place.
            </p>
            <div className="mt-8">
              <a href="#/series" className="bg-blue text-white px-6 py-3.5 rounded-full font-medium hover:bg-blue-bright transition-colors">
                Explore the series
              </a>
            </div>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2" data-reveal style={{ transform: 'translateY(28px)' }}>
            <a href="#/series" className="block">
              <Photo label="Series — Seven Spheres" src="/images/06-seven-spheres.png" className="aspect-[16/10] w-full" />
            </a>
          </div>
        </div>
      </section>

      {/* PODCAST TEASER — the audio show. Art on the LEFT so the band mirrors the
          series teaser above it and the page keeps alternating. */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-20 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5" data-reveal style={{ transform: 'translateY(28px)' }}>
            <a href="#/podcast" className="block relative group">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue/20 blur-3xl pointer-events-none" aria-hidden />
              <div className="relative aspect-square w-full max-w-[400px] mx-auto overflow-hidden rounded-2xl border border-line bg-ink-soft">
                <img
                  src={PODCAST_COVER}
                  alt="Frankly Speaking Podcast cover art"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid place-items-center w-16 h-16 rounded-full bg-blue/90 text-white backdrop-blur transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                    <PlayIcon className="w-7 h-7 translate-x-[2px]" />
                  </span>
                </span>
              </div>
            </a>
          </div>
          <div className="lg:col-span-7" data-reveal style={{ transform: 'translateY(28px)' }}>
            <span className="kicker text-blue-bright">Now on every podcast app</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.02] tracking-tight">
              Frankly Speaking Podcast
            </h2>
            <p className="mt-6 max-w-lg text-bone/65 leading-relaxed">
              The broadcast, cut down to the moments that still hold — frontline
              dispatches, testimony, and prophecy read against the morning&rsquo;s
              headlines. Take it with you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#/podcast"
                className="inline-flex items-center gap-2.5 bg-blue text-white px-6 py-3.5 rounded-full font-medium hover:bg-blue-bright transition-[background-color,transform] duration-300 hover:scale-[1.04] active:scale-95"
              >
                <PlayIcon className="w-4 h-4 translate-x-[1px]" />
                Listen now
              </a>
              {PODCAST.appleUrl && (
                <a
                  href={PODCAST.appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-line text-bone/85 px-6 py-3.5 rounded-full font-medium hover:border-blue-bright hover:text-white transition-colors"
                >
                  Apple Podcasts ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7" data-reveal style={{ transform: 'translateY(28px)' }}>
            <a href="#/about" className="block">
              <Photo label="Frank Amedia" src="/images/host.jpg" imgClassName="object-top" className="aspect-[16/10] w-full" />
            </a>
          </div>
          <div className="lg:col-span-5" data-reveal style={{ transform: 'translateY(28px)' }}>
            <span className="kicker text-blue-bright">The Host</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight leading-[1.03]">
              Frank Amedia
            </h2>
            <p className="mt-6 text-bone/70 leading-relaxed">
              Apostolic and prophetic voice who has ministered around the world for
              over forty years, broadcasting from Touch Heaven Studios in Canfield,
              Ohio.
            </p>
            <a href="#/about" className="mt-7 inline-block kicker text-slate hover:text-bone transition-colors">
              More about Frank →
            </a>
          </div>
        </div>
      </section>

      {/* TOUCH HEAVEN — PARENT MINISTRY */}
      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <div
            className="relative overflow-hidden rounded-2xl border border-blue-bright/25 bg-gradient-to-br from-blue-deep/45 via-ink to-ink px-8 py-14 md:px-14 md:py-20"
            data-reveal
            style={{ transform: 'translateY(28px)' }}
          >
            <div aria-hidden className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8">
                <span className="kicker text-blue-bright">Part of the ministry</span>
                <h2 className="mt-4 font-display text-3xl md:text-5xl leading-[1.04] tracking-tight">
                  Touch Heaven International Ministries
                </h2>
                <p className="mt-5 max-w-xl text-bone/70 leading-relaxed">
                  Frankly Speaking broadcasts from the house of Touch Heaven — an
                  apostolic and prophetic ministry preparing the way for the return
                  of the Lord through outreach, discipleship, and leadership
                  training.
                </p>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <a
                  href="https://www.touchheaven.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-bone text-ink px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
                >
                  Visit Touch Heaven ↗
                </a>
                <p className="mt-4 font-mono text-xs text-slate">
                  TOUCH HEAVEN MINISTRIES · CANFIELD, OHIO
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK GIVE — one tap straight to Square checkout */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-20">
          <div
            className="grid lg:grid-cols-12 gap-8 items-center"
            data-reveal
            style={{ transform: 'translateY(28px)' }}
          >
            <div className="lg:col-span-6">
              <span className="kicker text-blue-bright">Support the broadcast</span>
              <h2 className="mt-4 font-display text-3xl md:text-5xl tracking-tight leading-[1.04]">
                Keep it on the air.
              </h2>
              <p className="mt-4 max-w-md text-bone/60 leading-relaxed">
                Frankly Speaking is viewer-funded. One tap — your gift goes
                straight to work.
              </p>
            </div>
            <div className="lg:col-span-6 lg:justify-self-end">
              <QuickGive />
            </div>
          </div>
        </div>
      </section>

      {/* FOLLOW — SOCIAL CHANNELS */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-24">
          <div className="text-center" data-reveal style={{ transform: 'translateY(28px)' }}>
            <span className="kicker text-blue-bright">Stay connected</span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl tracking-tight leading-[1.04]">
              Follow the broadcast
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-bone/60 leading-relaxed">
              New episodes, clips, and moments from the studio — wherever you
              watch.
            </p>
          </div>
          <div data-grid className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SOCIALS.map((s) => (
              <SocialTile key={s.label} s={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* --- Episodes: sorting + automatic guest grouping ------------------------
   Everything derives from the live playlist titles at render time, so the
   ordering and the guest groups update themselves as new episodes drop. */
type SortMode = 'newest' | 'oldest' | 'az' | 'guest'

const NAME_STOP = /\s+(?:on|in|at|and|&|ends|reveals|talks?|joins?)\s+/i
const HONORIFIC = /^(?:Dr|Pastor|Rev|Evangelist|Amb(?:assador)?|Rabbi|Bishop|Capt(?:ain)?|CEO|President|Historian|Author|Prof(?:essor)?)\.?\s+/i

/* Words that disqualify a candidate "first name" — kills false positives
   like "The Man", "Six Men", "Direct Hit", "Hunting Noah". */
const NOT_A_NAME =
  /^(?:the|a|an|this|that|what|why|how|when|where|who|from|inside|after|before|under|behind|beyond|direct|one|two|three|four|five|six|seven|eight|nine|ten|is|was|are|did|does|can|will|his|her|their|our|new|last|first|hidden|hospital|holy|israel|israeli|iran|gaza|jerusalem|breaking|live|report)$/i

function looksLikeName(n: string): boolean {
  const words = n.trim().split(/\s+/)
  if (words.length < 2 || words.length > 3) return false
  if (!words.every((w) => /^[A-Z]/.test(w))) return false
  if (NOT_A_NAME.test(words[0]) || /ing$/.test(words[0])) return false
  return true
}

/* All guests a title belongs to. Known showcase guests can multi-match
   (a joint episode files under every guest in it); otherwise fall back to
   extracting one name from the title itself. */
function guestKeysOf(title: string): string[] {
  const hits: string[] = []
  for (const g of GUESTS) {
    const bare = g.name.replace(/^(?:Amb|Dr)\.\s*/i, '')
    if (title.includes(bare)) hits.push(bare)
  }
  if (hits.length) return hits

  // "… — Name … | Frankly Speaking / Global Dispatch" segment
  let m = /[—–]\s*([^|—–]+?)\s*\|\s*(?:Frankly Speaking|Global Dispatch)/i.exec(title)
  if (m) {
    let n = m[1].trim()
    n = n.replace(/^[\w.&' ]*?['’]s\s+/, '') // "CBN's Gordon Robertson" → "Gordon Robertson"
    n = n.split(NAME_STOP)[0]
    n = n.split(/['’]s\s/)[0]
    n = n.replace(HONORIFIC, '').replace(HONORIFIC, '').trim()
    if (looksLikeName(n)) return [n]
  }
  // Titles that open with the guest's name ("Alveda King on …", "Lou Engle's …")
  m = /^(?:Dr\.\s|Pastor\s)?([A-Z][\w.]+\s[A-Z][\w.]+?)(?:['’]s\s|\s+(?:on|in|at|joins?|talks?)\b)/.exec(title)
  if (m && looksLikeName(m[1])) return [m[1]]
  return []
}

const SORT_MODES: { key: SortMode; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'az', label: 'A–Z' },
  { key: 'guest', label: 'By guest' },
]

function DispatchesPage() {
  const [mode, setMode] = useState<SortMode>('newest')

  /* scroll-linked atmosphere: the page background drifts from ink through
     deep blue into turquoise as you descend, and a liquid bar fills with
     spring physics alongside */
  const { scrollYProgress } = useScroll()
  const liquid = useSpring(scrollYProgress, { stiffness: 55, damping: 16, mass: 0.6 })
  const fillH = useTransform(liquid, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`)
  const bgColor = useTransform(scrollYProgress, [0, 0.55, 1], ['#070a11', '#0c3f96', '#1487df'])

  /* draggable scrubber — grab the bar and drag to control scroll position/speed.
     Maps the pointer's y within the track to a target scroll and jumps there;
     dragging keeps scrubbing. */
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrubbing, setScrubbing] = useState(false)
  const scrubTo = (clientY: number) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientY - r.top) / r.height))
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: p * max })
  }
  const onScrubDown = (e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setScrubbing(true)
    scrubTo(e.clientY)
  }
  const onScrubMove = (e: React.PointerEvent) => {
    if (scrubbing) scrubTo(e.clientY)
  }
  const endScrub = () => setScrubbing(false)

  const sorted = useMemo(() => {
    if (mode === 'oldest') return [...VIDEOS].reverse()
    if (mode === 'az')
      return [...VIDEOS].sort((a, b) => cleanTitle(a.title).localeCompare(cleanTitle(b.title)))
    return VIDEOS
  }, [mode])

  const guestGroups = useMemo(() => {
    const groups = new Map<string, Video[]>()
    const rest: Video[] = []
    for (const v of VIDEOS) {
      const keys = guestKeysOf(v.title)
      if (keys.length) {
        for (const k of keys) {
          if (!groups.has(k)) groups.set(k, [])
          groups.get(k)!.push(v)
        }
      } else {
        rest.push(v)
      }
    }
    // insertion order = ordered by each guest's most recent episode (VIDEOS is newest-first)
    return { groups: [...groups.entries()], rest }
  }, [])

  return (
    <main className="min-h-[calc(100svh-104px)]">
      {/* portal to <body>: the page-transition transform on [data-page] would
          otherwise break position:fixed for these layers */}
      {createPortal(
        <>
          {/* scroll-tinted backdrop — ink → deep blue → bright azure */}
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none"
            style={{ backgroundColor: bgColor, opacity: 0.55, zIndex: -1 }}
          />
          {/* liquid scroll progress — springy fill with a glowing droplet head;
              also a draggable scrubber (wide invisible hit area, grab to scroll) */}
          <div
            ref={trackRef}
            onPointerDown={onScrubDown}
            onPointerMove={onScrubMove}
            onPointerUp={endScrub}
            onPointerCancel={endScrub}
            className="group hidden md:block fixed right-5 top-1/2 -translate-y-1/2 h-[56vh] z-30 cursor-grab active:cursor-grabbing touch-none select-none"
            style={{ width: 26 }}
            role="scrollbar"
            aria-label="Scroll position — drag to scrub"
          >
            {/* the visible rail */}
            <div className={`absolute left-1/2 -translate-x-1/2 h-full rounded-full bg-white/10 transition-[width] ${scrubbing ? 'w-2.5' : 'w-1.5 group-hover:w-2.5'}`}>
              <motion.div
                className="w-full rounded-full bg-gradient-to-b from-blue via-blue-bright to-[#54b4ff] shadow-[0_0_16px_rgba(84,180,255,0.55)]"
                style={{ height: fillH }}
              />
              <motion.div
                className={`absolute left-1/2 rounded-full bg-[#54b4ff] shadow-[0_0_20px_rgba(84,180,255,0.9)] transition-[width,height] ${scrubbing ? 'w-5 h-5' : 'w-4 h-4'}`}
                style={{ top: fillH, x: '-50%', y: '-50%' }}
                animate={scrubbing ? { scale: 1 } : { scale: [1, 1.28, 1] }}
                transition={scrubbing ? { duration: 0.2 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </>,
        document.body
      )}

      <div className="relative mx-auto max-w-[1400px] px-6 pt-14 pb-24">
        <PageHeader
          kicker={`${VIDEOS.length} episodes`}
          title="Episodes"
          sub="Every broadcast — current events and prophecy read through the Kingdom lens."
        />

        {/* sort / grouping controls */}
        <div className="flex flex-wrap items-center gap-2 -mt-4 mb-10">
          {SORT_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              aria-pressed={mode === m.key}
              className={`px-5 py-2.5 rounded-full font-mono text-[0.72rem] uppercase tracking-[0.18em] border transition-colors ${
                mode === m.key
                  ? 'bg-blue border-blue text-white'
                  : 'border-line text-bone/60 hover:text-bone hover:border-blue-bright/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'guest' ? (
          <motion.div key="guest" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: SHOW_EASE }}>
            {guestGroups.groups.map(([name, eps]) => (
              <div key={name} className="mb-14">
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl text-white">{name}</h2>
                  <span className="kicker text-blue-bright">
                    {eps.length} {eps.length === 1 ? 'episode' : 'episodes'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {eps.map((v) => (
                    <VideoTile key={v.id} v={v} />
                  ))}
                </div>
              </div>
            ))}
            {guestGroups.rest.length > 0 && (
              <div className="mb-14">
                <div className="flex items-baseline gap-4 mb-6">
                  <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl text-white">More broadcasts</h2>
                  <span className="kicker text-blue-bright">{guestGroups.rest.length} episodes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {guestGroups.rest.map((v) => (
                    <VideoTile key={v.id} v={v} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: SHOW_EASE }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
          >
            {sorted.map((v) => (
              <VideoTile key={v.id} v={v} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}

function SeriesPage() {
  return (
    <main className="min-h-[calc(100svh-104px)]">
      <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-24">
        <PageHeader
          kicker="Collections"
          title="Series"
          sub="Multi-part teaching series — watch each collection in order, start to finish."
        />

        {/* Featured: Seven Spheres */}
        <div
          className="grid lg:grid-cols-12 gap-10 items-center mb-20 pb-16 border-b border-line"
          data-reveal
          style={{ transform: 'translateY(28px)' }}
        >
          <div className="lg:col-span-6 order-2 lg:order-1">
            <span className="kicker text-blue-bright">Featured Series</span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl leading-[1.04] tracking-tight">
              The Seven Spheres of the Kingdom of God
            </h2>
            <p className="mt-6 max-w-lg text-bone/65 leading-relaxed">
              A leadership training on biblical governance — seven sessions mapping
              the spheres of influence God assigns to His people, and how to steward
              authority within them.
            </p>
            <a
              href="https://www.deepcalls2deepuniversity.org/products/courses/SevenSpheres"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-blue text-white px-6 py-3.5 rounded-full font-medium hover:bg-blue-bright transition-colors"
            >
              Enroll in the course ↗
            </a>
            <p className="mt-4 font-mono text-xs text-slate">
              A COURSE ON DEEP CALLS 2 DEEP UNIVERSITY
            </p>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2">
            <a
              href="https://www.deepcalls2deepuniversity.org/products/courses/SevenSpheres"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Photo label="Seven Spheres" src="/images/06-seven-spheres.png" className="aspect-[16/10] w-full" />
            </a>
          </div>
        </div>

        {/* Auto-grouped multi-part series */}
        <div className="space-y-16">
          {SERIES_GROUPS.map((s) => (
            <div key={s.name}>
              <div className="flex items-end justify-between gap-6 mb-6">
                <div>
                  <span className="kicker text-blue-bright">{s.episodes.length} parts</span>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl tracking-tight">{s.name}</h2>
                </div>
              </div>
              <div data-grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {s.episodes.map((v) => (
                  <VideoTile key={v.id} v={v} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

/* Guests featured on the broadcast — shown on Be On The Show.
   Order = showcase order top to bottom (Alvar's ranking). First 6 are the
   headliners (bigger frames). Photos are 16:9 recreations of each guest's
   portrait in public/images/guests/. episodeId links to the conversation
   when one exists in the playlist. */
type Guest = { name: string; title: string; photo: string; episodeId?: string; bgPos?: string }

const GUESTS: Guest[] = [
  { name: 'Amb. Yechiel Leiter', title: "Israel's Ambassador to the United States", photo: '/images/guests/yechiel.jpg', episodeId: 'i6e1ox0d0B8' },
  { name: 'Gordon Robertson', title: 'CEO, The Christian Broadcasting Network', photo: '/images/guests/gordon.jpg', episodeId: 'rUO6zm7j_mg' },
  { name: 'Yair Pinto', title: 'Host, TBN Israel · Captain (Res.), IDF', photo: '/images/guests/yair.jpg', episodeId: 'CHMLd7nE5mE' },
  { name: 'Dr. Alveda King', title: 'Evangelist · Niece of Dr. Martin Luther King Jr.', photo: '/images/guests/alveda.jpg', episodeId: '0C69gRQvxwM' },
  { name: 'Jentezen Franklin', title: 'Senior Pastor, Free Chapel', photo: '/images/guests/jentezen.jpg', episodeId: 'TzNazFzbvvk' },
  { name: 'Mati Shoshani', title: 'Director of Operations, TBN Israel', photo: '/images/guests/mati.jpg', episodeId: 'TeQYRgEmfNg' },
  { name: 'Allen Jackson', title: 'Senior Pastor, World Outreach Church', photo: '/images/guests/allen.jpg', episodeId: 'r1hX2EuVxOM' },
  { name: 'Samuel Smadja', title: 'Founder, Sar-El Tours · Director, TBN Israel', photo: '/images/guests/samuel.jpg', episodeId: 'ZwOhUv13un4' },
  { name: 'Troy Miller', title: 'President & CEO, National Religious Broadcasters', photo: '/images/guests/troy.jpg', episodeId: 'ImUE5c7HkA8' },
  { name: 'Lou Engle', title: 'Co-founder, TheCall', photo: '/images/guests/lou.jpg', episodeId: 'RbsxiQ4k5_I' },
  { name: 'Nick Hall', title: 'Founder & Chief Evangelist, Pulse', photo: '/images/guests/nick.jpg', episodeId: 'pnq5M527eL4' },
  { name: 'Dr. Erez Soref', title: 'President, ONE FOR ISRAEL', photo: '/images/guests/erez.jpg', episodeId: 'g3qrH9NRrsU', bgPos: '50% 8%' },
]

const SHOW_EASE = [0.22, 1, 0.36, 1] as const

/* Centered page title — broadcast-grade motion-graphic entrance:
   ghost outline zooms in behind, blue glow blooms, heavy bold characters
   cascade out of masks ("THE SHOW" in blue), rules draw outward, then a
   shimmer sweeps the blue words forever. */
function ShowTitle() {
  const reduced = useReducedMotion()
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), reduced ? 0 : 1900)
    return () => window.clearTimeout(t)
  }, [reduced])

  const CHAR_BASE = 0.4
  const renderWord = (word: string, blue: boolean, charOffset: number) => (
    <span className="inline-block whitespace-nowrap">
      {word.split('').map((c, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className={`inline-block ${blue ? 'text-blue-bright' : 'text-white'}`}
            initial={reduced ? false : { y: '118%', rotate: 7, scale: 1.12 }}
            animate={{ y: '0%', rotate: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: SHOW_EASE, delay: CHAR_BASE + (charOffset + i) * 0.045 }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </span>
  )

  return (
    <div className="relative text-center pt-8 pb-4">
      {/* ghost outline title — depth layer zooming in behind everything */}
      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase tracking-tight leading-none text-[clamp(5rem,17vw,13rem)] select-none pointer-events-none"
        style={{ WebkitTextStroke: '1.5px rgba(59,139,255,0.14)', color: 'transparent' }}
        initial={reduced ? false : { opacity: 0, scale: 2.1 }}
        animate={{ opacity: 1, scale: 1.42 }}
        transition={{ duration: 1.8, ease: SHOW_EASE, delay: 0.15 }}
      >
        BE ON THE SHOW
      </motion.span>

      {/* blue glow bloom */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[76vw] h-[46vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(31,111,229,0.3), transparent 62%)' }}
        initial={reduced ? false : { opacity: 0, scale: 0.55 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut', delay: 0.6 }}
      />

      {/* kicker with rules drawing outward */}
      <div className="relative flex items-center justify-center gap-4">
        <motion.span
          aria-hidden="true"
          className="h-px w-14 md:w-24 bg-gradient-to-l from-blue-bright/70 to-transparent origin-right"
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: SHOW_EASE, delay: 0.9 }}
        />
        <motion.span
          className="kicker text-blue-bright inline-block"
          initial={reduced ? false : { opacity: 0, letterSpacing: '0.7em' }}
          animate={{ opacity: 1, letterSpacing: '0.32em' }}
          transition={{ duration: 1.0, ease: SHOW_EASE, delay: 0.35 }}
        >
          Join the broadcast
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="h-px w-14 md:w-24 bg-gradient-to-r from-blue-bright/70 to-transparent origin-left"
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: SHOW_EASE, delay: 0.9 }}
        />
      </div>

      {/* the title */}
      <h1
        className="relative mt-5 font-black uppercase tracking-tight leading-[0.94] text-[clamp(2.8rem,9.5vw,8rem)] drop-shadow-[0_0_46px_rgba(31,111,229,0.45)]"
        aria-label="Be On The Show"
      >
        {settled ? (
          <span aria-hidden="true">
            <span className="text-white">BE ON</span>{' '}
            <span className="title-shimmer-blue">THE SHOW</span>
          </span>
        ) : (
          <span aria-hidden="true">
            {renderWord('BE', false, 0)} {renderWord('ON', false, 2)} {renderWord('THE', true, 4)}{' '}
            {renderWord('SHOW', true, 7)}
          </span>
        )}
      </h1>

      {/* underline draw */}
      <motion.div
        aria-hidden="true"
        className="mx-auto mt-7 h-[2px] w-[min(420px,60vw)] bg-gradient-to-r from-transparent via-blue-bright/80 to-transparent"
        initial={reduced ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: SHOW_EASE, delay: 1.25 }}
      />

      <motion.p
        className="mt-7 max-w-xl mx-auto text-bone/65 leading-relaxed"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.45 }}
      >
        The guests who've joined Frank at the desk — and how you can be next.
      </motion.p>
    </div>
  )
}

/* One floating portrait in the gallery. Zigzag: even index = frame-left,
   odd = frame-right. No frames, no borders — each photo melts into the ink
   background through a feathered opacity mask, with the guest's name laid
   over the lower part of the image. Per-image parallax + idle drift. */
const PARALLAX_SPEEDS = [70, 115, 55, 95, 65, 125]

/* Cutout of the guest (background removed) — same 16:9 canvas as the photo. */
const cutSrc = (photo: string) => photo.replace('/guests/', '/guests/cut/').replace('.jpg', '.png')

function FloatingGuest({ g, index }: { g: Guest; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const featured = index < 6
  const left = index % 2 === 0
  const speed = PARALLAX_SPEEDS[index % PARALLAX_SPEEDS.length]
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [speed, -speed])

  const BAND_MASK =
    'linear-gradient(to bottom, transparent 0%, black 28%, black 68%, transparent 100%)'
  const PERSON_MASK =
    'linear-gradient(to bottom, black 0%, black 84%, transparent 99%)'

  const inner = (
    <div className="relative h-full">
      {/* full-bleed blue scene — no frame, melts into the ink above and below
          so consecutive guests crossfade into each other */}
      <div className="absolute inset-0" style={{ maskImage: BAND_MASK, WebkitMaskImage: BAND_MASK }}>
        <img
          src={g.photo}
          alt=""
          aria-hidden="true"
          loading={index === 0 ? 'eager' : 'lazy'}
          style={{ objectPosition: g.bgPos ?? '50% 22%' }}
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-[#2135d6] mix-blend-color" />
        <div className="absolute inset-0 bg-[#101c66]/60 mix-blend-multiply" />
      </div>

      {/* the guest — floating free over the scene, never clipped */}
      <motion.div
        style={{ y }}
        className={`absolute bottom-[12%] ${left ? 'left-[6%] md:left-[11%]' : 'right-[6%] md:right-[11%]'} h-[62%] md:h-[68%]`}
      >
        <motion.div
          className="relative h-full"
          animate={reduced ? undefined : { y: [0, -10, 0] }}
          transition={reduced ? undefined : { duration: 6.5 + (index % 3) * 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={cutSrc(g.photo)}
            alt={g.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            style={{ maskImage: PERSON_MASK, WebkitMaskImage: PERSON_MASK }}
            className="h-full w-auto max-w-[92vw] object-contain origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06] hover:-translate-y-2"
          />
        </motion.div>
      </motion.div>

      {/* name — in the negative space on the opposite side of the guest,
          vertically centered, clear of the echo face */}
      <div
        className={`absolute top-[56%] -translate-y-1/2 ${
          left ? 'right-[3%] md:right-[6%]' : 'left-[3%] md:left-[6%]'
        } w-[52%] md:w-[40%] text-center pointer-events-none`}
      >
        <h3
          className={`font-black uppercase tracking-tight leading-[0.95] text-white drop-shadow-[0_4px_30px_rgba(7,10,17,0.9)] ${
            featured ? 'text-4xl md:text-7xl' : 'text-3xl md:text-5xl'
          }`}
        >
          {g.name}
        </h3>
        <p className="mt-4 text-xs md:text-base uppercase tracking-[0.26em] text-white/90 drop-shadow-[0_1px_14px_rgba(7,10,17,0.95)]">
          {g.title}
        </p>
        {g.episodeId && (
          <a
            href={`#/watch/${g.episodeId}`}
            className="pointer-events-auto mt-6 inline-block px-7 py-3.5 rounded-full border border-blue-bright/60 bg-blue/25 backdrop-blur-sm font-mono text-[0.72rem] md:text-[0.8rem] uppercase tracking-[0.22em] text-white hover:bg-blue-bright hover:border-blue-bright hover:shadow-[0_10px_36px_-8px_rgba(59,139,255,0.8)] transition-[background-color,border-color,box-shadow,transform] active:scale-[0.97]"
          >
            Watch the conversation →
          </a>
        )}
      </div>
    </div>
  )

  return (
    <div
      ref={ref}
      className={`relative left-1/2 -translate-x-1/2 w-screen h-[62vh] md:h-[94vh] ${index === 0 ? '' : '-mt-[8vh] md:-mt-[10vh]'}`}
    >
      <motion.div
        className="h-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <div className="h-full">{inner}</div>
      </motion.div>
    </div>
  )
}

function ShowApplyForm({ delay = 0 }: { delay?: number }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      // Google Forms accepts a urlencoded POST; no-cors (opaque, fire-and-forget).
      const body = new URLSearchParams()
      body.append(FORUM_FORM.nameField, name)
      body.append(FORUM_FORM.emailField, email)
      if (FORUM_FORM.messageField && message) body.append(FORUM_FORM.messageField, message)
      await fetch(FORUM_FORM.action, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-12 max-w-md mx-auto" aria-live="polite">
        <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-blue/15 border border-blue-bright/40">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h2 className="mt-6 font-display text-2xl tracking-tight">You're on the list.</h2>
        <p className="mt-3 text-bone/65">
          Watch your inbox — the team will be in touch about joining the show.
        </p>
      </div>
    )
  }

  return (
    <motion.form
      className="mt-11 max-w-lg mx-auto flex flex-col gap-3 text-left"
      onSubmit={submit}
      aria-live="polite"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: SHOW_EASE, delay }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full bg-ink-soft/60 backdrop-blur px-6 py-4 rounded-full border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright focus:shadow-[0_0_0_3px_rgba(59,139,255,0.15)] transition-[border-color,box-shadow]"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className="w-full bg-ink-soft/60 backdrop-blur px-6 py-4 rounded-full border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright focus:shadow-[0_0_0_3px_rgba(59,139,255,0.15)] transition-[border-color,box-shadow]"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        placeholder="Who are you, and why do you want to be on the show? What would you talk about with Frank?"
        className="w-full resize-none bg-ink-soft/60 backdrop-blur px-6 py-4 rounded-3xl border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright focus:shadow-[0_0_0_3px_rgba(59,139,255,0.15)] transition-[border-color,box-shadow] leading-relaxed"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-1 w-full bg-blue text-white px-7 py-4 rounded-full font-semibold tracking-wide uppercase hover:bg-blue-bright hover:shadow-[0_10px_40px_-10px_rgba(59,139,255,0.7)] transition-[background-color,box-shadow,transform] active:scale-[0.98] disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Apply to be on the show'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Something went wrong — please try again.</p>
      )}
    </motion.form>
  )
}

function BeyondPage() {
  return (
    <main className="min-h-[calc(100svh-104px)] overflow-x-clip">
      <div className="mx-auto max-w-[1400px] px-6 pt-14">
        <ShowTitle />

        {/* application form — duplicated at the top, right under the title */}
        <div className="mt-14 md:mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: SHOW_EASE }}
          >
            <span className="kicker text-blue-bright">Apply now</span>
            <p className="mt-4 max-w-xl mx-auto text-bone/65 leading-relaxed">
              Tell us who you are and what you'd bring to the desk — the team
              reviews every request and reaches out.
            </p>
          </motion.div>
          <ShowApplyForm delay={0.2} />
        </div>

        <div className="mt-20 md:mt-32">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: SHOW_EASE }}
          >
            <span className="kicker text-blue-bright">On the show</span>
            <h2 className="mt-4 font-display text-3xl md:text-[3.4rem] md:leading-[1.08] tracking-tight max-w-3xl mx-auto">
              These are some of the guests who've joined Frank at the desk.
            </h2>
          </motion.div>

          <div className="relative mt-6 md:mt-10 pb-24 md:pb-40">
            {GUESTS.map((g, i) => (
              <FloatingGuest key={g.name} g={g} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-line mt-8 overflow-hidden">
        {/* gradient stage behind the finale */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 42%, rgba(31,111,229,0.22), transparent 65%), linear-gradient(to bottom, transparent 0%, rgba(12,63,150,0.12) 45%, transparent 100%)',
          }}
        />
        {/* ghost outline behind the finale title */}
        <motion.span
          aria-hidden="true"
          className="absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase tracking-tight leading-none text-[clamp(4rem,14vw,11rem)] select-none pointer-events-none"
          style={{ WebkitTextStroke: '1.5px rgba(59,139,255,0.12)', color: 'transparent' }}
          initial={{ opacity: 0, scale: 1.9 }}
          whileInView={{ opacity: 1, scale: 1.35 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.6, ease: SHOW_EASE }}
        >
          YOUR TURN
        </motion.span>

        <div className="relative mx-auto max-w-[1400px] px-6 py-28 text-center">
          <div className="flex items-center justify-center gap-4">
            <motion.span
              aria-hidden="true"
              className="h-px w-14 md:w-24 bg-gradient-to-l from-blue-bright/70 to-transparent origin-right"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: SHOW_EASE, delay: 0.45 }}
            />
            <motion.span
              className="kicker text-blue-bright inline-block"
              initial={{ opacity: 0, letterSpacing: '0.7em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.32em' }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: SHOW_EASE, delay: 0.1 }}
            >
              Your turn
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="h-px w-14 md:w-24 bg-gradient-to-r from-blue-bright/70 to-transparent origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: SHOW_EASE, delay: 0.45 }}
            />
          </div>

          <h1
            className="mt-6 font-black uppercase tracking-tight leading-[0.95] text-[clamp(2.4rem,7vw,5.6rem)] drop-shadow-[0_0_40px_rgba(31,111,229,0.4)]"
            aria-label="Want to be on the show?"
          >
            <motion.span
              className="inline-block text-white"
              initial={{ opacity: 0, y: 46 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: SHOW_EASE, delay: 0.15 }}
            >
              WANT TO BE
            </motion.span>{' '}
            <motion.span
              className="inline-block title-shimmer-blue"
              initial={{ opacity: 0, y: 46 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: SHOW_EASE, delay: 0.3 }}
            >
              ON THE SHOW?
            </motion.span>
          </h1>

          <motion.p
            className="mt-7 max-w-xl mx-auto text-bone/65 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SHOW_EASE, delay: 0.5 }}
          >
            Tell us who you are and what you'd bring to the desk — the team
            reviews every request and reaches out.
          </motion.p>

          <ShowApplyForm delay={0.65} />

          <p className="mt-10 font-mono text-xs text-slate">
            TOUCH HEAVEN MINISTRIES · DEEP CALLS 2 DEEP UNIVERSITY
          </p>
        </div>
      </div>
    </main>
  )
}

/* --- Sponsor page ambient backdrop -------------------------------------
   Floating broadcast elements (glow orbs, signal rings, play triangles,
   sparks, dots) in two depth layers: staggered entrance on page load,
   endless slow drift, spring-smoothed mouse parallax. Pure decoration —
   pointer-events-none, low opacity, reduced-motion aware. */
type BackdropItem = {
  kind: 'orb' | 'ring' | 'play' | 'spark' | 'dot'
  x: number // left, %
  y: number // top, %
  size: number // px
  depth: number // mouse-parallax travel (px per half-viewport)
  dur: number // drift loop seconds
  delay: number // entrance delay
  o: number // resting opacity
}

const SPONSOR_BACKDROP: BackdropItem[] = [
  // deep glow orbs (far layer)
  { kind: 'orb', x: 6, y: 12, size: 380, depth: 14, dur: 13, delay: 0.2, o: 0.5 },
  { kind: 'orb', x: 78, y: 58, size: 460, depth: 10, dur: 16, delay: 0.35, o: 0.45 },
  { kind: 'orb', x: 55, y: -8, size: 300, depth: 18, dur: 14, delay: 0.5, o: 0.35 },
  // signal rings
  { kind: 'ring', x: 12, y: 62, size: 150, depth: 30, dur: 9, delay: 0.55, o: 0.5 },
  { kind: 'ring', x: 84, y: 16, size: 90, depth: 42, dur: 8, delay: 0.7, o: 0.6 },
  { kind: 'ring', x: 70, y: 82, size: 60, depth: 52, dur: 7, delay: 0.85, o: 0.5 },
  { kind: 'ring', x: 26, y: 8, size: 44, depth: 48, dur: 7.5, delay: 1.0, o: 0.45 },
  // play triangles
  { kind: 'play', x: 90, y: 44, size: 40, depth: 46, dur: 8.5, delay: 0.75, o: 0.55 },
  { kind: 'play', x: 7, y: 36, size: 30, depth: 54, dur: 7.2, delay: 0.9, o: 0.5 },
  { kind: 'play', x: 38, y: 88, size: 26, depth: 40, dur: 9.5, delay: 1.1, o: 0.4 },
  // sparks (plus marks)
  { kind: 'spark', x: 20, y: 26, size: 18, depth: 60, dur: 6.5, delay: 1.05, o: 0.6 },
  { kind: 'spark', x: 64, y: 10, size: 14, depth: 64, dur: 6, delay: 1.2, o: 0.5 },
  { kind: 'spark', x: 88, y: 74, size: 16, depth: 58, dur: 7, delay: 1.15, o: 0.55 },
  { kind: 'spark', x: 33, y: 70, size: 12, depth: 66, dur: 6.2, delay: 1.3, o: 0.45 },
  // dots
  { kind: 'dot', x: 48, y: 20, size: 6, depth: 70, dur: 5.5, delay: 1.25, o: 0.6 },
  { kind: 'dot', x: 15, y: 84, size: 8, depth: 62, dur: 6.8, delay: 1.35, o: 0.5 },
  { kind: 'dot', x: 94, y: 30, size: 5, depth: 74, dur: 5.8, delay: 1.4, o: 0.55 },
]

function BackdropShape({ it }: { it: BackdropItem }) {
  const s = it.size
  if (it.kind === 'orb')
    return (
      <div
        className="rounded-full blur-3xl"
        style={{ width: s, height: s, background: 'radial-gradient(circle, rgba(31,111,229,0.35), rgba(12,63,150,0.12) 55%, transparent 72%)' }}
      />
    )
  if (it.kind === 'ring')
    return (
      <div
        className="rounded-full border border-blue-bright/30"
        style={{ width: s, height: s, boxShadow: '0 0 24px rgba(59,139,255,0.12) inset' }}
      />
    )
  if (it.kind === 'play')
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M8 5.5v13l11-6.5z" stroke="rgba(59,139,255,0.55)" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    )
  if (it.kind === 'spark')
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M3 12h18" stroke="rgba(207,217,232,0.5)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  return <div className="rounded-full bg-blue-bright/60" style={{ width: s, height: s }} />
}

function BackdropFloat({
  it,
  smx,
  smy,
  reduced,
}: {
  it: BackdropItem
  smx: MotionValue<number>
  smy: MotionValue<number>
  reduced: boolean | null
}) {
  const x = useTransform(smx, (v) => v * it.depth)
  const y = useTransform(smy, (v) => v * it.depth)
  const spin = it.kind === 'ring' || it.kind === 'play' || it.kind === 'spark'
  return (
    <motion.div
      className="absolute"
      style={{ left: `${it.x}%`, top: `${it.y}%`, x, y }}
      initial={reduced ? false : { opacity: 0, scale: 0.4 }}
      animate={{ opacity: it.o, scale: 1 }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: it.delay }}
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : { y: [0, -16, 0], rotate: spin ? [0, it.kind === 'spark' ? 90 : 10, 0] : 0 }
        }
        transition={reduced ? undefined : { duration: it.dur, repeat: Infinity, ease: 'easeInOut', delay: it.delay }}
      >
        <BackdropShape it={it} />
      </motion.div>
    </motion.div>
  )
}

function SponsorBackdrop() {
  const reduced = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.4 })
  const smy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.4 })

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, mx, my])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ghost title — materializes, holds, dissolves, and regenerates forever */}
      <motion.span
        className="absolute left-1/2 top-[40%] whitespace-nowrap font-black uppercase tracking-tight leading-none text-[clamp(4rem,13vw,10.5rem)] select-none"
        style={{ x: '-50%', y: '-50%', WebkitTextStroke: '1.5px rgba(59,139,255,0.17)', color: 'transparent' }}
        animate={
          reduced
            ? { opacity: 0.6 }
            : {
                opacity: [0, 0.9, 0.9, 0],
                scale: [1.04, 1.12, 1.17, 1.27],
                filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(14px)'],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: 9, times: [0, 0.26, 0.64, 1], repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }
        }
      >
        BECOME A SPONSOR
      </motion.span>
      {SPONSOR_BACKDROP.map((it, i) => (
        <BackdropFloat key={i} it={it} smx={smx} smy={smy} reduced={reduced} />
      ))}
    </div>
  )
}

function PartnerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const body = new URLSearchParams()
      body.append(PARTNER_FORM.nameField, name)
      body.append(PARTNER_FORM.emailField, email)
      if (message) body.append(PARTNER_FORM.messageField, message)
      await fetch(PARTNER_FORM.action, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="relative min-h-[calc(100svh-104px)] grid place-items-center">
      <SponsorBackdrop />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-24 text-center" data-reveal style={{ transform: 'translateY(28px)' }}>
        <span className="kicker text-blue-bright">Stand with the broadcast</span>
        <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] tracking-tight">
          Become a <span className="italic">Sponsor</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-bone/65 leading-relaxed">
          Sponsors keep Frankly Speaking on the air — daily Kingdom insight,
          free for everyone, everywhere. Leave your details and the team will
          reach out personally about sponsoring the show.
        </p>

        {status === 'done' ? (
          <div className="mt-12 max-w-md mx-auto" aria-live="polite">
            <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-blue/15 border border-blue-bright/40">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="mt-6 font-display text-2xl tracking-tight">Thank you.</h2>
            <p className="mt-3 text-bone/65">
              The team has your details — expect a personal note about sponsoring
              the show.
            </p>
          </div>
        ) : (
          <form
            className="mt-10 max-w-md mx-auto flex flex-col gap-3"
            onSubmit={submit}
            aria-live="polite"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full bg-transparent px-6 py-4 rounded-full border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright transition-colors"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full bg-transparent px-6 py-4 rounded-full border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright transition-colors"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything you'd like the team to know (optional)"
              rows={3}
              className="w-full bg-transparent px-6 py-4 rounded-3xl border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-blue text-white px-7 py-4 rounded-full font-medium hover:bg-blue-bright transition-[background-color,transform] active:scale-95 disabled:opacity-60"
            >
              {status === 'loading' ? '…' : 'Become a Sponsor'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-400">Something went wrong — please try again.</p>
            )}
          </form>
        )}

        <p className="mt-8 font-mono text-xs text-slate">
          TOUCH HEAVEN MINISTRIES · CANFIELD, OHIO
        </p>
      </div>
    </main>
  )
}

/* --- Donate ------------------------------------------------------------
   Give page. Frequency toggle → amount tiles → checkout hand-off.
   Checkout is Square (see DONATE in config.ts); until the links are pasted in,
   the CTA surfaces a "being connected" notice rather than faking a payment. */

const GIVE_IMPACT = [
  {
    n: '01',
    title: 'The broadcast stays daily',
    body:
      'Studio time, crew, cameras and the edit bay behind every episode. Giving keeps the show on a daily rhythm instead of whenever it can be afforded.',
  },
  {
    n: '02',
    title: 'It stays free to watch',
    body:
      'No paywall, no subscription. Every dispatch goes out on YouTube, Facebook and this site for anyone, anywhere, at no cost.',
  },
  {
    n: '03',
    title: 'It reaches further',
    body:
      'Distribution, guests, and the travel that puts Frank in front of the people shaping the story — from Jerusalem to Washington.',
  },
]

function DonateBackdrop() {
  const reduced = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.4 })
  const smy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.4 })

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, mx, my])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {SPONSOR_BACKDROP.filter((it) => it.kind !== 'play').map((it, i) => (
        <BackdropFloat key={i} it={it} smx={smx} smy={smy} reduced={reduced} />
      ))}
    </div>
  )
}

function AmountTile({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative rounded-2xl border px-4 py-5 font-display text-2xl tracking-tight transition-[border-color,background-color,color,transform] duration-300 hover:scale-[1.03] active:scale-95 ${
        active
          ? 'border-blue-bright bg-blue/15 text-white shadow-[0_0_30px_-8px_rgba(59,139,255,0.6)]'
          : 'border-line text-bone/80 hover:border-blue-bright/60 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

/* Compact one-tap give strip used on the home page: preset amounts go straight
   to Square checkout; "Other" opens the full donate page. */
function QuickGive() {
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState(false)

  async function give(amount: number) {
    if (busy != null) return
    setError(false)
    setBusy(amount)
    try {
      const res = await fetch(DONATE.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freq: 'once', amount }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string }
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      setError(true)
    } catch {
      setError(true)
    }
    setBusy(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {[25, 50, 100].map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => give(a)}
            disabled={busy != null}
            className="min-w-[104px] px-7 py-3.5 rounded-full border border-line font-display text-xl tracking-tight text-bone hover:border-blue-bright hover:text-white hover:scale-[1.04] active:scale-95 transition-[border-color,color,transform] duration-300 disabled:opacity-50"
          >
            {busy === a ? '…' : `$${a}`}
          </button>
        ))}
        <a
          href="#/donate"
          className="px-7 py-3.5 rounded-full bg-blue text-white font-medium hover:bg-blue-bright hover:scale-[1.04] active:scale-95 transition-[background-color,transform] duration-300"
        >
          Other amount →
        </a>
      </div>
      <p className="mt-4 font-mono text-xs text-slate" aria-live="polite">
        {error
          ? 'Checkout could not open — please try again.'
          : busy != null
            ? 'OPENING SECURE CHECKOUT…'
            : 'SECURE CHECKOUT BY SQUARE · ONE-TIME GIFT'}
      </p>
    </div>
  )
}

function DonatePage() {
  const [freq, setFreq] = useState<'once' | 'monthly'>('once')
  // null = the "Other" tile is selected and the custom field drives the amount
  const [amount, setAmount] = useState<number | null>(50)
  const [custom, setCustom] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const amounts = freq === 'once' ? DONATE.oneTimeAmounts : DONATE.monthlyAmounts

  // Switching frequency: keep the amount if that tier exists, else pick the middle one
  function switchFreq(next: 'once' | 'monthly') {
    setFreq(next)
    setNotice('')
    const list = next === 'once' ? DONATE.oneTimeAmounts : DONATE.monthlyAmounts
    setAmount((a) => (a != null && list.includes(a) ? a : list[1]))
  }

  const customValue = Number(custom)
  const resolved = amount ?? (custom && customValue > 0 ? customValue : null)

  // Hand off to Square: the function builds the checkout for this exact amount
  // and returns its URL, which we navigate to in this same tab (a popup would
  // be blocked on mobile and loses the giver).
  async function give() {
    if (busy) return
    if (!resolved) {
      setNotice('Enter an amount to continue.')
      return
    }
    setNotice('')
    setBusy(true)
    try {
      const res = await fetch(DONATE.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freq, amount: resolved }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      setNotice(data.error || 'We could not open the secure checkout. Please try again.')
    } catch {
      setNotice('We could not reach the secure checkout. Please check your connection and try again.')
    }
    setBusy(false)
  }

  return (
    <main className="overflow-x-clip">
      {/* HERO + GIVE PANEL — headline owns the left, the give card the right */}
      <section className="relative border-b border-line">
        <DonateBackdrop />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 md:py-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-20 items-center">
          <div data-reveal style={{ transform: 'translateY(26px)' }}>
            <span className="kicker text-blue-bright">Support the broadcast</span>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,6.5vw,5.2rem)] leading-[0.97] tracking-tight">
              Keep the truth
              <br />
              <span className="italic">on the air.</span>
            </h1>
            <p className="mt-8 max-w-md text-bone/65 leading-relaxed">
              Frankly Speaking is viewer-funded. Every dispatch — the studio, the
              crew, the research behind each broadcast — is carried by people who
              believe this word needs to keep going out. Your gift is what puts it
              on air tomorrow.
            </p>
            <p className="mt-8 font-mono text-xs text-slate">
              TOUCH HEAVEN STUDIOS · CANFIELD, OHIO
            </p>
          </div>

          <div
            className="rounded-3xl border border-line bg-ink-soft/70 backdrop-blur p-6 sm:p-8"
            data-reveal
            style={{ transform: 'translateY(26px)' }}
          >
            {/* frequency */}
            <div
              className="relative grid grid-cols-2 gap-1 p-1 rounded-full border border-line"
              role="group"
              aria-label="Giving frequency"
            >
              {(['once', 'monthly'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => switchFreq(f)}
                  aria-pressed={freq === f}
                  className={`rounded-full py-2.5 text-sm font-medium transition-colors duration-300 ${
                    freq === f ? 'bg-blue text-white' : 'text-bone/65 hover:text-bone'
                  }`}
                >
                  {f === 'once' ? 'One-time' : 'Monthly'}
                </button>
              ))}
            </div>

            <p className="mt-6 kicker text-slate">
              {freq === 'once' ? 'Choose an amount' : 'Give every month'}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {amounts.map((a) => (
                <AmountTile
                  key={a}
                  label={`$${a}`}
                  active={amount === a}
                  onClick={() => {
                    setAmount(a)
                    setNotice('')
                  }}
                />
              ))}
              <AmountTile
                label="Other"
                active={amount === null}
                onClick={() => {
                  setAmount(null)
                  setNotice('')
                }}
              />
            </div>

            {amount === null && (
              <div className="mt-4 relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-xl text-bone/50">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="decimal"
                  autoFocus
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value)
                    setNotice('')
                  }}
                  placeholder="Amount"
                  aria-label="Custom amount in US dollars"
                  className="w-full bg-transparent pl-11 pr-6 py-4 rounded-full border border-line text-bone placeholder:text-slate outline-none focus:border-blue-bright transition-colors"
                />
              </div>
            )}

            <button
              type="button"
              onClick={give}
              disabled={busy}
              className="mt-6 w-full bg-blue text-white px-7 py-4 rounded-full font-medium hover:bg-blue-bright transition-[background-color,transform] duration-300 active:scale-95 disabled:opacity-60"
            >
              {busy
                ? 'Opening secure checkout…'
                : resolved
                  ? `Give $${resolved}${freq === 'monthly' ? ' / month' : ''}`
                  : 'Give'}
            </button>

            {notice && (
              <p className="mt-4 text-sm text-bone/70 leading-relaxed" aria-live="polite">
                {notice}
              </p>
            )}

            <p className="mt-5 font-mono text-[11px] leading-relaxed text-slate">
              {DONATE.receiptNote}
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOUR GIFT CARRIES */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div data-reveal style={{ transform: 'translateY(24px)' }}>
          <span className="kicker text-blue-bright">Where it goes</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl tracking-tight leading-[1.02]">
            What your gift carries
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden" data-grid>
          {GIVE_IMPACT.map((it) => (
            <div key={it.n} className="bg-ink p-8 md:p-10">
              <span className="font-mono text-xs text-blue-bright">{it.n}</span>
              <h3 className="mt-5 font-display text-2xl tracking-tight">{it.title}</h3>
              <p className="mt-4 text-bone/65 leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PULL QUOTE over the studio */}
      <section className="relative border-y border-line">
        <div className="absolute inset-0">
          <img
            src="/images/10-newsroom-dawn.png"
            alt=""
            aria-hidden
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/30" />
        </div>
        <div
          className="relative mx-auto max-w-[1400px] px-6 py-24 md:py-32"
          data-reveal
          style={{ transform: 'translateY(24px)' }}
        >
          <blockquote className="max-w-3xl font-display text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[1.06] tracking-tight">
            “I can only be Frank.”
          </blockquote>
          <p className="mt-6 font-mono text-xs text-slate">
            FRANK AMEDIA · TOUCH HEAVEN INTERNATIONAL MINISTRIES
          </p>
        </div>
      </section>

      {/* OTHER WAYS */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-6" data-grid>
          <a
            href="#/sponsor"
            className="group rounded-2xl border border-line p-8 md:p-10 hover:border-blue-bright/60 transition-colors"
          >
            <span className="kicker text-blue-bright">Give at a larger level</span>
            <h3 className="mt-4 font-display text-2xl md:text-3xl tracking-tight">
              Become a Sponsor
            </h3>
            <p className="mt-4 text-bone/65 leading-relaxed">
              Underwrite the broadcast itself. Leave your details and the team will
              reach out personally.
            </p>
            <span className="mt-6 inline-block text-blue-bright group-hover:translate-x-1 transition-transform">
              Talk to the team →
            </span>
          </a>
          <a
            href="https://www.touchheaven.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-line p-8 md:p-10 hover:border-blue-bright/60 transition-colors"
          >
            <span className="kicker text-blue-bright">The wider ministry</span>
            <h3 className="mt-4 font-display text-2xl md:text-3xl tracking-tight">
              Touch Heaven
            </h3>
            <p className="mt-4 text-bone/65 leading-relaxed">
              Frankly Speaking is part of Touch Heaven International Ministries —
              preparing the way for the return of the Lord.
            </p>
            <span className="mt-6 inline-block text-blue-bright group-hover:translate-x-1 transition-transform">
              Visit Touch Heaven ↗
            </span>
          </a>
        </div>
      </section>
    </main>
  )
}

/* Where Square sends the giver back after a completed checkout (#/thanks). */
function ThanksPage() {
  return (
    <main className="relative min-h-[calc(100svh-104px)] grid place-items-center">
      <DonateBackdrop />
      <div
        className="relative z-10 mx-auto max-w-[1400px] px-6 py-24 text-center"
        data-reveal
        style={{ transform: 'translateY(26px)' }}
      >
        <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-blue/15 border border-blue-bright/40">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mt-8 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.99] tracking-tight">
          Thank you.
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-bone/65 leading-relaxed">
          Your gift keeps the broadcast on the air. A receipt is on its way to
          your email — and tomorrow's dispatch is already in the works.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`#/watch/${LATEST_ID}`}
            className="bg-blue text-white px-7 py-4 rounded-full font-medium hover:bg-blue-bright transition-colors"
          >
            Watch the latest broadcast
          </a>
          <a
            href="#"
            className="px-7 py-4 rounded-full border border-line text-bone hover:border-blue-bright hover:text-white transition-colors font-medium"
          >
            Back to home
          </a>
        </div>
        <p className="mt-10 font-mono text-xs text-slate">
          TOUCH HEAVEN STUDIOS · CANFIELD, OHIO
        </p>
      </div>
    </main>
  )
}

function AboutPage() {
  return (
    <main className="min-h-[calc(100svh-104px)] overflow-x-clip">
      {/* split hero: the blue studio scene owns the left half full-bleed and
          darkens toward the right so the text column stays readable */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen">
        {/* scene — dominant, frameless, fading into the ink */}
        <div
          className="relative h-[52vh] md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[64%]"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, black 52%, transparent 97%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 52%, transparent 97%)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 86%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 86%, transparent 100%)',
            }}
          >
            <img
              src="/images/host.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-[30%_top] grayscale"
            />
            <div className="absolute inset-0 bg-[#2135d6] mix-blend-color" />
            <div className="absolute inset-0 bg-[#101c66]/60 mix-blend-multiply" />
          </div>
          {/* Frank — full color, floating over his own blue echo */}
          <motion.img
            src="/images/guests/cut/frank.png"
            alt="Frank Amedia"
            style={{
              maskImage: 'linear-gradient(to bottom, black 0%, black 84%, transparent 99%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 84%, transparent 99%)',
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-[34%] h-[88%] md:h-[82%] w-auto max-w-none object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:-translate-y-1"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: SHOW_EASE, delay: 0.3 }}
          />
        </div>

        {/* text column — right half */}
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-14 md:py-0 md:min-h-[86vh] md:flex md:items-center">
          <div className="md:ml-[56%] md:w-[44%] lg:ml-[58%] lg:w-[40%]">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: SHOW_EASE, delay: 0.1 }}
            >
              <span aria-hidden="true" className="h-px w-12 bg-gradient-to-r from-blue-bright/80 to-transparent" />
              <span className="kicker text-blue-bright">The Host</span>
            </motion.div>

            <h1
              className="mt-4 font-black uppercase tracking-tight leading-[0.94] text-[clamp(2.6rem,5.6vw,5.2rem)] drop-shadow-[0_0_38px_rgba(31,111,229,0.4)]"
              aria-label="Frank Amedia"
            >
              <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]" aria-hidden="true">
                <motion.span
                  className="inline-block text-white"
                  initial={{ y: '112%', rotate: 4 }}
                  animate={{ y: '0%', rotate: 0 }}
                  transition={{ duration: 0.85, ease: SHOW_EASE, delay: 0.25 }}
                >
                  FRANK&nbsp;
                </motion.span>
              </span>
              <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]" aria-hidden="true">
                <motion.span
                  className="inline-block title-shimmer-blue"
                  initial={{ y: '112%', rotate: 4 }}
                  animate={{ y: '0%', rotate: 0 }}
                  transition={{ duration: 0.85, ease: SHOW_EASE, delay: 0.4 }}
                >
                  AMEDIA
                </motion.span>
              </span>
            </h1>

            <motion.div
              aria-hidden="true"
              className="mt-5 h-[2px] w-40 md:w-60 bg-gradient-to-r from-blue-bright/80 to-transparent origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: SHOW_EASE, delay: 0.7 }}
            />

            <motion.div
              className="mt-8 space-y-6 text-bone/75 leading-relaxed text-lg"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: SHOW_EASE, delay: 0.55 }}
            >
            <p>
              Frank Amedia is an apostolic and prophetic voice who has ministered
              around the world for over forty years. From Touch Heaven Studios in
              Canfield, Ohio, he hosts <span className="text-bone">Frankly Speaking</span> —
              a daily leadership broadcast that brings current events into focus
              through the lens of Kingdom strategy.
            </p>
            <p>
              His teaching equips leaders to read the times and move with alignment,
              pairing real-time geopolitical analysis with prophetic insight and a
              plain-spoken, pastoral clarity.
            </p>
            <p>
              Frank ministers alongside his wife, Lorilee Amedia, through Touch
              Heaven Ministries and Deep Calls 2 Deep University.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={`#/watch/${LATEST_ID}`}
                className="inline-flex items-center gap-3 bg-bone text-ink px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
              >
                Watch the latest broadcast
              </a>
              <a
                href="#/be-on-the-show"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-line text-bone/80 hover:border-blue-bright hover:text-bone transition-colors"
              >
                Be On The Show →
              </a>
            </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* Episodes that live on the TCT channel but not in the site playlist
   (linked from the guest showcase). */
const EXTRA_EPISODES: Record<string, string> = {
  TzNazFzbvvk: 'Why Jentezen Franklin Gave $28 Million to Israel | Frankly Speaking Pt 1',
  CHMLd7nE5mE: 'Pastor Frank Amedia with Jentezen Franklin and Yair Pinto | Frankly Speaking Pt 2',
}

function EpisodeViewer({ id }: { id: string }) {
  const idx = VIDEOS.findIndex((v) => v.id === id)
  const known = VIDEOS[idx]
  const v = known ?? { id, title: EXTRA_EPISODES[id] ?? 'Frankly Speaking', duration: 0 }

  const newer = known ? VIDEOS[idx - 1] : undefined
  const older = known ? VIDEOS[idx + 1] : undefined
  const more = VIDEOS.filter((x) => x.id !== id).slice(0, 12)

  return (
    <main className="min-h-[calc(100svh-104px)]">
      <div className="mx-auto max-w-[1180px] px-6 pt-8 pb-24">
        <a
          href="#/episodes"
          className="inline-flex items-center gap-2 kicker text-slate hover:text-bone transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          All episodes
        </a>

        <div className="mt-6 relative aspect-video w-full rounded-xl overflow-hidden border border-line bg-black shadow-[0_30px_90px_-30px_rgba(31,111,229,0.5)]">
          <iframe
            key={v.id}
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
            title={cleanTitle(v.title)}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <span className="kicker text-blue-bright">{categoryOf(v.title)}</span>
            <h1 className="mt-3 font-display text-3xl md:text-4xl leading-tight tracking-tight">
              {cleanTitle(v.title)}
            </h1>
            <p className="mt-3 font-mono text-xs text-slate">
              FRANKLY SPEAKING · FRANK AMEDIA
              {v.date ? ` · ${formatDate(v.date).toUpperCase()}` : ''}
              {v.duration ? ` · ${formatDuration(v.duration)}` : ''}
            </p>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${v.id}&list=${playlist.playlistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-line text-bone/80 hover:border-blue-bright hover:text-bone transition-colors"
          >
            Watch on YouTube ↗
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {newer && (
            <a
              href={`#/watch/${newer.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line text-sm text-bone/80 hover:border-blue-bright hover:text-bone transition-colors"
            >
              ← Newer
            </a>
          )}
          {older && (
            <a
              href={`#/watch/${older.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line text-sm text-bone/80 hover:border-blue-bright hover:text-bone transition-colors"
            >
              Older →
            </a>
          )}
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-2xl tracking-tight mb-2">More episodes</h2>
          <VideoRow videos={more} />
        </div>
      </div>
    </main>
  )
}

/* -------------------------------- LAYOUT --------------------------------- */

/* ------------------------------- PODCAST -------------------------------- */
/* The audio show. Data comes from src/data/podcast.json, written at build time
   by scripts/fetch-podcast.mjs from the Buzzsprout RSS feed (the browser can't
   read RSS directly — CORS). Playback streams straight from the Buzzsprout
   enclosure URL so every listen still counts in Frank's hosting stats.

   The player is hand-built rather than a Buzzsprout iframe: an embed drags its
   own chrome in and breaks the broadcast-editorial look. One <audio> element
   lives at the page root and every play button on the page drives it.

   DIRECTION — the page opens like a broadcast signing on. It reuses the site's
   signature motion grammar from ShowTitle (SHOW_EASE, ghost outline zoom, glow
   bloom, masked character cascade, rules drawing outward, infinite shimmer) but
   sets it in the display serif instead of the black sans, so the podcast reads
   as family to Be On The Show rather than a copy of it. The scrubber is the
   page's identity: a full-bleed "signal rail" that draws itself across the
   viewport on arrival and stays live under your thumb. */

type Episode = (typeof podcast.episodes)[number]

const EPISODES = (podcast.episodes as Episode[]).map((e) => ({
  ...e,
  image: podcastCover(e.num, e.image),
}))
const SHOW = { ...podcast.show, image: PODCAST_COVER }

// 4265 → "1:11:05" (the transport clock — mm:ss, hours only when needed)
function formatClock(s: number) {
  if (!Number.isFinite(s) || s < 0) s = 0
  const t = Math.floor(s)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const ss = String(t % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

// 4265 → "1 hr 11 min" (the human-readable runtime in metadata lines)
function formatRuntime(s: number | null) {
  if (!s) return ''
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  if (h && m) return `${h} hr ${m} min`
  if (h) return `${h} hr`
  return `${m} min`
}

// podcast.json stores dates as "YYYY-MM-DD" → "Aug 28, 2026"
function formatISODate(d: string | null) {
  if (!d) return ''
  const [y, m, day] = d.split('-').map(Number)
  if (!y || !m || m > 12) return ''
  return `${MONTHS[m - 1]} ${Number(day)}, ${y}`
}

const SPEEDS = [1, 1.25, 1.5, 1.75, 2]

/* Decorative "audio is playing" indicator — three bars on a CSS loop. Purely an
   affordance: it is NOT driven by the waveform (the audio is served cross-origin
   from a CDN that blocks the Web Audio analyser), so it never claims real levels. */
function EqBars({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full bg-current ${playing ? 'eq-bar' : ''}`}
          style={{ height: playing ? undefined : '35%', animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  )
}

function PlayIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.14v13.72a.5.5 0 0 0 .77.42l10.4-6.86a.5.5 0 0 0 0-.84L8.77 4.72a.5.5 0 0 0-.77.42Z" />
    </svg>
  )
}

function PauseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 4.5h3.2v15H7zM13.8 4.5H17v15h-3.2z" />
    </svg>
  )
}

/* Skip-back-15 / skip-forward-30 — a circular arrow with the number inside. */
function SkipIcon({ dir, secs }: { dir: 'back' | 'fwd'; secs: number }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform={dir === 'back' ? 'scale(-1,1) translate(-24,0)' : undefined}
      >
        <path d="M12 5.5a7 7 0 1 0 6.6 4.7" />
        <path d="M18.9 4.6v5.4h-5.2" />
      </g>
      <text
        x="12"
        y="16.4"
        textAnchor="middle"
        fill="currentColor"
        style={{ font: '700 7px var(--font-mono)' }}
      >
        {secs}
      </text>
    </svg>
  )
}

/* Shared seek behaviour for both rails (hero signal rail + docked mini rail). */
function useSeekDrag(onSeek: (f: number) => void) {
  const rail = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const fractionAt = (clientX: number) => {
    const el = rail.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }

  return {
    rail,
    dragging,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(true)
        onSeek(fractionAt(e.clientX))
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (dragging) onSeek(fractionAt(e.clientX))
      },
      onPointerUp: (e: React.PointerEvent) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
        setDragging(false)
      },
      onPointerCancel: (e: React.PointerEvent) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
        setDragging(false)
      },
    },
  }
}

/* THE WAVEFORM — the player's scrubber and its signature object.

   The bars are REAL: `peaks` in podcast.json is RMS measured off the published
   MP3 by ffmpeg at build time (see scripts/fetch-podcast.mjs), contrast-stretched
   so a loudness-normalised speech track doesn't draw as a flat block. Episodes
   published before the peaks pipeline existed simply have `peaks: null` and get
   a plain bar instead — never a decorative fake.

   Two identical bar rows are stacked and the played one is revealed by a width
   clip, so scrubbing updates a single style rather than restyling 160 nodes
   every timeupdate. */
function Waveform({
  peaks,
  progress,
  duration,
  time,
  playing,
  onSeek,
}: {
  peaks: number[] | null
  progress: number
  duration: number
  time: number
  playing: boolean
  onSeek: (fraction: number) => void
}) {
  const reduced = useReducedMotion()
  const { rail, dragging, handlers } = useSeekDrag(onSeek)
  const pct = `${Math.min(100, Math.max(0, progress * 100))}%`

  /* Downsample so the bars stay legible at any width: at the full 160 a 390px
     phone gives each bar 0.14px and the 2px gaps swallow the wave entirely.

     Driven off viewport width rather than the element's own box: the element is
     mounted lazily (the player only exists once something plays), so measuring
     it races with layout — an earlier ResizeObserver version latched onto a
     stale 390px and drew 78 fat 14px blocks on a 1290px rail. Breakpoints are
     boring here, and boring is correct. */
  const barCountFor = (w: number) => (w < 640 ? 64 : w < 1024 ? 104 : 160)
  const [slots, setSlots] = useState(() =>
    barCountFor(typeof window === 'undefined' ? 1280 : window.innerWidth)
  )
  useEffect(() => {
    const onResize = () => setSlots(barCountFor(window.innerWidth))
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const shown = useMemo(() => {
    if (!peaks || !peaks.length) return []
    if (slots >= peaks.length) return peaks
    const step = peaks.length / slots
    return Array.from({ length: slots }, (_, i) => {
      const a = Math.floor(i * step)
      const b = Math.max(a + 1, Math.floor((i + 1) * step))
      const seg = peaks.slice(a, b)
      return Math.round(seg.reduce((t, v) => t + v, 0) / seg.length)
    })
  }, [peaks, slots])

  const bars = (lit: boolean) => (
    <div className="flex h-full w-full items-center gap-[2px]" aria-hidden>
      {shown.map((v, i) => (
        <span
          key={i}
          className={`flex-1 rounded-[1px] ${lit ? 'bg-blue-bright' : 'bg-silver/20'}`}
          style={{ height: `${Math.max(6, v)}%` }}
        />
      ))}
    </div>
  )

  return (
    <div className="relative select-none">
      <div className="mx-auto max-w-[1400px] px-6 flex items-end justify-between font-mono text-[0.7rem] tracking-[0.14em] uppercase">
        <span className={`transition-colors duration-300 ${playing ? 'text-blue-bright' : 'text-slate'}`}>
          {formatClock(time)}
        </span>
        <span className="text-slate">{duration ? formatClock(duration) : '--:--'}</span>
      </div>

      <motion.div
        ref={rail}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        data-motion-safe
        {...handlers}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.02))
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.02))
        }}
        className="group relative mt-2 w-full cursor-pointer touch-none px-6 py-3"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: SHOW_EASE }}
      >
        {shown.length ? (
          <div className="relative h-14 w-full">
            {bars(false)}
            {/* Played portion: an identical FULL-WIDTH row revealed with
                clip-path. Clipping beats a width-based mask here because the lit
                bars stay on the same grid as the dim ones without the inner row
                needing to know the rail's pixel width (which would mean reading
                a ref during render). */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - Math.min(100, Math.max(0, progress * 100))}% 0 0)` }}
            >
              {bars(true)}
            </div>
          </div>
        ) : (
          /* no peaks for this episode — an honest plain bar, not a fake wave */
          <div className="relative h-2 w-full rounded-full bg-line overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-deep via-blue to-blue-bright"
              style={{ width: pct }}
            />
          </div>
        )}

        {/* playhead */}
        <span
          className={`pointer-events-none absolute top-2 bottom-2 w-[2px] -translate-x-1/2 bg-bone transition-[transform,box-shadow] duration-300 ${
            dragging ? 'scale-y-105' : ''
          } ${playing ? 'rail-head-live' : 'shadow-[0_0_10px_rgba(238,242,248,0.5)]'}`}
          style={{ left: `calc(${pct} + 1.5rem - ${progress * 3}rem)` }}
          aria-hidden
        />
      </motion.div>
    </div>
  )
}

/* Compact rail for the docked mini-player. */
function MiniRail({ progress, onSeek }: { progress: number; onSeek: (f: number) => void }) {
  const { rail, dragging, handlers } = useSeekDrag(onSeek)
  const pct = `${Math.min(100, Math.max(0, progress * 100))}%`
  return (
    <div
      ref={rail}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      {...handlers}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.02))
        if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.02))
      }}
      className="group relative w-full cursor-pointer touch-none select-none py-2"
    >
      <div className="relative h-1 w-full rounded-full bg-line overflow-hidden">
        <div className="rail-ticks absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-deep via-blue to-blue-bright"
          style={{ width: pct }}
        />
      </div>
      <span
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-[2px] rounded-full bg-blue-bright shadow-[0_0_12px_rgba(59,139,255,0.9)] transition-transform duration-200 ${
          dragging ? 'scale-y-125' : 'group-hover:scale-y-125'
        }`}
        style={{ left: pct }}
        aria-hidden
      />
    </div>
  )
}

/* Page title — the arrival moment.
   Set as the show's own broadcast lockup rather than the site's display serif:
   FRANKLY in white over SPEAKING in blue, heavy uppercase on very tight
   leading, matching the mark printed on the episode artwork beside it. Keeping
   the two identical means the hero and the cover read as one object.

   "PODCAST" is deliberately NOT a third heavy line — that would alter a client
   brand mark. It sits below the lockup as a spaced mono descriptor.

   The masked character cascade and the blue shimmer carry over from the earlier
   version (and from ShowTitle on Be On The Show). The ghost outline behind the
   title was removed on request — it was the main source of background noise. */
function PodcastTitle() {
  const reduced = useReducedMotion()

  const TONE = {
    bone: 'text-bone',
    blue: 'title-shimmer-blue',
    breathe: 'podcast-breathe',
  } as const

  const cascade = (word: string, tone: keyof typeof TONE, offset: number) => (
    <span className="block whitespace-nowrap">
      {word.split('').map((c, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
          <motion.span
            data-motion-unmask
            className={`inline-block ${TONE[tone]}`}
            initial={reduced ? false : { y: '115%', rotate: 4 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 0.9, ease: SHOW_EASE, delay: 0.35 + (offset + i) * 0.035 }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </span>
  )

  return (
    <div className="relative">
      <h1
        aria-label="Frankly Speaking Podcast"
        className="relative font-body font-black uppercase leading-[0.84] tracking-[-0.02em] text-[clamp(2.7rem,7.4vw,5.8rem)]"
      >
        {cascade('Frankly', 'bone', 0)}
        {cascade('Speaking', 'blue', 7)}
        {/* PODCAST is the third line of the same lockup, at the same size — it is
            separated by value, not by scale, so the brand mark still reads as
            FRANKLY / SPEAKING with a descriptor rather than a three-word name. */}
        {cascade('Podcast', 'breathe', 15)}
      </h1>
    </div>
  )
}

/* Platform marks, drawn from primitives rather than pasted path data — a copied
   path is how the wrong logo (Pinterest) shipped here once already. Built from
   circles and arcs so the shape is readable in the source and verifiable on screen. */
function PlatformIcon({ id, className = 'w-6 h-6' }: { id: 'apple' | 'spotify'; className?: string }) {
  if (id === 'apple') {
    // Apple Podcasts: a microphone (round head + tapered stand) inside two
    // broadcast arcs that open downward.
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4.4 15.4a8.6 8.6 0 1 1 15.2 0" />
          <path d="M8.1 14.2a4.9 4.9 0 1 1 7.8 0" />
        </g>
        <circle cx="12" cy="11.6" r="2.45" fill="currentColor" />
        <path
          d="M9.95 17.2c0-.95.92-1.5 2.05-1.5s2.05.55 2.05 1.5l-.57 3.4c-.13.83-.7 1.4-1.48 1.4s-1.35-.57-1.48-1.4z"
          fill="currentColor"
        />
      </svg>
    )
  }
  // Spotify: filled disc with three signal arcs knocked out.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <g fill="none" stroke="var(--color-ink)" strokeWidth="1.7" strokeLinecap="round">
        <path d="M7.1 9.2c3.2-.85 6.6-.5 9.5 1" />
        <path d="M7.9 12.5c2.6-.65 5.4-.35 7.8.9" />
        <path d="M8.7 15.6c2-.5 4.1-.28 5.9.72" />
      </g>
    </svg>
  )
}

type Platform = (typeof PODCAST.platforms)[number]

/* ------------------------- HERO SUBSCRIBE --------------------------------
   Wash chips — chosen 2026-08-29, then scaled up on request so they carry real
   weight in the hero instead of reading as a footnote. They are a compact
   relative of the split panels in the About band: same idea (the platform's
   colour washes in, the surface stays broadcast blue), different proportion.

   Still deliberately not filled at rest. The hero's primary action is the 64px
   play button; these are the second one, so they gain presence through SIZE and
   type weight rather than through a solid fill that would rival it. */
function HeroSubscribe({ className = '' }: { className?: string }) {
  const live = PODCAST.platforms.filter((p) => p.href)

  return (
    <div className={className} data-motion-safe>
      {/* Matches the enlarged LATEST EPISODE label on the other side of the hero:
          same bold lockup sans, same blue, so the two read as one system rather
          than as two unrelated captions. The rule carries it across the column
          so it lands as a section head, not a stray line of small type. */}
      <div className="flex items-center gap-4 max-w-xl">
        <span className="font-body font-bold uppercase text-blue-bright whitespace-nowrap leading-none tracking-[0.2em] text-[clamp(0.95rem,1.25vw,1.25rem)]">
          Listen now on
        </span>
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        {live.map((p, i) => (
          <motion.a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Listen to Frankly Speaking on ${p.label}`}
            style={{ ['--hue' as string]: p.hue }}
            className="hero-sub-chip group relative flex items-center gap-4 overflow-hidden rounded-xl border border-line px-6 py-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SHOW_EASE, delay: 1.15 + i * 0.09 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <span aria-hidden className="hero-sub-chip-wash" />
            <PlatformIcon id={p.id} className="relative shrink-0 w-9 h-9 hero-sub-chip-mark" />
            <span className="relative min-w-0 font-display text-lg md:text-xl tracking-tight leading-tight whitespace-nowrap">
              {p.label}
            </span>
            <span
              aria-hidden
              className="relative ml-auto shrink-0 text-slate transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-bone"
            >
              →
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}

/* ------------------------- LISTEN ON (About band) -------------------------
   Split panels — chosen 2026-08-29 over console keys and magnetic tiles.
   The mark is blown up as a watermark bleeding off the corner, and the
   platform's colour washes up from the floor of the panel on hover. Colour only
   ever arrives as light, never as a repainted surface, so nothing fights the
   broadcast blue. Both panels are forced to equal height (h-full down the
   chain) — "Apple Podcasts" wraps to two lines and "Spotify" doesn't, which
   otherwise left one panel visibly shorter than the other. */
function ListenPanel({ p }: { p: Platform }) {
  return (
    <a
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Listen to Frankly Speaking on ${p.label}`}
      className="listen-panel group relative flex h-full min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl border border-line bg-ink-soft/60 px-8 py-9"
      style={{ ['--hue' as string]: p.hue }}
    >
      {/* colour rises from the floor of the panel on hover */}
      <span aria-hidden className="listen-panel-wash" />
      {/* oversized mark bleeding off the corner */}
      <span aria-hidden className="listen-panel-mark">
        <PlatformIcon id={p.id} className="w-44 h-44" />
      </span>

      <span className="relative kicker text-slate transition-colors duration-300 group-hover:text-bone/80">
        {p.cta}
      </span>
      {/* reserved height keeps the two panels' baselines aligned even though
          one title wraps to two lines and the other doesn't */}
      <span className="relative block">
        <span className="flex min-h-[2.2em] items-end font-display text-2xl md:text-3xl tracking-tight leading-tight">
          {p.label}
        </span>
        <span className="mt-2 inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate transition-colors duration-300 group-hover:text-bone">
          Open
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
    </a>
  )
}

function ListenOn({ className = '' }: { className?: string }) {
  const live = PODCAST.platforms.filter((p) => p.href)
  return (
    <div className={`grid sm:grid-cols-2 gap-4 items-stretch ${className}`}>
      {live.map((p, i) => (
        <motion.div
          key={p.id}
          data-motion-safe
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: SHOW_EASE, delay: i * 0.08 }}
        >
          <ListenPanel p={p} />
        </motion.div>
      ))}
    </div>
  )
}

/* The heading Alvar asked for: one clear "Listen now on" line that owns the
   call to action, with the platforms reading as its options underneath. */
function ListenNowHeading({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} data-motion-safe>
      <h3 className="font-display text-xl md:text-2xl tracking-tight whitespace-nowrap">
        Listen now on
      </h3>
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
    </div>
  )
}

/* Drag / wheel / keyboard stepping through the episode carousel.

   The wheel is handled with a NATIVE non-passive listener rather than React's
   onWheel so it can call preventDefault() — React attaches wheel passively and
   a passive handler cannot cancel the page scroll. The host element also carries
   `data-lenis-prevent-wheel`, without which Lenis (which owns wheel input for
   the whole site) would keep scrolling the page underneath us. Both are needed:
   the attribute stops Lenis, preventDefault stops native scrolling.

   Because the listener lives ON the carousel, the capture is automatically
   scoped to hover — move the cursor off and the wheel goes back to the page. */
function useEpisodeStepper(count: number, pxPerStep: number) {
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0) // live pixels, 0 unless dragging
  const host = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startIndex = useRef(0)

  const step = (delta: number) =>
    setIndex((i) => Math.max(0, Math.min(count - 1, i + delta)))
  const jump = (i: number) => setIndex(Math.max(0, Math.min(count - 1, i)))

  useEffect(() => {
    const el = host.current
    if (!el) return
    let acc = 0
    let idle: number | undefined

    const onWheel = (e: WheelEvent) => {
      // The cursor is over the carousel, so the wheel belongs to it, not the page.
      e.preventDefault()
      // Trackpads emit many small deltas — accumulate and step once per threshold.
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(acc) >= pxPerStep) {
        // Resolve the direction NOW. A state updater runs later, so if it read
        // `acc` itself it would see the reset value below and always step back.
        const dir = acc > 0 ? 1 : -1
        acc = 0
        setIndex((i) => Math.max(0, Math.min(count - 1, i + dir)))
      }
      window.clearTimeout(idle)
      idle = window.setTimeout(() => (acc = 0), 180)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(idle)
    }
  }, [count, pxPerStep])

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      // Ignore secondary buttons so right-click doesn't start a drag.
      if (e.button !== 0) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragging.current = true
      startX.current = e.clientX
      startIndex.current = index
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (dragging.current) setDrag(e.clientX - startX.current)
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!dragging.current) return
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
      dragging.current = false
      jump(startIndex.current - Math.round((e.clientX - startX.current) / pxPerStep))
      setDrag(0)
    },
    onPointerCancel: (e: React.PointerEvent) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
      dragging.current = false
      setDrag(0)
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
      if (e.key === 'Home') { e.preventDefault(); jump(0) }
      if (e.key === 'End') { e.preventDefault(); jump(count - 1) }
    },
  }

  return { index, jump, drag, host, bind }
}

/* THE ARCHIVE — a cover-flow rack of every episode.
   Browsing here is separate from playback: spin to whichever cover you want,
   read it, then commit with the play button. The episode currently loaded in
   the player keeps a marker so you never lose it while browsing. */
function EpisodeCoverFlow({
  episodes,
  currentId,
  playing,
  started,
  onPlay,
}: {
  episodes: Episode[]
  currentId: string | null
  playing: boolean
  /* true once this episode actually has elapsed time — distinguishes
     "Resume" from a fresh, never-played episode. */
  started: boolean
  onPlay: (ep: Episode) => void
}) {
  const { index, jump, drag, host, bind } = useEpisodeStepper(episodes.length, 90)
  // Store which episode's notes are open rather than a bare boolean: moving to
  // another cover then closes them implicitly, with no effect + setState dance.
  const [openNotesId, setOpenNotesId] = useState<string | null>(null)
  const reduced = useReducedMotion()

  const live = index - drag / 90 // fractional index while a drag is in flight
  const browsed = episodes[index]
  const isLoaded = browsed.id === currentId
  const notesOpen = openNotesId === browsed.id

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

  return (
    <div>
      <div
        ref={host}
        role="listbox"
        aria-label="Browse episodes"
        aria-activedescendant={`cf-${browsed.id}`}
        tabIndex={0}
        // `touch-pan-y` (not touch-none): a horizontal swipe drives the rack,
        // a vertical swipe still scrolls the page — no scroll trap on phones.
        data-lenis-prevent-wheel
        {...bind}
        className="relative h-[320px] md:h-[430px] touch-pan-y select-none cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-blue-bright/60 rounded-2xl"
        style={{ perspective: '1400px', perspectiveOrigin: '50% 42%' }}
      >
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {episodes.map((ep, i) => {
            const d = i - live
            const ad = Math.abs(d)
            if (ad > 4.5) return null
            const sign = d === 0 ? 0 : d > 0 ? 1 : -1
            const x = sign * Math.min(ad, 4) * 118 + d * 26
            const z = -Math.min(ad, 4) * 130
            const rotY = -sign * Math.min(ad, 1) * 52
            const isFront = ad < 0.5
            const isPlayingCard = ep.id === currentId && playing
            return (
              <button
                key={ep.id}
                id={`cf-${ep.id}`}
                type="button"
                role="option"
                aria-selected={isFront}
                aria-label={isFront ? `Play ${ep.title}` : `Bring ${ep.title} to the front`}
                onClick={() => (isFront ? onPlay(ep) : jump(i))}
                className="absolute left-1/2 top-1/2 w-[200px] md:w-[250px] will-change-transform"
                style={{
                  transform: `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg)`,
                  transition: drag || reduced ? 'none' : `transform 0.65s ${EASE}, opacity 0.65s ${EASE}`,
                  zIndex: 100 - Math.round(ad * 10),
                  opacity: ad > 3.6 ? 0 : 1,
                  transformStyle: 'preserve-3d',
                }}
              >
                <span
                  className="block relative aspect-square w-full overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-500"
                  style={{
                    borderColor: isFront ? 'rgba(59,139,255,0.55)' : 'var(--color-line)',
                    boxShadow: isFront ? '0 26px 60px -18px rgba(31,111,229,0.6)' : '0 18px 40px -22px #000',
                  }}
                >
                  <img src={ep.image} alt="" className="w-full h-full object-cover" draggable={false} loading="lazy" />
                  {/* everything that isn't the front card recedes into the dark */}
                  <span
                    className="absolute inset-0 bg-ink transition-opacity duration-500"
                    style={{ opacity: isFront ? 0 : Math.min(0.66, 0.2 + ad * 0.2) }}
                  />
                  {ep.num != null && (
                    <span className="absolute top-2.5 left-2.5 font-mono text-[0.62rem] tracking-[0.15em] rounded-full bg-ink/85 backdrop-blur px-2.5 py-1 text-blue-bright">
                      EP {String(ep.num).padStart(2, '0')}
                    </span>
                  )}
                  {/* the episode sitting in the player keeps its marker while you browse */}
                  {ep.id === currentId && (
                    <span className="absolute top-2.5 right-2.5 grid place-items-center w-6 h-6 rounded-full bg-blue text-white">
                      {isPlayingCard ? <EqBars playing /> : <PlayIcon className="w-3 h-3 translate-x-[1px]" />}
                    </span>
                  )}
                  {/* play affordance on the front card */}
                  {isFront && (
                    <span className="absolute inset-0 grid place-items-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-ink/45">
                      <span className="grid place-items-center w-14 h-14 rounded-full bg-blue text-white">
                        {isPlayingCard ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 translate-x-[1px]" />}
                      </span>
                    </span>
                  )}
                </span>
                {/* reflection — a short mirrored strip of the card's bottom edge */}
                <span
                  aria-hidden
                  className="block relative w-full h-14 md:h-20 mt-1 overflow-hidden rounded-b-xl opacity-25"
                  style={{
                    maskImage: 'linear-gradient(to bottom, #000 0%, transparent 90%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 90%)',
                  }}
                >
                  <img
                    src={ep.image}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    className="absolute top-0 left-0 w-full aspect-square object-cover"
                    style={{ transform: 'scaleY(-1)' }}
                  />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ------------------------------ readout ------------------------------ */}
      <div className="mt-4 text-center px-2">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-slate [&>span]:whitespace-nowrap">
          {browsed.num != null && <span className="text-blue-bright">EP {String(browsed.num).padStart(2, '0')}</span>}
          {browsed.date && (
            <>
              <span className="opacity-40">/</span>
              <span>{formatISODate(browsed.date)}</span>
            </>
          )}
          {browsed.duration && (
            <>
              <span className="opacity-40">/</span>
              <span>{formatRuntime(browsed.duration)}</span>
            </>
          )}
        </div>

        <h3 className="mt-3 font-display text-2xl md:text-4xl tracking-tight leading-[1.08]">
          {browsed.title}
        </h3>

        {browsed.summary && (
          <p className="mt-4 mx-auto max-w-2xl text-sm text-bone/55 leading-relaxed">{browsed.summary}</p>
        )}

        <AnimatePresence initial={false}>
          {notesOpen && browsed.notes.length > 1 && (
            <motion.div
              key="notes"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: SHOW_EASE }}
              className="overflow-hidden"
            >
              <div className="mt-5 mx-auto max-w-2xl space-y-3 text-left text-sm text-bone/65 leading-relaxed border-l border-blue/40 pl-5">
                {browsed.notes.slice(1).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <button
            type="button"
            onClick={() => onPlay(browsed)}
            className="inline-flex items-center gap-2.5 bg-blue text-white px-7 py-3.5 rounded-full font-medium hover:bg-blue-bright transition-[background-color,transform] duration-300 hover:scale-[1.04] active:scale-95"
          >
            {isLoaded && playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 translate-x-[1px]" />}
            {isLoaded && playing ? 'Pause' : isLoaded && started ? 'Resume' : 'Play this episode'}
          </button>

          {browsed.notes.length > 1 && (
            <button
              type="button"
              onClick={() => setOpenNotesId(notesOpen ? null : browsed.id)}
              aria-expanded={notesOpen}
              className="inline-flex items-center gap-1.5 text-sm text-bone/60 hover:text-blue-bright transition-colors"
            >
              {notesOpen ? 'Hide show notes' : 'Show notes'}
              <span aria-hidden className={`text-[0.7em] transition-transform duration-300 ${notesOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
          )}
        </div>

        {episodes.length > 1 && (
          <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate/70">
            Scroll over the rack · drag · ← → to browse
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------------------------- HERO ARTWORK ------------------------------
   Two treatments, both chosen 2026-08-29:

   TILT  — the cover rotates toward the pointer in real perspective. Depth comes
           from layers at different translateZ (glow behind the plane, art, a
           pointer-tracked sheen in front), not from extra content. Driven by CSS
           transitions rather than a JS ticker, with an overshooting curve on the
           way back standing in for an elastic settle.
   ON AIR — a PLAYBACK state, so it is invisible until audio actually runs:
           tally light, scanlines and a signal pass over the artwork, and the
           ghost PODCAST outline breathing. Clears the moment playback stops. */
function HeroArtwork({ ep, playing }: { ep: Episode; playing: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const plane = useRef<HTMLDivElement>(null)
  const airOn = playing

  useEffect(() => {
    const el = host.current
    const pl = plane.current
    if (!el || !pl) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Driven by CSS transitions, not a GSAP/rAF tween: transitions run on the
    // compositor and keep working when requestAnimationFrame is throttled
    // (background tab, low-power mode, a headless preview). The return uses a
    // slightly overshooting curve to stand in for an elastic settle.
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width // 0..1
      const py = (e.clientY - r.top) / r.height
      pl.style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
      pl.style.transform = `rotateY(${(px - 0.5) * 18}deg) rotateX(${-(py - 0.5) * 14}deg)`
      // the sheen tracks the pointer so the highlight reads as a real reflection
      el.style.setProperty('--sx', `${px * 100}%`)
      el.style.setProperty('--sy', `${py * 100}%`)
    }
    const leave = () => {
      pl.style.transition = 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)'
      pl.style.transform = 'rotateY(0deg) rotateX(0deg)'
      el.style.setProperty('--sx', '50%')
      el.style.setProperty('--sy', '50%')
    }

    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
      pl.style.transition = ''
      pl.style.transform = ''
    }
  }, [])

  return (
    <div
      ref={host}
      className="hero-art relative w-full max-w-[520px] mx-auto lg:mx-0"
      style={{ perspective: '900px' }}
    >
      {/* tally — only while audio is actually running */}
      {airOn && (
        <div className="absolute -top-3 left-0 z-20 inline-flex items-center gap-2.5 rounded-full bg-ink/85 backdrop-blur border border-blue-bright/40 px-4 py-1.5">
          <span className="live-dot block w-2 h-2 rounded-full bg-blue-bright" />
          <span className="kicker text-blue-bright">On air</span>
        </div>
      )}

      <div
        ref={plane}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* glow sits behind the plane so it lags the tilt and reads as depth */}
        <div
          className={`absolute -inset-8 rounded-[3rem] bg-blue/25 blur-3xl pointer-events-none transition-opacity duration-700 ${
            playing ? 'art-glow-live' : 'opacity-70'
          }`}
          style={{ transform: 'translateZ(-70px)' }}
          aria-hidden
        />

        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-ink-soft">
          <img
            src={ep.image}
            alt={`${ep.title} cover art`}
            loading="eager"
            className="w-full h-full object-cover"
          />

          {/* one specular sweep on arrival — every variant keeps this */}
          <span className="art-sweep" aria-hidden />

          {/* broadcast signal pass, playback-only */}
          {airOn && (
            <>
              <span className="hero-scanlines" aria-hidden />
              <span className="hero-signal-pass" aria-hidden />
            </>
          )}

          {/* pointer-tracked sheen, tilt-only */}
          <span className="hero-sheen" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function PodcastPage() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const featured = EPISODES[0]

  const [currentId, setCurrentId] = useState<string | null>(featured?.id ?? null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(featured?.duration ?? 0)
  const [speed, setSpeed] = useState(1)
  const [docked, setDocked] = useState(false)
  // Mobile-only "Read more" fold on the About band's description.
  const [aboutOpen, setAboutOpen] = useState(false)
  const current = EPISODES.find((e) => e.id === currentId) ?? featured

  // Cover art drifts against the scroll — depth without stealing attention.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])

  const load = (ep: Episode, autoplay = true) => {
    const el = audioRef.current
    if (!el) return
    if (ep.id !== currentId) {
      setCurrentId(ep.id)
      setTime(0)
      setDuration(ep.duration ?? 0)
      el.src = ep.audio
      el.load()
    }
    if (autoplay) {
      el.playbackRate = speed
      void el.play().catch(() => setPlaying(false))
    }
  }

  const toggle = (ep: Episode) => {
    const el = audioRef.current
    if (!el) return
    if (ep.id !== currentId) return load(ep)
    if (el.paused) {
      el.playbackRate = speed
      void el.play().catch(() => setPlaying(false))
    } else {
      el.pause()
    }
  }

  const seekTo = (fraction: number) => {
    const el = audioRef.current
    const d = el?.duration || duration
    if (!el || !d) return
    el.currentTime = fraction * d
    setTime(fraction * d)
  }

  const nudge = (delta: number) => {
    const el = audioRef.current
    if (!el) return
    const d = el.duration || duration || 0
    el.currentTime = Math.min(d, Math.max(0, el.currentTime + delta))
    setTime(el.currentTime)
  }

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  /* The player only exists once something is playing, so this drives both the
     conditional render and the observer below. */
  const playerOpen = playing || time > 0

  // Dock the mini-player once the archive transport leaves the viewport.
  // NOTE the playerOpen dependency: the transport is mounted lazily, so an
  // effect with [] deps would run while the ref is still null, attach nothing,
  // and the mini-player would never appear.
  const transportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = transportRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting), {
      rootMargin: '-80px 0px 0px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [playerOpen])

  const progress = duration ? time / duration : 0

  /* Clicking the hero cover doesn't just start audio — it takes you to the
     episode in THE player. Because that player is mounted lazily (it only
     exists once something is playing), the scroll can't happen in the click
     handler; we flag the intent and run it from an effect once the transport
     is actually in the DOM. */
  const wantsPlayer = useRef(false)
  const openInPlayer = (ep: Episode) => {
    wantsPlayer.current = true
    // If this episode is already the loaded one and running, don't pause it —
    // the intent here is "take me to it", not "toggle".
    if (!(ep.id === currentId && playing)) toggle(ep)
    else revealPlayer()
  }
  const revealPlayer = () => {
    const el = transportRef.current
    if (el) {
      wantsPlayer.current = false
      smoothScrollTo(el)
    }
  }
  useEffect(() => {
    if (playerOpen && wantsPlayer.current) revealPlayer()
  }, [playerOpen])

  return (
    <main className="min-h-[calc(100svh-104px)]">
      {/* One element for the whole page; every play button drives this. */}
      <audio
        ref={audioRef}
        src={featured?.audio}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration
          if (Number.isFinite(d) && d > 0) setDuration(d)
        }}
      />

      {EPISODES.length === 0 ? (
        <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-24">
          <PodcastTitle />
          <div className="mt-16 rounded-2xl border border-line bg-ink-soft px-8 py-16 text-center">
            <p className="font-display text-2xl">The first episode is on its way.</p>
            <p className="mt-3 text-bone/60">Subscribe now and it lands the day it drops.</p>
            <ListenNowHeading className="mt-10 max-w-lg mx-auto" />
            <ListenOn className="mt-5 max-w-lg mx-auto" />
          </div>
        </div>
      ) : (
        <>
          {/* ============================ HERO PLATE ============================ */}
          <section ref={heroRef} className="relative overflow-hidden border-b border-line">
            {/* blue bloom behind the title block */}
            <motion.div
              aria-hidden
              className="absolute -top-40 -left-32 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, rgba(31,111,229,0.22), transparent 62%)' }}
              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.7, ease: 'easeOut', delay: 0.4 }}
            />

            <div className="relative mx-auto max-w-[1400px] px-6 pt-16 pb-10">
              {/* asymmetric: type owns 7 columns, the art overflows the other 5 */}
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                <div className="lg:col-span-7">
                  <PodcastTitle />

                  <motion.p
                    data-motion-safe
                    className="mt-7 max-w-lg text-bone/65 leading-relaxed"
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: SHOW_EASE, delay: 0.95 }}
                  >
                    The broadcast, cut down to the moments that still hold — frontline
                    dispatches, testimony, and prophecy read against the morning&rsquo;s
                    headlines.
                  </motion.p>

                  <HeroSubscribe className="mt-12" />
                </div>

                {/* cover art — oversized, offset, drifting on scroll */}
                <motion.div
                  data-motion-safe
                  className="lg:col-span-5 2xl:-mr-16"
                  style={reduced ? undefined : { y: artY }}
                  initial={reduced ? false : { opacity: 0, scale: 0.92, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.3, ease: SHOW_EASE, delay: 0.5 }}
                >
                  {/* the label runs vertically up the left edge of the cover,
                      so the artwork keeps the full width of its column */}
                  <div className="flex items-stretch gap-4 max-w-[560px] mx-auto lg:mx-0">
                    {/* Scaled up to carry real weight against a ~500px cover —
                        at 0.68rem it read as a stray tick mark. Set in the heavy
                        lockup sans rather than mono so it belongs to the title
                        beside it, with the date kept small underneath so the
                        hierarchy still reads label-then-detail. */}
                    <div className="hidden sm:flex shrink-0 flex-col items-center justify-between py-1">
                      <span
                        className="font-body font-bold uppercase text-blue-bright whitespace-nowrap leading-none tracking-[0.22em] text-[clamp(1rem,1.5vw,1.4rem)]"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        Latest episode
                      </span>
                      <span aria-hidden className="my-4 w-px flex-1 bg-gradient-to-t from-transparent via-line to-transparent" />
                      {featured.date && (
                        <span
                          className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate whitespace-nowrap"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {formatISODate(featured.date)}
                        </span>
                      )}
                    </div>

                    {/* the card IS the play control now that the transport has
                        moved down to the archive — clicking it starts the episode */}
                    <button
                      type="button"
                      onClick={() => openInPlayer(current)}
                      aria-label={`Play ${current.title} in the player`}
                      className="block min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <HeroArtwork ep={current} playing={playing} />
                    </button>
                  </div>

                  {/* phones get it back as a normal horizontal line */}
                  <div className="sm:hidden flex items-center gap-3 mt-4">
                    <span className="kicker text-blue-bright">Latest episode</span>
                    <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
                    {featured.date && (
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-slate whitespace-nowrap">
                        {formatISODate(featured.date)}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

            </div>
          </section>

          {/* ========================== THE ARCHIVE ========================== */}
          <section className="relative border-b border-line pt-20 pb-8">
            <div className="mx-auto max-w-[1400px] px-6">
              <div className="flex items-end justify-between gap-6 mb-8" data-reveal style={{ transform: 'translateY(24px)' }}>
                <div>
                  <span className="kicker text-blue-bright">
                    {EPISODES.length} {EPISODES.length === 1 ? 'episode' : 'episodes'}
                  </span>
                  <h2 className="mt-2 font-display text-3xl md:text-5xl tracking-tight">The archive</h2>
                </div>
                <p className="hidden sm:block max-w-xs text-right text-sm text-bone/50 leading-relaxed">
                  New episodes appear here as they&rsquo;re released.
                </p>
              </div>

              <EpisodeCoverFlow
                episodes={EPISODES}
                currentId={current.id}
                playing={playing}
                started={time > 0}
                onPlay={toggle}
              />
            </div>

            {/* ---------------------------- THE PLAYER ----------------------------
                Deliberately absent until you actually start something. The hero
                is now just the show and its latest cover; the transport belongs
                to whatever you picked out of the rack. */}
            <AnimatePresence initial={false}>
              {playerOpen && (
                <motion.div
                  key="player"
                  data-motion-safe
                  /* Fade + slide only, deliberately NOT an animated height.
                     A height:auto tween inside overflow-hidden clips the
                     transport if the animation ever stalls (throttled rAF), and
                     an unreachable play button is a real failure, not a cosmetic
                     one. Letting the section grow costs a layout shift below the
                     fold and nothing else. */
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.55, ease: SHOW_EASE }}
                >
                  <div ref={transportRef} className="mx-auto max-w-[1400px] px-6 pt-12">
                    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-slate [&>span]:whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 text-blue-bright">
                            {playing && <EqBars playing />}
                            Now playing
                          </span>
                          {current.num != null && (
                            <>
                              <span className="opacity-40">/</span>
                              <span>EP {String(current.num).padStart(2, '0')}</span>
                            </>
                          )}
                        </div>
                        {/* Set as a console readout rather than the display
                            serif — inside a transport it was competing with the
                            page's own headings. */}
                        <h3 className="mt-2 font-body font-semibold text-xl md:text-3xl tracking-[-0.01em] leading-tight text-bone">
                          {current.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-5">
                        <motion.button
                          type="button"
                          onClick={() => toggle(current)}
                          aria-label={playing ? 'Pause episode' : 'Play episode'}
                          className="shrink-0 grid place-items-center w-16 h-16 rounded-full bg-blue text-white hover:bg-blue-bright transition-colors"
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.94 }}
                        >
                          {playing ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 translate-x-[2px]" />}
                        </motion.button>
                        <button
                          type="button"
                          onClick={() => nudge(-10)}
                          aria-label="Back 10 seconds"
                          className="shrink-0 text-bone/55 hover:text-bone transition-colors"
                        >
                          <SkipIcon dir="back" secs={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudge(10)}
                          aria-label="Forward 10 seconds"
                          className="shrink-0 text-bone/55 hover:text-bone transition-colors"
                        >
                          <SkipIcon dir="fwd" secs={10} />
                        </button>
                        <button
                          type="button"
                          onClick={cycleSpeed}
                          aria-label={`Playback speed ${speed}×`}
                          className="shrink-0 font-mono text-xs rounded-full border border-line px-3 py-1.5 text-bone/70 hover:border-blue-bright hover:text-white transition-colors"
                        >
                          {speed}×
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* full-bleed, same as it was under the hero */}
                  <div className="relative pt-6 pb-2">
                    <Waveform
                      peaks={current.peaks ?? null}
                      progress={progress}
                      duration={duration}
                      time={time}
                      playing={playing}
                      onSeek={seekTo}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="mx-auto max-w-[1400px] px-6 pt-24 pb-24">
            {/* ======================== ABOUT THE SHOW ======================== */}
            <section
              className="relative grid lg:grid-cols-12 gap-10 lg:gap-14 items-center rounded-2xl border border-line bg-gradient-to-br from-blue-deep/25 via-ink-soft to-ink p-8 sm:p-12 overflow-hidden"
              data-reveal
              style={{ transform: 'translateY(28px)' }}
            >
              <div className="lg:col-span-7">
                <span className="kicker text-blue-bright">About the podcast</span>
                <h2 className="mt-4 font-display text-3xl md:text-5xl leading-[1.06] tracking-tight">
                  Everywhere you already listen.
                </h2>
                {/* On phones the full description is a wall of text, so only the
                    first paragraph shows with the rest behind "Read more". The
                    content is identical — nothing is cut, only folded. Desktop
                    still gets all three paragraphs with no control. */}
                <div className="mt-6 space-y-4 max-w-xl text-sm sm:text-base text-bone/65 leading-relaxed">
                  <p>{SHOW.paragraphs[0]}</p>
                  <div className={`space-y-4 sm:block ${aboutOpen ? '' : 'hidden'}`}>
                    {SHOW.paragraphs.slice(1, 3).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAboutOpen((o) => !o)}
                    aria-expanded={aboutOpen}
                    className="sm:hidden inline-flex items-center gap-1.5 text-sm text-blue-bright"
                  >
                    {aboutOpen ? 'Read less' : 'Read more'}
                    <span aria-hidden className={`text-[0.7em] transition-transform duration-300 ${aboutOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>
                </div>
                <ListenNowHeading className="mt-10 max-w-xl" />
                <ListenOn className="mt-5 max-w-xl" />
              </div>
              <div className="lg:col-span-5">
                <motion.div
                  data-motion-safe
                  className="aspect-square w-full max-w-[360px] mx-auto overflow-hidden rounded-2xl border border-line"
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: SHOW_EASE }}
                >
                  <img
                    src={SHOW.image}
                    alt="Frankly Speaking Podcast cover art"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </section>
          </div>
        </>
      )}

      {/* --------------------------- DOCKED PLAYER --------------------------- */}
      {/* Portalled to <body>: the page-transition transform on [data-page] would
          otherwise make position:fixed resolve against the page box, not the
          viewport (same trap as the mobile menu). */}
      {EPISODES.length > 0 &&
        createPortal(
          <div
            className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              docked && (playing || time > 0)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-full pointer-events-none'
            }`}
          >
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center gap-4">
              <img
                src={current.image}
                alt=""
                className="hidden sm:block w-11 h-11 rounded-lg object-cover border border-line"
              />
              <button
                type="button"
                onClick={() => toggle(current)}
                aria-label={playing ? 'Pause episode' : 'Play episode'}
                className="shrink-0 grid place-items-center w-10 h-10 rounded-full bg-blue text-white hover:bg-blue-bright transition-colors"
              >
                {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 translate-x-[1px]" />}
              </button>
              <button
                type="button"
                onClick={() => nudge(-10)}
                aria-label="Back 10 seconds"
                className="hidden sm:block shrink-0 text-bone/55 hover:text-bone transition-colors"
              >
                <SkipIcon dir="back" secs={10} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-bone/85">{current.title}</p>
                <MiniRail progress={progress} onSeek={seekTo} />
              </div>
              <span className="hidden sm:block shrink-0 font-mono text-[0.7rem] text-slate tabular-nums">
                {formatClock(time)} / {formatClock(duration)}
              </span>
              <button
                type="button"
                onClick={cycleSpeed}
                aria-label={`Playback speed ${speed}×`}
                className="shrink-0 font-mono text-[0.7rem] rounded-full border border-line px-2.5 py-1 text-bone/70 hover:border-blue-bright hover:text-white transition-colors"
              >
                {speed}×
              </button>
            </div>
          </div>,
          document.body
        )}
    </main>
  )
}

function Masthead({ route }: { route: string }) {
  const isActive = (href: string) => route.startsWith(href)
  /* The podcast page is an archive, not a live broadcast, and on a phone the
     masthead + BREAKING ticker + hero all stack into the first 200px. There
     only, the ticker is dropped and the bar is given more height so the logo,
     Watch and menu sit lower with air around them. Desktop and every other
     page are untouched. */
  const quietTop = route.startsWith('#/podcast') || route.startsWith('#/listen')
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [route])

  // Lock background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
    <header className="sticky top-0 z-50 bg-ink/85 backdrop-blur border-b border-line">
      <div
        className={`mx-auto max-w-[1400px] px-6 flex items-center justify-between gap-6 ${
          quietTop ? 'h-24 pt-5 md:h-16 md:pt-0' : 'h-16'
        }`}
      >
        <a href="#" className="flex items-baseline gap-3">
          <span className="font-display text-xl tracking-tight leading-none">
            Frankly Speaking
          </span>
          <span className="hidden sm:inline kicker text-slate">with Frank Amedia</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className={`navlink transition-colors duration-300 ${isActive(n.href) ? 'is-active text-blue-bright' : 'text-bone/70 hover:text-bone'}`}
            >
              {n.label}
            </a>
          ))}
          <a
            href="https://www.touchheaven.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="navlink inline-flex items-center gap-1 text-bone/70 hover:text-bone transition-colors duration-300"
          >
            Touch Heaven <span aria-hidden className="text-[0.7em] opacity-70">↗</span>
          </a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#/sponsor"
            className="hidden xl:inline-flex border border-line text-bone/85 text-sm font-medium rounded-full px-5 py-2 hover:border-blue-bright hover:text-white transition-[border-color,color,transform] duration-300 hover:scale-[1.04] active:scale-95"
          >
            Become a Sponsor
          </a>
          <a
            href="#/donate"
            className="hidden sm:inline-flex border border-blue-bright/60 text-blue-bright text-sm font-medium rounded-full px-5 py-2 hover:bg-blue hover:border-blue hover:text-white transition-[background-color,border-color,color,transform] duration-300 hover:scale-[1.04] active:scale-95"
          >
            Donate
          </a>
          <a
            href={`#/watch/${LATEST_ID}`}
            className="bg-blue text-white text-sm font-medium rounded-full px-5 py-2 hover:bg-blue-bright transition-[background-color,transform] duration-300 hover:scale-[1.04] active:scale-95"
          >
            Watch
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden grid place-items-center w-10 h-10 -mr-2 text-bone"
          >
            <span className="relative block w-6 h-4" aria-hidden>
              <span className={`absolute left-0 top-0 h-0.5 w-6 bg-current rounded-full transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-6 bg-current rounded-full transition-opacity duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 bottom-0 h-0.5 w-6 bg-current rounded-full transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`marquee-wrap bg-gradient-to-r from-blue-deep via-blue to-blue-deep text-white overflow-hidden border-t border-blue-bright/40 ${
          quietTop ? 'hidden md:block' : ''
        }`}
      >
        <div className="flex items-center">
          <span className="shrink-0 bg-ink text-white kicker px-4 py-2">● Breaking</span>
          <div className="overflow-hidden py-2">
            <div className="marquee-track text-sm font-medium">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="mx-8 inline-flex items-center gap-3">
                  {t}
                  <span className="opacity-50">/</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* MOBILE MENU PANEL — sibling of <header> so position:fixed resolves to the
        viewport (a backdrop-filter ancestor would otherwise clip it) */}
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-ink/98 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${quietTop ? 'top-24' : 'top-16'} ${menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
    >
      <nav className="flex flex-col px-6 pt-6 pb-10">
        {NAV.map((n) => (
          <a
            key={n.label}
            href={n.href}
            onClick={() => setMenuOpen(false)}
            className={`font-display text-3xl tracking-tight py-4 border-b border-line/60 transition-colors ${isActive(n.href) ? 'text-blue-bright' : 'text-bone hover:text-white'}`}
          >
            {n.label}
          </a>
        ))}
        <a
          href="https://www.touchheaven.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
          className="font-display text-3xl tracking-tight py-4 border-b border-line/60 text-bone hover:text-white transition-colors inline-flex items-center gap-2"
        >
          Touch Heaven <span aria-hidden className="text-lg opacity-60">↗</span>
        </a>
        <a
          href={`#/watch/${LATEST_ID}`}
          onClick={() => setMenuOpen(false)}
          className="mt-8 inline-flex items-center justify-center gap-3 bg-blue text-white px-7 py-4 rounded-full font-medium hover:bg-blue-bright transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          Watch the latest broadcast
        </a>
        <a
          href="#/donate"
          onClick={() => setMenuOpen(false)}
          className="mt-3 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-blue-bright/60 text-blue-bright hover:bg-blue hover:border-blue hover:text-white transition-colors font-medium"
        >
          Donate
        </a>
        <a
          href="#/sponsor"
          onClick={() => setMenuOpen(false)}
          className="mt-3 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-line text-bone hover:border-blue-bright hover:text-white transition-colors font-medium"
        >
          Become a Sponsor
        </a>
        <SocialLinks className="mt-8" iconClass="w-7 h-7" />
        <p className="mt-6 font-mono text-xs text-slate">
          CANFIELD, OH · TOUCH HEAVEN STUDIOS
        </p>
      </nav>
    </div>
    </>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-display text-lg tracking-tight">Frankly Speaking</span>
          <p className="mt-1 font-mono text-xs text-slate">
            TOUCH HEAVEN STUDIOS · CANFIELD, OHIO
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm text-bone/60">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="hover:text-bone transition-colors">
              {n.label}
            </a>
          ))}
          <a href="#/donate" className="hover:text-bone transition-colors">
            Donate
          </a>
          <a href="#/sponsor" className="hover:text-bone transition-colors">
            Become a Sponsor
          </a>
          <a
            href="https://www.touchheaven.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-bone transition-colors"
          >
            Touch Heaven ↗
          </a>
        </div>
        <div className="flex flex-col items-start md:items-end gap-4">
          <SocialLinks />
          <span className="font-mono text-xs text-slate">© 2026 Frankly Speaking</span>
        </div>
      </div>
    </footer>
  )
}

/* --------------------------------- APP ----------------------------------- */

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const route = useHashRoute()

  const watchMatch = /^#\/watch\/([A-Za-z0-9_-]{4,})/.exec(route)
  const watchId = watchMatch ? watchMatch[1] : null
  let page:
    | 'home'
    | 'dispatches'
    | 'series'
    | 'podcast'
    | 'beyond'
    | 'partner'
    | 'donate'
    | 'thanks'
    | 'about'
    | 'watch' = 'home'
  if (watchId) page = 'watch'
  else if (route.startsWith('#/episodes') || route.startsWith('#/dispatches')) page = 'dispatches'
  else if (route.startsWith('#/series')) page = 'series'
  // "#/listen" kept as an alias — it is the natural thing people type
  else if (route.startsWith('#/podcast') || route.startsWith('#/listen')) page = 'podcast'
  // "#/beyond" and "#/forum" kept as aliases so old links keep working
  else if (
    route.startsWith('#/be-on-the-show') ||
    route.startsWith('#/beyond') ||
    route.startsWith('#/forum')
  )
    page = 'beyond'
  else if (route.startsWith('#/sponsor') || route.startsWith('#/partner')) page = 'partner'
  // "#/give" and "#/donations" kept as aliases
  else if (
    route.startsWith('#/donate') ||
    route.startsWith('#/give') ||
    route.startsWith('#/donations')
  )
    page = 'donate'
  else if (route.startsWith('#/thanks')) page = 'thanks'
  else if (route.startsWith('#/about')) page = 'about'

  // Smooth scroll (global)
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    lenisRef.current = lenis
    lenisInstance = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
      lenisInstance = null
    }
  }, [])

  // On route change: jump to top + (re)build motion for the new view
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)

    const ctx = gsap.context(() => {
      // page transition — fade/slide the whole view in
      gsap.fromTo(
        '[data-page]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )

      // hero headline — masked line reveal
      gsap.to('[data-hero-line]', {
        opacity: 1,
        yPercent: 0,
        duration: 1.15,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.4,
      })
      gsap.to('[data-hero-fade]', {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.25,
      })

      // standalone section reveals
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      // grid cascades — staggered batch as each grid scrolls in
      gsap.utils.toArray<HTMLElement>('[data-grid]').forEach((grid) => {
        const items = Array.from(grid.children) as HTMLElement[]
        gsap.set(items, { opacity: 0, y: 42 })
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              stagger: 0.06,
              overwrite: true,
            }),
        })
      })

      // hero scroll parallax (home only)
      const heroVideo = root.current?.querySelector('[data-hero-video]')
      if (heroVideo) {
        const sec = heroVideo.closest('section')
        gsap.to(heroVideo, {
          yPercent: 14,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('[data-hero-content]', {
          yPercent: -6,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      // scroll progress bar
      gsap.fromTo(
        '.scroll-progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
        }
      )
    }, root)

    const safety = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(
          '[data-reveal],[data-hero-line],[data-hero-fade],[data-page],[data-grid] > *'
        )
        .forEach((el) => {
          if (getComputedStyle(el).opacity === '0') {
            el.style.opacity = '1'
            el.style.transform = 'none'
          }
        })
      ScrollTrigger.refresh()
    }, 1300)

    // motion/react elements stall at `initial` when rAF is throttled (background
    // tab, low-power mode, a headless preview), which would leave the hero
    // invisible. This is a LAST-RESORT net, so it is deliberately:
    //   · late (2600ms) — the hero cascade finishes near 2.1s, and firing during
    //     it would visibly snap the animation short;
    //   · viewport-only — forcing below-the-fold elements would permanently kill
    //     their whileInView scroll reveals on a perfectly healthy page.
    const motionSafety = window.setTimeout(() => {
      const vh = window.innerHeight
      const onScreen = (el: HTMLElement) => {
        const r = el.getBoundingClientRect()
        return r.top < vh && r.bottom > 0
      }
      document.querySelectorAll<HTMLElement>('[data-motion-safe]').forEach((el) => {
        if (onScreen(el) && getComputedStyle(el).opacity === '0') el.style.opacity = '1'
      })
      document.querySelectorAll<HTMLElement>('[data-motion-unmask]').forEach((el) => {
        if (!onScreen(el)) return
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
    }, 2600)

    return () => {
      clearTimeout(safety)
      clearTimeout(motionSafety)
      ctx.revert()
    }
  }, [route])

  return (
    <div ref={root} className="grain min-h-screen">
      <div className="scroll-progress" aria-hidden />
      <Masthead route={route} />
      <div data-page key={page === 'watch' ? `w-${watchId}` : page}>
        {page === 'watch' && watchId ? (
          <EpisodeViewer id={watchId} />
        ) : page === 'dispatches' ? (
          <DispatchesPage />
        ) : page === 'series' ? (
          <SeriesPage />
        ) : page === 'podcast' ? (
          <PodcastPage />
        ) : page === 'beyond' ? (
          <BeyondPage />
        ) : page === 'partner' ? (
          <PartnerPage />
        ) : page === 'donate' ? (
          <DonatePage />
        ) : page === 'thanks' ? (
          <ThanksPage />
        ) : page === 'about' ? (
          <AboutPage />
        ) : (
          <Home />
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
