import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'
import playlist from './data/videos.json'
import { FORUM_FORM, PARTNER_FORM } from './config'

gsap.registerPlugin(ScrollTrigger)

/* ---------------------------------- DATA ---------------------------------- */

const NAV = [
  { label: 'Episodes', href: '#/episodes' },
  { label: 'Series', href: '#/series' },
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
  'GLOBAL DISPATCH — Israel & Iran: the prophetic timeline, decoded',
  'NEW EPISODE — The Case For Israel, Pt. 3',
  'BE ON THE SHOW — meet the guests, then take your seat at the desk',
  'BECOME A SPONSOR — help keep the broadcast on air',
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

function BeyondPage() {
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

  return (
    <main className="min-h-[calc(100svh-104px)] overflow-x-clip">
      <div className="mx-auto max-w-[1400px] px-6 pt-14">
        <ShowTitle />

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
            <motion.form
              className="mt-11 max-w-lg mx-auto flex flex-col gap-3 text-left"
              onSubmit={submit}
              aria-live="polite"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: SHOW_EASE, delay: 0.65 }}
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
          )}

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
            href="#/sponsor"
            className="hidden sm:inline-flex border border-line text-bone/85 text-sm font-medium rounded-full px-5 py-2 hover:border-blue-bright hover:text-white transition-[border-color,color,transform] duration-300 hover:scale-[1.04] active:scale-95"
          >
            Become a Sponsor
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
  let page: 'home' | 'dispatches' | 'series' | 'beyond' | 'partner' | 'about' | 'watch' = 'home'
  if (watchId) page = 'watch'
  else if (route.startsWith('#/episodes') || route.startsWith('#/dispatches')) page = 'dispatches'
  else if (route.startsWith('#/series')) page = 'series'
  // "#/beyond" and "#/forum" kept as aliases so old links keep working
  else if (
    route.startsWith('#/be-on-the-show') ||
    route.startsWith('#/beyond') ||
    route.startsWith('#/forum')
  )
    page = 'beyond'
  else if (route.startsWith('#/sponsor') || route.startsWith('#/partner')) page = 'partner'
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
