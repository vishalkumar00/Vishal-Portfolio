import { useState } from 'react'
import './Navbar.css'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [active, setActive] = useState('#home')
  const activeIdx = LINKS.findIndex((l) => l.href === active)

  return (
    <header className="nav">
      <div className="nav__bar">
        <a className="nav__brand" href="#home" aria-label="Home">VK</a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l, i) => {
            const step = Math.abs(i - activeIdx) // distance from current page
            const isActive = l.href === active
            return (
              <a
                key={l.href}
                href={l.href}
                className={`nav__item${isActive ? ' is-active' : ''}`}
                style={{ '--step': step }}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActive(l.href)}
              >
                {l.label}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
