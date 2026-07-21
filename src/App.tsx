import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import playlist from './data/videos.json'
import { FORUM_FORM, PARTNER_FORM } from './config'

gsap.registerPlugin(ScrollTrigger)

/* ---------------------------------- DATA ---------------------------------- */

const NAV = [
  { label: 'Dispatches', href: '#/dispatches' },
  { label: 'Series', href: '#/series' },
  { label: 'Be On The Show', href: '#/be-on-the-show' },
  { label: 'About', href: '#/about' },
]

const SOCIALS = [
  {
    label: 'YouTube',
    handle: '@Franklyspeakingshow',
    cta: 'Subscribe',
    href: 'https://www.youtube.com/@Franklyspeakingshow',
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
  'GLOBAL DISPATCH — Israel & Iran: the prophetic timeline, decoded',
  'NEW EPISODE — The Case For Israel, Pt. 3',
  'BE ON THE SHOW — meet the guests, then take your seat at the desk',
  'BECOME A PARTNER — help keep the broadcast on air',
  'LIVE WED 8PM ET — Touch Heaven Studios, Canfield OH',
]

type Video = { id: string; title: string; duration: number | null }

const VIDEOS = playlist.videos as Video[]
const LATEST_ID = VIDEOS[0]?.id ?? ''

/* ------------------------------- HELPERS --------------------------------- */

function formatDuration(s: number | null) {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  return `${m}:${ss}`
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
      <span className="mt-4 block kicker text-blue-bright">{categoryOf(v.title)}</span>
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
      <span className="mt-3 block kicker text-blue-bright">{categoryOf(v.title)}</span>
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
              href={`#/watch/${LATEST_ID}`}
              className="group inline-flex items-center gap-3 bg-bone text-ink px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue" />
              Watch the latest broadcast
            </a>
            <a
              href="#/partner"
              className="inline-flex items-center gap-2 bg-blue text-white px-7 py-3.5 rounded-full font-medium hover:bg-blue-bright transition-colors"
            >
              Become a Partner
            </a>
            <a
              href="#/be-on-the-show"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-bone/25 text-bone hover:border-blue-bright hover:text-white transition-colors backdrop-blur-sm"
            >
              Be On The Show →
            </a>
          </div>
        </div>
      </section>

      {/* LATEST DISPATCHES (teaser carousel) */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-16">
          <div
            className="flex items-end justify-between gap-6 mb-4"
            data-reveal
            style={{ transform: 'translateY(24px)' }}
          >
            <div>
              <span className="kicker text-blue-bright">{playlist.count} episodes</span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
                Latest broadcasts
              </h2>
            </div>
            <a href="#/dispatches" className="hidden sm:inline kicker text-slate hover:text-bone transition-colors pb-2">
              View all →
            </a>
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

      {/* FOLLOW — SOCIAL CHANNELS */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-24">
          <div className="text-center" data-reveal style={{ transform: 'translateY(28px)' }}>
            <span className="kicker text-blue-bright">Stay connected</span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl tracking-tight leading-[1.04]">
              Follow the broadcast
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-bone/60 leading-relaxed">
              New dispatches, clips, and moments from the studio — wherever you
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

function DispatchesPage() {
  return (
    <main className="min-h-[calc(100svh-104px)]">
      <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-24">
        <PageHeader
          kicker={`${VIDEOS.length} episodes`}
          title="Dispatches"
          sub="Every broadcast — current events and prophecy read through the Kingdom lens, newest first."
        />
        <div data-grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {VIDEOS.map((v) => (
            <VideoTile key={v.id} v={v} />
          ))}
        </div>
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

/* Guests featured on the broadcast — shown on Beyond the Show.
   episodeId (optional) links the card to that conversation and provides the
   photo fallback (episode thumbnail) when no dedicated photo exists. */
type Guest = { name: string; title: string; photo?: string; episodeId?: string }

const GUESTS: Guest[] = []

function GuestCard({ g }: { g: Guest }) {
  const img = g.photo ?? (g.episodeId ? `https://i.ytimg.com/vi/${g.episodeId}/hqdefault.jpg` : null)
  const inner = (
    <>
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-line bg-ink-soft transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:border-blue/40 group-hover:shadow-[0_24px_60px_-24px_rgba(31,111,229,0.6)]">
        {img ? (
          <img
            src={img}
            alt={g.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-blue-deep/40 via-ink-soft to-ink">
            <span className="font-display text-5xl text-bone/30">
              {g.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      </div>
      <h3 className="mt-4 font-display text-xl tracking-tight text-bone group-hover:text-white transition-colors">
        {g.name}
      </h3>
      <p className="mt-1 text-sm text-bone/60 leading-snug">{g.title}</p>
      {g.episodeId && (
        <span className="mt-3 inline-block kicker text-blue-bright opacity-80 group-hover:opacity-100 transition-opacity">
          Watch the conversation →
        </span>
      )}
    </>
  )
  return g.episodeId ? (
    <a href={`#/watch/${g.episodeId}`} className="group block">
      {inner}
    </a>
  ) : (
    <div className="group">{inner}</div>
  )
}

function BeyondPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

  return (
    <main className="min-h-[calc(100svh-104px)]">
      <div className="mx-auto max-w-[1400px] px-6 pt-14">
        <PageHeader
          kicker="Join the broadcast"
          title="Be On The Show"
          sub="The guests who've joined Frank at the desk — and how you can be next."
        />

        {GUESTS.length > 0 && (
          <div className="pb-8">
            <div className="flex items-end justify-between gap-6 mb-8" data-reveal style={{ transform: 'translateY(24px)' }}>
              <div>
                <span className="kicker text-blue-bright">On the show</span>
                <h2 className="mt-2 font-display text-2xl md:text-3xl tracking-tight">The guests</h2>
              </div>
            </div>
            <div data-grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {GUESTS.map((g) => (
                <GuestCard key={g.name} g={g} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line mt-8">
      <div className="mx-auto max-w-[1400px] px-6 py-24 text-center" data-reveal style={{ transform: 'translateY(28px)' }}>
        <span className="kicker text-blue-bright">Your turn</span>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.98] tracking-tight">
          Want to be <span className="italic">on the show?</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-bone/65 leading-relaxed">
          Leave your details — the team reviews every request and reaches out
          about joining Frank on the broadcast.
        </p>

        {status === 'done' ? (
          <div className="mt-12 max-w-md mx-auto" aria-live="polite">
            <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-blue/15 border border-blue-bright/40">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="mt-6 font-display text-2xl tracking-tight">You're on the list.</h2>
            <p className="mt-3 text-bone/65">
              Watch your inbox — the team will be in touch about joining the show.
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
            <div className="flex border border-line rounded-full overflow-hidden focus-within:border-blue-bright transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className="flex-1 bg-transparent px-6 py-4 text-bone placeholder:text-slate outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue text-white px-7 font-medium hover:bg-blue-bright transition-[background-color,transform] active:scale-95 disabled:opacity-60"
              >
                {status === 'loading' ? '…' : 'Apply'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-400">Something went wrong — please try again.</p>
            )}
          </form>
        )}

        <p className="mt-8 font-mono text-xs text-slate">
          TOUCH HEAVEN MINISTRIES · DEEP CALLS 2 DEEP UNIVERSITY
        </p>
      </div>
      </div>
    </main>
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
    <main className="min-h-[calc(100svh-104px)] grid place-items-center">
      <div className="mx-auto max-w-[1400px] px-6 py-24 text-center" data-reveal style={{ transform: 'translateY(28px)' }}>
        <span className="kicker text-blue-bright">Stand with the broadcast</span>
        <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] tracking-tight">
          Become a <span className="italic">Partner</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-bone/65 leading-relaxed">
          Partners keep Frankly Speaking on the air — daily Kingdom insight,
          free for everyone, everywhere. Leave your details and the team will
          reach out personally about partnering with the show.
        </p>

        {status === 'done' ? (
          <div className="mt-12 max-w-md mx-auto" aria-live="polite">
            <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-blue/15 border border-blue-bright/40">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="mt-6 font-display text-2xl tracking-tight">Thank you.</h2>
            <p className="mt-3 text-bone/65">
              The team has your details — expect a personal note about partnering
              with the show.
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
              {status === 'loading' ? '…' : 'Become a Partner'}
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

function AboutPage() {
  return (
    <main className="min-h-[calc(100svh-104px)]">
      <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-24">
        <PageHeader kicker="The Host" title="Frank Amedia" />
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6" data-reveal style={{ transform: 'translateY(28px)' }}>
            <Photo label="Frank Amedia" src="/images/host.jpg" imgClassName="object-top" className="aspect-[4/3] w-full" />
          </div>
          <div className="lg:col-span-6 space-y-6 text-bone/75 leading-relaxed text-lg" data-reveal style={{ transform: 'translateY(28px)' }}>
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
          </div>
        </div>
      </div>
    </main>
  )
}

function EpisodeViewer({ id }: { id: string }) {
  const idx = VIDEOS.findIndex((v) => v.id === id)
  const v = VIDEOS[idx]

  if (!v) {
    return (
      <main className="min-h-[calc(100svh-104px)] mx-auto max-w-[900px] px-6 py-32 text-center">
        <span className="kicker text-blue-bright">Not found</span>
        <h1 className="mt-4 font-display text-4xl tracking-tight">This episode is unavailable</h1>
        <a
          href="#/dispatches"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-bone text-ink font-medium hover:bg-white transition-colors"
        >
          ← Back to dispatches
        </a>
      </main>
    )
  }

  const newer = VIDEOS[idx - 1]
  const older = VIDEOS[idx + 1]
  const more = VIDEOS.filter((x) => x.id !== id).slice(0, 12)

  return (
    <main className="min-h-[calc(100svh-104px)]">
      <div className="mx-auto max-w-[1180px] px-6 pt-8 pb-24">
        <a
          href="#/dispatches"
          className="inline-flex items-center gap-2 kicker text-slate hover:text-bone transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          All dispatches
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
              FRANKLY SPEAKING · FRANK AMEDIA{v.duration ? ` · ${formatDuration(v.duration)}` : ''}
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

function Masthead({ route }: { route: string }) {
  const isActive = (href: string) => route.startsWith(href)
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
      <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between gap-6">
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
          <SocialLinks className="hidden md:flex" iconClass="w-[18px] h-[18px]" />
          <span className="hidden lg:block font-mono text-xs text-slate tabular-nums">
            CANFIELD, OH
          </span>
          <a
            href="#/partner"
            className="hidden sm:inline-flex border border-line text-bone/85 text-sm font-medium rounded-full px-5 py-2 hover:border-blue-bright hover:text-white transition-[border-color,color,transform] duration-300 hover:scale-[1.04] active:scale-95"
          >
            Become a Partner
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

      <div className="marquee-wrap bg-gradient-to-r from-blue-deep via-blue to-blue-deep text-white overflow-hidden border-t border-blue-bright/40">
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
      className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-ink/98 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
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
          href="#/partner"
          onClick={() => setMenuOpen(false)}
          className="mt-3 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-line text-bone hover:border-blue-bright hover:text-white transition-colors font-medium"
        >
          Become a Partner
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
          <a href="#/partner" className="hover:text-bone transition-colors">
            Become a Partner
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
  let page: 'home' | 'dispatches' | 'series' | 'beyond' | 'partner' | 'about' | 'watch' = 'home'
  if (watchId) page = 'watch'
  else if (route.startsWith('#/dispatches')) page = 'dispatches'
  else if (route.startsWith('#/series')) page = 'series'
  // "#/beyond" and "#/forum" kept as aliases so old links keep working
  else if (
    route.startsWith('#/be-on-the-show') ||
    route.startsWith('#/beyond') ||
    route.startsWith('#/forum')
  )
    page = 'beyond'
  else if (route.startsWith('#/partner')) page = 'partner'
  else if (route.startsWith('#/about')) page = 'about'

  // Smooth scroll (global)
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
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

    return () => {
      clearTimeout(safety)
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
        ) : page === 'beyond' ? (
          <BeyondPage />
        ) : page === 'partner' ? (
          <PartnerPage />
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
