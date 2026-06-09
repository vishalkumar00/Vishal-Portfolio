import { useEffect, useRef, useState } from 'react'
import './Contact.css'

const METHODS = [
  {
    label: 'Email',
    href: 'mailto:vishalkumar.0000666@gmail.com',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/vishal-kumar666',
  },
]

export default function Contact() {
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
    <section id="contact" className={`contact${shown ? ' is-shown' : ''}`} ref={ref}>
      <div className="contact__inner">
        <p className="contact__eyebrow">Get in touch</p>
        <h2 className="contact__title">Let’s build something together</h2>
        <p className="contact__lead">
          Open to full-stack roles and collaborations. The fastest way to reach
          me is below — I’ll get back to you soon.
        </p>

        <div className="contact__methods">
          {METHODS.map((m) => (
            <a
              className="cmethod"
              key={m.label}
              href={m.href}
              target={m.href.startsWith('http') ? '_blank' : undefined}
              rel={m.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <span className="cmethod__label">{m.label}</span>
              <svg className="cmethod__arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <footer className="contact__footer">
        <span>© {new Date().getFullYear()} Vishal Kumar</span>
      
      </footer>
    </section>
  )
}
