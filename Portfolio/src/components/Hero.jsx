import { useEffect, useState } from 'react'
import { scrollToSection } from '../utils/scrollToSection'
import './Hero.css'

const ROLES = [
  'Full Stack Developer',
  'MERN Stack Apps',
  'React.js Interfaces',
  'ASP.NET MVC Solutions',
]

export default function Hero() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % ROLES.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="home" className="hero">
      <div className="hero__inner">
        <p className="hero__eyebrow">Hi, I'm</p>

        <h1 className="hero__name">Vishal Kumar</h1>

        <h2 className="hero__role">
          <span className="hero__role-lead">I build </span>
          <span key={i} className="hero__role-rot">{ROLES[i]}</span>
        </h2>

        <p className="hero__intro">
          A full stack developer crafting modern web applications with the MERN
          stack, React.js, and ASP.NET MVC — turning ideas into clean,
          high-quality software.
        </p>

        <div className="hero__cta">
          <a
            className="btn btn--primary"
            href="#projects"
            onClick={(e) => { e.preventDefault(); scrollToSection('#projects') }}
          >
            View Projects
          </a>
          <a
            className="btn btn--ghost"
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollToSection('#contact') }}
          >
            Get in Touch
          </a>
        </div>

        <div className="hero__socials">
          <a href="https://linkedin.com/in/vishal-kumar666" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <span className="hero__dot" aria-hidden="true">•</span>
          <a href="mailto:vishalkumar.0000666@gmail.com">Email</a>
        </div>
      </div>

      <a
        className="hero__scroll"
        href="#about"
        aria-label="Scroll to About"
        onClick={(e) => { e.preventDefault(); scrollToSection('#about') }}
      >
        <span>scroll</span>
        <span className="hero__chevron" aria-hidden="true">⌄</span>
      </a>
    </section>
  )
}
