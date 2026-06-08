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
// place every pill evenly around one circle; the whole ring revolves together
const CHIPS = SKILLS.map((name, i) => ({
  name,
  color: COLORS[i % COLORS.length],
  a: (i / N) * 360, // angle on the circle (deg)
}))

export default function Skills() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="skills" className={`skills${shown ? ' is-shown' : ''}`} ref={ref}>
      <SkillsBackground />

      <div className="skills__cloud">
        <div className="skills__center">
          <p className="skills__eyebrow">What I work with</p>
          <h2 className="skills__title">The stack<br />I build with</h2>
        </div>

        {/* one ring of pills that revolves around the headline */}
        <div className="skills__ringwrap">
          <div className="skills__ring">
            {CHIPS.map((c) => (
              <div className="ring__slot" key={c.name} style={{ '--a': `${c.a}deg` }}>
                <div className="ring__counter">
                  <div className="ring__fix">
                    <span className="chip__inner" style={{ background: c.color }}>
                      {c.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
