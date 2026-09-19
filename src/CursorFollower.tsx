import { useEffect, useRef } from 'react'

/* Broadcast viewfinder cursor (picked 2026-09-19 from four previews): four blue camera-frame
   corners follow the pointer and lock onto whatever link or button is hovered, with a small
   red REC dot pinned to the pointer itself. Mouse/trackpad only — touch devices and
   reduced-motion users keep the normal system cursor. */

const BLUE_BRIGHT = '59, 139, 255' // #3B8BFF
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary'
const REST = 38 // frame size when nothing is hovered
const PAD = 10 // frame padding around a hovered element

export default function CursorFollower() {
  const frame = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || calm) return

    let mx = -200, my = -200 // pointer
    let fx = mx, fy = my // lagging frame centre
    let fw = REST, fh = REST // current frame size
    let hoverEl: Element | null = null
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      hoverEl = (e.target as Element)?.closest?.(INTERACTIVE) ?? null
    }
    const onLeave = () => { mx = my = -200 }

    const tick = () => {
      const r = hoverEl?.getBoundingClientRect()
      const tx = r ? r.left + r.width / 2 : mx
      const ty = r ? r.top + r.height / 2 : my
      const tw = r ? r.width + PAD * 2 : REST
      const th = r ? r.height + PAD * 2 : REST
      fx += (tx - fx) * 0.22
      fy += (ty - fy) * 0.22
      fw += (tw - fw) * 0.25
      fh += (th - fh) * 0.25
      const F = frame.current, D = dot.current
      if (F) {
        F.style.width = `${fw}px`
        F.style.height = `${fh}px`
        F.style.transform = `translate3d(${fx}px, ${fy}px, 0) translate(-50%, -50%)`
        F.style.opacity = r ? '1' : '0.85'
      }
      if (D) D.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.classList.add('cursor-none')
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('cursor-none')
    }
  }, [])

  const layer = 'pointer-events-none fixed left-0 top-0 hidden [@media(pointer:fine)]:block motion-reduce:!hidden'
  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => (
    <span className="absolute" style={{
      width: 12, height: 12, borderColor: `rgb(${BLUE_BRIGHT})`, borderStyle: 'solid', borderWidth: 0,
      ...(pos[0] === 't' ? { top: 0, borderTopWidth: 2 } : { bottom: 0, borderBottomWidth: 2 }),
      ...(pos[1] === 'l' ? { left: 0, borderLeftWidth: 2 } : { right: 0, borderRightWidth: 2 }),
      filter: `drop-shadow(0 0 4px rgba(${BLUE_BRIGHT}, 0.8))`,
    }} />
  )
  return (
    <>
      <div ref={frame} aria-hidden className={`${layer} z-[9998]`} style={{ width: REST, height: REST }}>
        {corner('tl')}{corner('tr')}{corner('bl')}{corner('br')}
      </div>
      <div ref={dot} aria-hidden className={`${layer} z-[9999] rounded-full`} style={{
        width: 5, height: 5, background: '#ff3b3b', boxShadow: '0 0 8px 1px rgba(255,59,59,0.8)',
      }} />
    </>
  )
}
