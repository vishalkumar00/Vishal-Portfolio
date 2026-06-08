import { useEffect, useRef, useState } from 'react'
import SkillsBackground from './SkillsBackground'
import './Skills.css'

const SKILLS = [
  'Python', 'JavaScript', 'Java', 'Kotlin', 'SQL', 'HTML', 'CSS',
  'React', 'Node.js', 'Express', 'ASP.NET MVC',
  'MongoDB', 'SQL Server',
  'VS Code', 'Visual Studio', 'Android Studio', 'PyCharm',
]

const COLORS = [
  '#ef5f5f', '#f5a623', '#f4cf3b', '#5ed29a', '#5b8def',
  '#a78bfa', '#f472b6', '#2dd4bf', '#fb8a5c', '#67a8ff', '#7bd389',
]

const N = SKILLS.length
const REV = (Math.PI * 2) / 46 // orbit speed (rad/s) — one turn / 46s

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function Skills() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const chipRefs = useRef([])
  const eyebrowRef = useRef(null)
  const titleRef = useRef(null)
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
    if (compact) return // simple static wrap on small screens
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf
    let orbit = 0
    let last = performance.now()
    let paused = false
    let circleA = reduce ? 1 : 0 // circle assembly amount
    let textA = reduce ? 1 : 0 // text presence amount
    let prevSp = 0
    let dir = 1 // 1 = scrolling down, -1 = up

    // pause the orbit while hovering a pill so it can be read
    const over = (e) => { if (e.target.closest('.chip')) paused = true }
    const out = (e) => { if (e.target.closest('.chip')) paused = false }
    stage.addEventListener('pointerover', over)
    stage.addEventListener('pointerout', out)

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const visible = rect.bottom > 0 && rect.top < vh
      const track = Math.max(1, section.offsetHeight - vh)
      const sp = reduce ? 1 : clamp(-rect.top / track, 0, 1)

      // scroll direction
      if (sp > prevSp + 0.0005) dir = 1
      else if (sp < prevSp - 0.0005) dir = -1
      prevSp = sp

      // Targets: scrolling DOWN assembles the circle first, then brings the text
      // in. Scrolling UP collapses the circle + text together (shared progress).
      let cT
      let tT
      if (reduce) {
        cT = 1
        tT = 1
      } else if (dir === 1) {
        cT = clamp(sp / 0.55, 0, 1)
        tT = clamp((sp - 0.58) / 0.24, 0, 1) // text only after the circle is done
      } else {
        const sh = clamp(sp / 0.8, 0, 1)
        cT = sh
        tT = sh
      }
      // ease toward the targets so it reads fluid and holds when you stop
      const k = reduce ? 1 : 0.18
      circleA += (cT - circleA) * k
      textA += (tT - textA) * k

      // oval geometry (relative to stage centre)
      const rx = Math.min(window.innerWidth * 0.4, 470)
      const ry = rx * 0.56
      const startX = -(rx + window.innerWidth * 0.45) // off the left edge

      // once formed (circle + text), the whole oval revolves
      if (circleA >= 0.995 && textA >= 0.6 && visible && !paused && !reduce) {
        orbit += dt * REV
      }

      for (let i = 0; i < N; i++) {
        const el = chipRefs.current[i]
        if (!el) continue
        const a = (i / N) * Math.PI * 2 - Math.PI / 2 + orbit
        const slotX = Math.cos(a) * rx
        const slotY = Math.sin(a) * ry
        const start = (i / N) * 0.55 // stagger: one-by-one from the left
        const lp = easeOut(clamp((circleA - start) / 0.4, 0, 1))
        const x = lerp(startX, slotX, lp)
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${slotY}px)`
        el.style.opacity = lp
      }

      // headline: eyebrow in from the left, title in from the right, to centre
      const hp = easeOut(textA)
      const dist = window.innerWidth * 0.5
      if (eyebrowRef.current) {
        eyebrowRef.current.style.transform = `translateX(${lerp(-dist, 0, hp)}px)`
        eyebrowRef.current.style.opacity = hp
      }
      if (titleRef.current) {
        titleRef.current.style.transform = `translateX(${lerp(dist, 0, hp)}px)`
        titleRef.current.style.opacity = hp
      }

      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame(performance.now())

    return () => {
      cancelAnimationFrame(raf)
      stage.removeEventListener('pointerover', over)
      stage.removeEventListener('pointerout', out)
    }
  }, [compact])

  return (
    <section
      id="skills"
      className={`skills${compact ? ' skills--compact' : ''}`}
      ref={sectionRef}
    >
      <div className="skills__stage" ref={stageRef}>
        <SkillsBackground />

        <div className="skills__center">
          <div className="skills__head">
            <p className="skills__eyebrow" ref={eyebrowRef}>What I work with</p>
            <h2 className="skills__title" ref={titleRef}>The stack<br />I build with</h2>
          </div>
        </div>

        <div className="skills__chips">
          {SKILLS.map((name, i) => (
            <span
              key={name}
              className="chip"
              ref={(el) => { chipRefs.current[i] = el }}
            >
              <span className="chip__inner" style={{ background: COLORS[i % COLORS.length] }}>
                {name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
