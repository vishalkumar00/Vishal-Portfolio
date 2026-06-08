import { useEffect, useRef } from 'react'
import './SkillsBackground.css'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rand = (a, b) => Math.random() * (b - a) + a

/**
 * White hexagon-honeycomb background, scoped to the Skills section.
 * Same grid + travelling light pulses as the home background, monochrome white.
 */
export default function SkillsBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    let hr = 30
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let hexes = []

    const buildGrid = () => {
      hr = Math.max(26, Math.min(w, h) * 0.05)
      const stepX = hr * 1.5
      const stepY = hr * Math.sqrt(3)
      hexes = []
      for (let col = -1; col * stepX < w + hr; col++) {
        for (let row = -1; row * stepY < h + hr; row++) {
          const x = col * stepX + hr
          const y = row * stepY + (Math.abs(col) % 2 ? stepY / 2 : 0) + hr
          hexes.push({ x, y, ph: rand(0, Math.PI * 2) })
        }
      }
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    window.addEventListener('resize', resize)

    const pulses = [
      { ax: 0.34, ay: 0.26, sx: 0.08, sy: 0.06, ph: 0 },
      { ax: 0.28, ay: 0.3, sx: 0.05, sy: 0.09, ph: 2.1 },
      { ax: 0.32, ay: 0.24, sx: 0.07, sy: 0.05, ph: 4.2 },
    ]

    const drawHex = (x, y, r) => {
      ctx.beginPath()
      for (let s = 0; s < 6; s++) {
        const ang = (Math.PI / 180) * (60 * s)
        const px = x + r * Math.cos(ang)
        const py = y + r * Math.sin(ang)
        if (s === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    const draw = (now) => {
      const t = now / 1000
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      const minDim = Math.min(w, h)
      const PR = minDim * 0.4 // pulse radius
      const pc = pulses.map((p) => ({
        x: w * (0.5 + Math.sin(t * p.sx + p.ph) * p.ax),
        y: h * (0.5 + Math.cos(t * p.sy + p.ph) * p.ay),
      }))

      for (const hex of hexes) {
        let bright = 0.05 + 0.025 * Math.sin(t * 0.8 + hex.ph)
        for (const p of pc) {
          const d = Math.hypot(hex.x - p.x, hex.y - p.y)
          if (d < PR) bright += (1 - d / PR) * 0.5
        }
        bright = clamp(bright, 0, 1)
        if (bright <= 0.04) continue

        if (bright > 0.32) {
          ctx.fillStyle = `rgba(255,255,255,${(bright - 0.32) * 0.06})`
          drawHex(hex.x, hex.y, hr * 0.92)
          ctx.fill()
        }
        ctx.strokeStyle = `rgba(255,255,255,${bright * 0.45})`
        ctx.lineWidth = bright > 0.4 ? 1.1 : 0.6
        drawHex(hex.x, hex.y, hr * 0.92)
        ctx.stroke()
      }

      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) draw(0)
    else raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="skills-bg" aria-hidden="true" />
}
