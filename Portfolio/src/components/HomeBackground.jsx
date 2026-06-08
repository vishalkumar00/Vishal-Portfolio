import { useEffect, useRef } from 'react'
import './HomeBackground.css'

/* Neon palette (matches src/assets/colors.css) */
const NEON = [
  [183, 9, 76],   // cherry rose
  [160, 26, 88],  // dark raspberry
  [137, 43, 100], // royal plum
  [114, 60, 112], // velvet purple
  [92, 77, 125],  // dusty grape
  [69, 94, 137],  // dusk blue
  [46, 111, 149], // rich cerulean
  [23, 128, 161], // cerulean
  [0, 145, 173],  // pacific cyan
]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rand = (a, b) => Math.random() * (b - a) + a
function ramp(f) {
  const x = clamp(f, 0, 1) * (NEON.length - 1)
  const i = Math.floor(x)
  const j = Math.min(i + 1, NEON.length - 1)
  const tt = x - i
  return [
    NEON[i][0] + (NEON[j][0] - NEON[i][0]) * tt,
    NEON[i][1] + (NEON[j][1] - NEON[i][1]) * tt,
    NEON[i][2] + (NEON[j][2] - NEON[i][2]) * tt,
  ]
}

/**
 * Ambient hexagon-honeycomb background. A faint structural grid with neon
 * light pulses travelling across it, plus a glow that follows the cursor.
 * Echoes the splash-screen hexagons, kept subtle so content stays readable.
 */
export default function HomeBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    let hr = 30
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let hexes = []
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }

    const buildGrid = () => {
      hr = Math.max(26, Math.min(w, h) * 0.045)
      const stepX = hr * 1.5
      const stepY = hr * Math.sqrt(3)
      hexes = []
      for (let col = -1; col * stepX < w + hr; col++) {
        for (let row = -1; row * stepY < h + hr; row++) {
          const x = col * stepX + hr
          const y = row * stepY + (Math.abs(col) % 2 ? stepY / 2 : 0) + hr
          hexes.push({ x, y, ph: rand(0, Math.PI * 2), color: ramp(x / Math.max(w, 1)) })
        }
      }
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
    }
    resize()
    // re-measure after orientation settles (mobile fires resize too early)
    let pending = []
    const settle = () => {
      pending.forEach(clearTimeout)
      pending = [setTimeout(resize, 150), setTimeout(resize, 400)]
    }
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', settle)

    const onMove = (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY }
    const onLeave = () => { mouse.tx = -9999; mouse.ty = -9999 }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    // travelling light pulses
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
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      const minDim = Math.min(w, h)
      const PR = minDim * 0.32   // pulse radius
      const MR = minDim * 0.2    // mouse radius
      const pc = pulses.map((p) => ({
        x: w * (0.5 + Math.sin(t * p.sx + p.ph) * p.ax),
        y: h * (0.5 + Math.cos(t * p.sy + p.ph) * p.ay),
      }))

      for (const hex of hexes) {
        // base structure + travelling pulses + cursor glow + slow twinkle
        let bright = 0.05 + 0.025 * Math.sin(t * 0.8 + hex.ph)
        for (const p of pc) {
          const d = Math.hypot(hex.x - p.x, hex.y - p.y)
          if (d < PR) bright += (1 - d / PR) * 0.55
        }
        if (mouse.x > -9000) {
          const dm = Math.hypot(hex.x - mouse.x, hex.y - mouse.y)
          if (dm < MR) bright += (1 - dm / MR) * 0.6
        }
        bright = clamp(bright, 0, 1)
        if (bright <= 0.04) continue

        const [r, g, b] = hex.color
        // faint fill for the brightest cells
        if (bright > 0.32) {
          ctx.fillStyle = `rgba(${r},${g},${b},${(bright - 0.32) * 0.09})`
          drawHex(hex.x, hex.y, hr * 0.92); ctx.fill()
        }
        // outline
        ctx.strokeStyle = `rgba(${r + 40},${g + 40},${b + 40},${bright * 0.5})`
        ctx.lineWidth = bright > 0.4 ? 1.2 : 0.7
        drawHex(hex.x, hex.y, hr * 0.92); ctx.stroke()
      }

      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      pending.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', settle)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="home-bg" aria-hidden="true" />
}
