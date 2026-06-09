import { useEffect, useRef, useState } from 'react'
import './About.css'

const EDUCATION = [
  {
    school: 'Conestoga College',
    detail: 'Post Graduate Diploma — Full Stack Development',
    place: 'Kitchener, Ontario',
    years: '2023 – 2024',
  },
  {
    school: 'Rayat Group of Institutions',
    detail: 'B.Tech — Computer Science & Engineering',
    place: 'Ropar, Punjab, India',
    years: '2017 – 2021',
  },
]

export default function About() {
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
    <section id="about" className={`about${shown ? ' is-shown' : ''}`} ref={ref}>
      <div className="about__inner">
        <div className="about__intro">
          <p className="about__eyebrow">About me</p>
          <h2 className="about__title">
            Full-stack developer with a CS foundation
          </h2>
          <p className="about__lead">
            I build clean, high-quality web applications with the MERN stack,
            React.js and ASP.NET MVC. I pair a Computer Science background with
            hands-on full-stack experience across the front and back end —
            turning ideas into reliable, well-structured software.
          </p>
        </div>

        <div className="about__edu">
          <h3 className="about__edu-h">Education</h3>
          <ul className="about__edu-list">
            {EDUCATION.map((e) => (
              <li className="edu" key={e.school}>
                <span className="edu__years">{e.years}</span>
                <div className="edu__body">
                  <h4 className="edu__school">{e.school}</h4>
                  <p className="edu__detail">{e.detail}</p>
                  <p className="edu__place">{e.place}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
