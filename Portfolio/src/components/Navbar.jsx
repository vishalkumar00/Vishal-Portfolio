import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { scrollToSection } from '../utils/scrollToSection'
import './Navbar.css'

/* Small inline stroke icons — inherit currentColor so they follow link states */
const Icon = {
  home: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11.2 12 4l9 7.2" />
      <path d="M5 10v9h5v-5h4v5h5v-9" />
    </svg>
  ),
  skills: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 12l9 4.5L21 12" />
      <path d="M3 16.5 12 21l9-4.5" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
}

const LINKS = [
  { label: 'Home', href: '#home', icon: 'home' },
  { label: 'Skills', href: '#skills', icon: 'skills' },
  { label: 'Projects', href: '#projects', icon: 'projects' },
  { label: 'About', href: '#about', icon: 'about' },
  { label: 'Contact me', href: '#contact', icon: 'contact' },
]

const TAB_H = 22 // tab rise — keep in sync with .nav__tab height
const ORB_DUR = '8.4s' // full there-and-back round trip
// ghost orbs lagging behind the core, fading + shrinking = light trail
const TRAIL = [
  { d: 0.1, r: 3.4, o: 0.4 },
  { d: 0.2, r: 3.0, o: 0.32 },
  { d: 0.31, r: 2.6, o: 0.25 },
  { d: 0.43, r: 2.2, o: 0.19 },
  { d: 0.56, r: 1.8, o: 0.13 },
  { d: 0.71, r: 1.4, o: 0.09 },
  { d: 0.88, r: 1.0, o: 0.05 },
]

export default function Navbar() {
  const [active, setActive] = useState('#home')
  const [tab, setTab] = useState({ left: 0, width: 0 })
  const [railW, setRailW] = useState(0)
  const [ready, setReady] = useState(false) // skip the slide on first paint
  const [animate, setAnimate] = useState(true) // disabled when reduced motion
  const itemRefs = useRef({})
  const linksRef = useRef(null)

  // Position the sliding tab over the active item; re-measure on resize/font load
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active]
      if (el) setTab({ left: el.offsetLeft, width: el.offsetWidth })
      if (linksRef.current) setRailW(linksRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    document.fonts?.ready.then(measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [active])

  // enable the glide only after the first paint (skip the initial slide-in)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // respect reduced-motion: drop the travelling orb
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setAnimate(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // path the orb follows: along the line, up the riser, over the tab, back down.
  // Forward then the same path reversed → ping-pong with no teleport at the ends.
  const baseY = TAB_H + 2 // line sits here in the SVG (room above for the tab)
  const aX = tab.left
  const bX = tab.left + tab.width
  const fwd = `M0,${baseY} L${aX},${baseY} L${aX},2 L${bX},2 L${bX},${baseY} L${railW},${baseY}`
  const back = ` L${bX},${baseY} L${bX},2 L${aX},2 L${aX},${baseY} L0,${baseY}`
  const orbPath = fwd + back

  return (
    <header className="nav">
      <div className="nav__bar">
        <a
          className="nav__brand"
          href="#home"
          aria-label="Home"
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('#home')
            setActive('#home')
          }}
        >
          VK
        </a>

        <nav className="nav__links" aria-label="Primary" ref={linksRef}>
          {/* one continuous line; a raised tab slides to the active item */}
          <span className={`nav__rail${ready ? ' is-ready' : ''}`} aria-hidden="true">
            <span className="nav__line nav__line--left" style={{ width: `${tab.left}px` }} />
            <span
              className="nav__line nav__line--right"
              style={{ left: `${tab.left + tab.width}px` }}
            />
            <span
              className="nav__tab"
              style={{ left: `${tab.left}px`, width: `${tab.width}px` }}
            />
          </span>

          {/* glowing orb that travels the exact line+tab path, with a light trail */}
          {animate && railW > 0 && (
            <svg
              className="nav__orb"
              width={railW}
              height={baseY + 4}
              viewBox={`0 0 ${railW} ${baseY + 4}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <filter id="navOrbGlow" x="-300%" y="-300%" width="700%" height="700%">
                  <feGaussianBlur stdDeviation="2.6" />
                </filter>
              </defs>
              {TRAIL.map((t) => (
                <circle key={t.d} r={t.r} fill="#ffffff" opacity={t.o} filter="url(#navOrbGlow)">
                  <animateMotion
                    dur={ORB_DUR}
                    begin={`${t.d}s`}
                    repeatCount="indefinite"
                    calcMode="linear"
                    path={orbPath}
                  />
                </circle>
              ))}
              {/* soft halo */}
              <circle r="5.2" fill="#ffffff" opacity="0.75" filter="url(#navOrbGlow)">
                <animateMotion dur={ORB_DUR} repeatCount="indefinite" calcMode="linear" path={orbPath} />
              </circle>
              {/* bright core */}
              <circle r="2.6" fill="#ffffff">
                <animateMotion dur={ORB_DUR} repeatCount="indefinite" calcMode="linear" path={orbPath} />
              </circle>
            </svg>
          )}

          {LINKS.map((l) => {
            const isActive = l.href === active
            return (
              <a
                key={l.href}
                ref={(el) => {
                  itemRefs.current[l.href] = el
                }}
                href={l.href}
                className={`nav__item${isActive ? ' is-active' : ''}`}
                aria-label={l.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(l.href)
                  setActive(l.href)
                }}
              >
                <span className="nav__icon">{Icon[l.icon]}</span>
                <span className="nav__label">{l.label}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
