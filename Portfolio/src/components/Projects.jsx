import { Fragment, useEffect, useRef, useState } from 'react'
import './Projects.css'

const PROJECTS = [
  {
    n: '01',
    title: 'Studio-Merland',
    sub: 'Furniture E-commerce',
    year: 'Aug 2024',
    stack: ['C#', 'ASP.NET MVC', 'LINQ', 'JavaScript'],
    desc: 'Full-stack e-commerce site — LINQ for complex entity relationships, secure auth via the Identity framework, and MVC Areas separating admin and user views.',
  },
  {
    n: '02',
    title: 'Employee Management System',
    sub: 'MERN Dashboard',
    year: 'Apr 2024',
    stack: ['React', 'MongoDB', 'Bootstrap'],
    desc: 'Responsive React frontend with React Router and a MongoDB backend; Webpack used to split frontend and backend builds.',
  },
  {
    n: '03',
    title: 'Drive Test',
    sub: 'Driving Test Management',
    year: 'Dec 2023',
    stack: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
    desc: 'Multi-portal MVC system with RESTful APIs and role-based middleware; AJAX + Promises drive asynchronous time-slot allocation.',
  },
]

const SLABS = 72
const SLAB_GAP = 13 // px between plates (bigger = airier, taller)
const SLAB_STEP = 8 // deg of twist added per plate

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function Projects() {
  const sectionRef = useRef(null)
  const towerRef = useRef(null)
  const cardRefs = useRef([])
  const [compact, setCompact] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const onChange = () => setCompact(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (compact) return
    const section = sectionRef.current
    if (!section) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf
    const frame = (now) => {
      const t = now / 1000
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const track = Math.max(1, section.offsetHeight - vh)
      const p = reduce ? 0.5 : clamp(-rect.top / track, 0, 1)

      // twist the tower with scroll, plus a slow drift so it's alive
      if (towerRef.current) {
        const twist = p * 320 + (reduce ? 0 : t * 4)
        towerRef.current.style.transform = `translateY(${lerp(-200, 200, p)}px) rotateX(8deg) rotateY(${twist}deg)`
      }

      // each project occupies a third of the scroll; slide in from alt. sides
      PROJECTS.forEach((_, i) => {
        const el = cardRefs.current[i]
        if (!el) return
        const local = p * PROJECTS.length - i
        const inP = easeOut(clamp(local / 0.45, 0, 1))
        const outP = easeOut(clamp((local - 0.85) / 0.3, 0, 1))
        const opacity = reduce ? 1 : clamp(inP - outP, 0, 1)
        const side = i % 2 === 0 ? -1 : 1
        const x = lerp(side * 140, 0, inP)
        const y = lerp(0, -50, outP)
        el.style.opacity = opacity
        el.style.transform = `translate(${x}px, calc(-50% + ${y}px))`
      })

      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame(performance.now())
    return () => cancelAnimationFrame(raf)
  }, [compact])

  // each plate = a long bar + a short perpendicular bar (90° apart) giving it
  // real depth, so as it twists the width pulses 360→80→360 but never vanishes
  const slabs = Array.from({ length: SLABS }, (_, i) => {
    const yOff = (i - (SLABS - 1) / 2) * SLAB_GAP
    const rot = i * SLAB_STEP
    return (
      <Fragment key={i}>
        <span
          className="slab"
          style={{ transform: `translateY(${yOff}px) rotateY(${rot}deg)` }}
        />
        <span
          className="slab slab--depth"
          style={{ transform: `translateY(${yOff}px) rotateY(${rot + 90}deg)` }}
        />
      </Fragment>
    )
  })

  return (
    <section
      id="projects"
      className={`projects${compact ? ' projects--compact' : ''}`}
      ref={sectionRef}
    >
      <div className="projects__stage">
        <p className="projects__eyebrow">Selected work</p>

        {/* twisting slab tower background */}
        <div className="projects__tower-wrap" aria-hidden="true">
          <div className="projects__tower" ref={towerRef}>
            {slabs}
          </div>
        </div>

        {/* project cards, revealed on scroll from alternating sides */}
        <div className="projects__items">
          {PROJECTS.map((pj, i) => (
            <article
              key={pj.title}
              className={`pcard pcard--${i % 2 === 0 ? 'left' : 'right'}`}
              ref={(el) => { cardRefs.current[i] = el }}
            >
              <span className="pcard__n">{pj.n}</span>
              <h3 className="pcard__title">{pj.title}</h3>
              <p className="pcard__sub">{pj.sub} · {pj.year}</p>
              <p className="pcard__desc">{pj.desc}</p>
              <ul className="pcard__stack">
                {pj.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
