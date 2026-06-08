import { useEffect, useRef, useState } from 'react'
import './SplashScreen.css'

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

const COLS = 40
const ROWS = 24
const PLEXUS_COUNT = 44
const DURATION = 3900 // ms until reveal
const SIDES = ['top', 'bottom', 'left', 'right']

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const rand = (a, b) => Math.random() * (b - a) + a

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ]
}
function ramp(f) {
  const x = clamp(f, 0, 1) * (NEON.length - 1)
  const i = Math.floor(x)
  return lerpColor(NEON[i], NEON[Math.min(i + 1, NEON.length - 1)], x - i)
}

function SplashScreen({ onFinish }) {
  const canvasRef = useRef(null)
  const [exiting, setExiting] = useState(false)
  const exitedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    /* ---- Layer 1: wave-surface grid ---- */
    const grid = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        grid.push({
          u: (c / (COLS - 1)) * 2 - 1,
          v: (r / (ROWS - 1)) * 2 - 1,
          r, c,
          side: SIDES[(r * COLS + c) % 4],
          color: ramp(c / (COLS - 1)),
          delay: rand(0, 0.4),
        })
      }
    }
    const gIdx = (r, c) => r * COLS + c

    /* ---- Layer 2: floating plexus nodes ---- */
    const nodes = Array.from({ length: PLEXUS_COUNT }, (_, i) => {
      const side = SIDES[i % 4]
      return {
        hx: rand(-0.66, 0.66),
        hy: rand(-0.52, 0.52),
        hz: rand(-1, 1),
        side,
        color: NEON[i % NEON.length],
        delay: rand(0, 0.45),
        ph: rand(0, Math.PI * 2),
        amp: rand(6, 16),
        spd: rand(0.4, 1.1),
      }
    })

    /* ---- Layer 3: hexagon honeycomb streaming from the bottom-right ---- */
    const COOL = [[69, 94, 137], [46, 111, 149], [23, 128, 161], [0, 145, 173]]
    const HEX_COLS = 9
    const HEX_ROWS = 13
    const hexes = []
    for (let col = 0; col < HEX_COLS; col++) {
      for (let row = 0; row < HEX_ROWS; row++) {
        hexes.push({
          col, row,
          ph: rand(0, Math.PI * 2),
          spd: rand(0.5, 1.2),
          detach: Math.random() < 0.16,
          warm: Math.random() < 0.2,
          color: COOL[Math.floor(Math.random() * COOL.length)],
          jitter: rand(0, 0.18),
        })
      }
    }
    const sparks = Array.from({ length: 80 }, () => ({
      rx: Math.random(),
      ry: Math.random(),
      ph: rand(0, Math.PI * 2),
      spd: rand(1, 3),
      warm: Math.random() < 0.7,
      size: rand(0.6, 1.9),
    }))

    const FOCAL = 900
    const start = performance.now()

    const project = (x, y, z, cx, cy, cosY, sinY, cosT, sinT, yOff) => {
      const x1 = x * cosY - z * sinY
      const z1 = x * sinY + z * cosY
      const y1 = y * cosT - z1 * sinT
      const z2 = y * sinT + z1 * cosT
      // clamp denominator so points behind the camera can't flip the scale
      const s = FOCAL / Math.max(FOCAL + z2, 80)
      return { x: cx + x1 * s, y: cy + y1 * s - yOff, s }
    }

    const draw = (now) => {
      const elapsed = now - start
      const p = Math.min(1, elapsed / DURATION)

      const cx = w / 2
      const cy = h / 2
      const t = elapsed / 1000
      const minDim = Math.min(w, h)
      const scene = minDim * 1.25
      const spanX = minDim * 1.2
      const spanY = minDim * 0.98
      const spread = Math.max(w, h) * 1.7
      const waveAmp = minDim * 0.19
      const yOff = minDim * 0.04

      const tilt = 0.42 + Math.sin(t * 0.18) * 0.06
      const yaw = Math.sin(t * 0.12) * 0.25
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt)
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw)

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'

      /* ===== project + draw the wave grid ===== */
      const G = new Array(grid.length)
      for (let k = 0; k < grid.length; k++) {
        const n = grid[k]
        const lp = easeOutCubic(clamp((p - n.delay) / (1 - n.delay), 0, 1))
        const hx = n.u * spanX
        const hy = n.v * spanY
        const wave =
          Math.sin(n.u * 2.4 + t * 0.9) +
          Math.cos(n.v * 2.0 + t * 0.7) +
          Math.sin((n.u + n.v) * 1.6 + t * 1.1)
        const hz = (wave / 3) * waveAmp * lp
        let sx = hx, sy = hy
        if (n.side === 'top') sy = hy - spread
        else if (n.side === 'bottom') sy = hy + spread
        else if (n.side === 'left') sx = hx - spread
        else sx = hx + spread
        const x = sx + (hx - sx) * lp
        const y = sy + (hy - sy) * lp
        const pr = project(x, y, hz, cx, cy, cosY, sinY, cosT, sinT, yOff)
        G[k] = { ...pr, lp, color: n.color, crest: clamp((wave / 3) * 0.5 + 0.5, 0, 1) }
      }

      // contour ridge lines (rows)
      for (let r = 0; r < ROWS; r++) {
        const col = ramp(r / (ROWS - 1))
        for (let c = 0; c < COLS - 1; c++) {
          const a = G[gIdx(r, c)], b = G[gIdx(r, c + 1)]
          const vis = Math.min(a.lp, b.lp)
          if (vis < 0.05) continue
          const glow = 0.22 + a.crest * 0.6
          ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.55 * vis * glow + 0.06 * vis})`
          ctx.lineWidth = 1.2 * a.s
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      }
      // woven columns
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 1; r++) {
          const a = G[gIdx(r, c)], b = G[gIdx(r + 1, c)]
          const vis = Math.min(a.lp, b.lp)
          if (vis < 0.05) continue
          ctx.strokeStyle = `rgba(${a.color[0]},${a.color[1]},${a.color[2]},${0.08 * vis})`
          ctx.lineWidth = 0.8 * a.s
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      }
      // grid dots
      for (let k = 0; k < G.length; k++) {
        const pt = G[k]
        if (pt.lp < 0.05) continue
        const [rr, gg, bb] = pt.color
        const a = (0.5 + pt.crest * 0.5) * pt.lp
        const sz = Math.max(1, (1.0 + pt.crest * 1.6) * pt.s)
        ctx.fillStyle = `rgba(${rr + 70},${gg + 70},${bb + 70},${a})`
        ctx.fillRect(pt.x - sz / 2, pt.y - sz / 2, sz, sz)
      }

      /* ===== project + draw the floating plexus on top ===== */
      const N = new Array(nodes.length)
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k]
        const lp = easeOutCubic(clamp((p - n.delay) / (1 - n.delay), 0, 1))
        const drift = lp * n.amp
        let hx = n.hx * scene + Math.sin(t * n.spd + n.ph) * drift
        let hy = n.hy * scene + Math.cos(t * n.spd + n.ph) * drift
        const hz = n.hz * 240 * lp
        let sx = hx, sy = hy
        if (n.side === 'top') sy = hy - spread
        else if (n.side === 'bottom') sy = hy + spread
        else if (n.side === 'left') sx = hx - spread
        else sx = hx + spread
        const x = sx + (hx - sx) * lp
        const y = sy + (hy - sy) * lp
        const pr = project(x, y, hz, cx, cy, cosY, sinY, cosT, sinT, yOff)
        N[k] = { ...pr, lp, color: n.color }
      }

      const TH = minDim * 0.24
      const adj = Array.from({ length: N.length }, () => [])
      // plexus edges
      for (let i = 0; i < N.length; i++) {
        for (let j = i + 1; j < N.length; j++) {
          const a = N[i], b = N[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d > TH) continue
          adj[i].push(j)
          const vis = Math.min(a.lp, b.lp)
          const k2 = (1 - d / TH) * vis
          const cr = (a.color[0] + b.color[0]) / 2
          const cg = (a.color[1] + b.color[1]) / 2
          const cb = (a.color[2] + b.color[2]) / 2
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.05 * k2})`
          ctx.lineWidth = 2.6
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          ctx.strokeStyle = `rgba(${cr + 55},${cg + 55},${cb + 55},${0.42 * k2})`
          ctx.lineWidth = 1.1
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      }
      // plexus veils (kept very subtle so they don't blow out to white)
      for (let i = 0; i < N.length; i++) {
        const nb = adj[i]
        for (let m = 0; m < nb.length; m++) {
          for (let o = m + 1; o < nb.length; o++) {
            const j = nb[m], kk = nb[o]
            if (!adj[j].includes(kk)) continue
            const a = N[i], b = N[j], c = N[kk]
            const cr = (a.color[0] + b.color[0] + c.color[0]) / 3
            const cg = (a.color[1] + b.color[1] + c.color[1]) / 3
            const cb = (a.color[2] + b.color[2] + c.color[2]) / 3
            ctx.fillStyle = `rgba(${cr},${cg},${cb},0.03)`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y)
            ctx.closePath(); ctx.fill()
          }
        }
      }
      // plexus nodes
      for (let k = 0; k < N.length; k++) {
        const pt = N[k]
        if (pt.lp < 0.05) continue
        const [rr, gg, bb] = pt.color
        ctx.fillStyle = `rgba(${rr + 70},${gg + 70},${bb + 70},${0.75 * pt.lp})`
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, Math.max(0.6, 1.8 * pt.s), 0, Math.PI * 2)
        ctx.fill()
      }

      /* ===== hexagon honeycomb (bottom-right -> center) ===== */
      const hr = minDim * 0.055
      const stepX = hr * 1.5
      const stepY = hr * Math.sqrt(3)
      const ax = w - hr * 0.7
      const ay = h - hr * 0.7
      const diag = Math.hypot(w, h)

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

      for (const hx of hexes) {
        let x = ax - hx.col * stepX
        let y = ay - hx.row * stepY + (hx.col % 2) * (stepY / 2)
        y += Math.sin(t * hx.spd + hx.ph) * hr * 0.12
        x += Math.cos(t * hx.spd * 0.8 + hx.ph) * hr * 0.08
        // detached cells drift toward the center
        if (hx.detach) {
          const f = 0.35 + 0.4 * Math.sin(t * 0.5 + hx.ph)
          x += (w * 0.5 - x) * 0.14 * f
          y += (h * 0.5 - y) * 0.14 * f
        }
        const dist = Math.hypot(w - x, h - y) / diag
        const appear = clamp((p - dist * 0.5 - hx.jitter) * 2.2, 0, 1)
        const fade = clamp(1 - dist * 1.35, 0, 1)
        const a = fade * appear
        if (a <= 0.02) continue
        const r2 = hr * (1 - dist * 0.35)
        const col = hx.warm ? [242, 149, 89] : hx.color
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.06 * a})`
        ctx.lineWidth = 3.2
        drawHex(x, y, r2); ctx.stroke()
        ctx.strokeStyle = `rgba(${col[0] + 55},${col[1] + 55},${col[2] + 55},${0.5 * a})`
        ctx.lineWidth = 1.1
        drawHex(x, y, r2); ctx.stroke()
      }

      // warm sparks biased to the bottom-right
      for (const sp of sparks) {
        const x = w - sp.rx * w * 0.85
        const y = h - sp.ry * h * 0.9
        const dist = Math.hypot(w - x, h - y) / diag
        const fade = clamp(1 - dist * 1.2, 0, 1)
        const appear = clamp((p - dist * 0.4) * 2, 0, 1)
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * sp.spd + sp.ph))
        const a = fade * appear * tw
        if (a <= 0.02) continue
        const col = sp.warm ? [242, 149, 89] : [242, 212, 146]
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`
        const s = Math.max(0.5, sp.size * (1 - dist * 0.4))
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'

      if (p >= 1 && !exitedRef.current) {
        exitedRef.current = true
        setExiting(true)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (!exiting) return
    const tm = setTimeout(() => onFinish?.(), 1100)
    return () => clearTimeout(tm)
  }, [exiting, onFinish])

  return (
    <div className={`splash${exiting ? ' splash--exit' : ''}`}>
      <canvas ref={canvasRef} className="splash__canvas" />
    </div>
  )
}

export default SplashScreen
