'use client'

import React, { useEffect, useRef } from 'react'

export type HeroMode = 'idle' | 'developer' | 'designer'

type Props = {
  mode: HeroMode
  reducedMotion: boolean
  className?: string
}

const PARTICLE_COUNT = 506
const DAMPING = 0.92
const SPRING = 0.06

/** Developer mode: tighter spring toward grid cells, and extra velocity damping for a crisp snap. */
const DEV_SPRING_MULT = 1.9
const DEV_EXTRA_DAMPING = 0.88

/** Designer mode: flow field strength (peak px/frame of push from the field). */
const FLOW_FORCE = 0.35
/** Spatial scale of the primary noise octave. Larger = more, smaller eddies. */
const FLOW_SCALE = 0.016
/** Ratio of the second octave's spatial frequency to the first. */
const FLOW_OCTAVE_RATIO = 2.1
/** Amplitude of the second octave (relative to first). */
const FLOW_OCTAVE_AMP = 0.55
/** Temporal drift of the noise field. Lower = slower-evolving swirl. */
const FLOW_TIME = 0.15
/** Soft boundary repulsion (flow mode) so particles don't hug the canvas edges. */
const FLOW_BORDER_STRENGTH = 0.03
/** Trail fade alpha at peak designer weight. Lower = longer trails. */
const FLOW_TRAIL_ALPHA = 0.28
/** Idle mode: gentle pull toward cursor position, even outside canvas bounds. */
const CURSOR_ATTRACT_STRENGTH = 0.56
/** Distance scale for cursor attraction falloff. */
const CURSOR_ATTRACT_RADIUS = 0.7

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function parseCssColor(css: string): { r: number; g: number; b: number } | null {
  const s = css.trim()
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]!
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const n = parseInt(h, 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (rgb) {
    return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]! }
  }
  return null
}

export function HeroInteractive({ mode, reducedMotion, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)
  const reducedRef = useRef(reducedMotion)
  modeRef.current = mode
  reducedRef.current = reducedMotion

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const ctx = canvasEl.getContext('2d', { alpha: true })
    if (!ctx) return
    const c2d = ctx

    let raf = 0
    let running = true
    const wIdle = { v: 1 }
    const wDev = { v: 0 }
    const wDes = { v: 0 }

    const x = new Float32Array(PARTICLE_COUNT)
    const y = new Float32Array(PARTICLE_COUNT)
    const vx = new Float32Array(PARTICLE_COUNT)
    const vy = new Float32Array(PARTICLE_COUNT)
    const goalDevX = new Float32Array(PARTICLE_COUNT)
    const goalDevY = new Float32Array(PARTICLE_COUNT)
    const phase = new Float32Array(PARTICLE_COUNT)
    const anchorX = new Float32Array(PARTICLE_COUNT)
    const anchorY = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phase[i] = Math.random() * Math.PI * 2
      anchorX[i] = Math.random()
      anchorY[i] = Math.random()
    }

    let dpr = 1
    let cssW = 0
    let cssH = 0
    let cursorX = 0
    let cursorY = 0
    let cursorActive = false

    function readThemeColors(canvasNode: HTMLCanvasElement) {
      const root = canvasNode.closest('.home-hero') || document.documentElement
      const cs = getComputedStyle(root as Element)
      const fg = parseCssColor(cs.getPropertyValue('--foreground')) || { r: 30, g: 30, b: 30 }
      const accent = parseCssColor(cs.getPropertyValue('--primary-green')) || { r: 47, g: 253, b: 123 }
      return { fg, accent }
    }

    let colors = readThemeColors(canvasEl)

    function resize() {
      const node = canvasRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      cssW = rect.width
      cssH = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      node.width = Math.max(1, Math.floor(cssW * dpr))
      node.height = Math.max(1, Math.floor(cssH * dpr))
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pad = Math.min(cssW, cssH) * 0.08
      const innerW = Math.max(1, cssW - pad * 2)
      const innerH = Math.max(1, cssH - pad * 2)

      // Grid dimensioned by aspect so cells stay roughly square.
      const aspect = innerW / innerH
      const gridCols = Math.max(4, Math.round(Math.sqrt(PARTICLE_COUNT * aspect)))
      const gridRows = Math.max(4, Math.ceil(PARTICLE_COUNT / gridCols))
      const cellW = innerW / gridCols
      const cellH = innerH / gridRows
      const gx0 = pad + cellW * 0.5
      const gy0 = pad + cellH * 0.5

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const col = i % gridCols
        const row = Math.floor(i / gridCols) % gridRows
        goalDevX[i] = gx0 + col * cellW
        goalDevY[i] = gy0 + row * cellH
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (x[i] === 0 && y[i] === 0) {
          const cx = cssW * 0.5 + (anchorX[i]! - 0.5) * cssW * 0.55
          const cy = cssH * 0.5 + (anchorY[i]! - 0.5) * cssH * 0.55
          x[i] = cx + (Math.random() - 0.5) * 40
          y[i] = cy + (Math.random() - 0.5) * 40
        } else {
          x[i] = clamp01(x[i] / (cssW || 1)) * cssW
          y[i] = clamp01(y[i] / (cssH || 1)) * cssH
        }
      }
      colors = readThemeColors(node)
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(canvasEl)
    resize()

    const io = new IntersectionObserver(
      (entries) => {
        running = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0.05 },
    )
    io.observe(canvasEl)

    function handlePointerMove(e: PointerEvent) {
      const rect = canvasEl!.getBoundingClientRect()
      cursorX = e.clientX - rect.left
      cursorY = e.clientY - rect.top
      cursorActive = true
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    let last = performance.now()
    let themeTick = 0

    function lerpWeights(dt: number) {
      const t = modeRef.current
      const rm = reducedRef.current
      let ti = 0
      let td = 0
      let ts = 0
      if (rm) {
        ti = 1
      } else if (t === 'idle') {
        ti = 1
      } else if (t === 'developer') {
        td = 1
      } else {
        ts = 1
      }
      const speed = 3.5
      const k = 1 - Math.exp(-speed * (dt / 1000))
      wIdle.v += (ti - wIdle.v) * k
      wDev.v += (td - wDev.v) * k
      wDes.v += (ts - wDes.v) * k
      const sum = wIdle.v + wDev.v + wDes.v || 1
      wIdle.v /= sum
      wDev.v /= sum
      wDes.v /= sum
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick)
      if (!running || cssW < 2 || cssH < 2) {
        last = now
        return
      }
      const dt = Math.min(32, now - last)
      last = now
      themeTick += dt
      if (themeTick > 800) {
        themeTick = 0
        const node = canvasRef.current
        if (node) colors = readThemeColors(node)
      }

      lerpWeights(dt)

      const time = now * 0.001
      const wi = wIdle.v
      const wd = wDev.v
      const ws = wDes.v
      const ft = time * FLOW_TIME
      const fs = FLOW_SCALE
      const borderMargin = Math.min(cssW, cssH) * 0.12
      const attractRadius = Math.max(1, Math.min(cssW, cssH) * CURSOR_ATTRACT_RADIUS)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ax = anchorX[i]!
        const ay = anchorY[i]!
        const ix = cssW * 0.5 + (ax - 0.5) * cssW * 0.55
        const iy = cssH * 0.5 + (ay - 0.5) * cssH * 0.55

        let fx = 0
        let fy = 0

        if (wi > 0.01) {
          const rm = reducedRef.current ? 0.12 : 1
          const n = Math.sin(time * 0.7 + phase[i]! * 3) * Math.cos(time * 0.5 + phase[i]! * 2)
          const n2 = Math.cos(time * 0.55 + i * 0.1)
          fx += wi * n * 0.35 * rm
          fy += wi * n2 * 0.35 * rm
          const dx = ix - x[i]!
          const dy = iy - y[i]!
          fx += wi * dx * 0.012 * (rm < 1 ? 1.8 : 1)
          fy += wi * dy * 0.012 * (rm < 1 ? 1.8 : 1)

          if (cursorActive) {
            const cdx = cursorX - x[i]!
            const cdy = cursorY - y[i]!
            const dist = Math.hypot(cdx, cdy)
            const falloff = 1 / (1 + dist / attractRadius)
            const invDist = 1 / Math.max(1, dist)
            const pull = wi * CURSOR_ATTRACT_STRENGTH * falloff * rm
            fx += cdx * invDist * pull
            fy += cdy * invDist * pull
          }
        }

        // Developer: crisp spring into grid cell. No jitter, no shimmer.
        if (wd > 0.01) {
          const dx = goalDevX[i]! - x[i]!
          const dy = goalDevY[i]! - y[i]!
          fx += wd * dx * SPRING * DEV_SPRING_MULT
          fy += wd * dy * SPRING * DEV_SPRING_MULT
        }

        // Designer: sum of two curl-of-scalar fields at different scales. Each curl is
        // divergence-free (no attractors → no clumping), and because the two octaves have
        // different conserved scalars, no single quantity is conserved along a trajectory —
        // so particles mix across contours instead of locking onto one orbit.
        if (ws > 0.01) {
          const X1 = x[i]! * fs + ft
          const Y1 = y[i]! * fs + ft * 1.3
          const X2 = x[i]! * fs * FLOW_OCTAVE_RATIO + ft * 1.4 + 1.7
          const Y2 = y[i]! * fs * FLOW_OCTAVE_RATIO + ft * 1.1 + 0.9

          // curl of sin(X)*cos(Y) = ( -sin(X)*sin(Y), -cos(X)*cos(Y) )  (s factor absorbed into FLOW_FORCE)
          const k = FLOW_OCTAVE_AMP * FLOW_OCTAVE_RATIO
          const curlX = -Math.sin(X1) * Math.sin(Y1) - k * Math.sin(X2) * Math.sin(Y2)
          const curlY = -Math.cos(X1) * Math.cos(Y1) - k * Math.cos(X2) * Math.cos(Y2)

          fx += ws * curlX * FLOW_FORCE
          fy += ws * curlY * FLOW_FORCE

          // Soft border push: ramps up as particles approach the edges.
          const leftOver = borderMargin - x[i]!
          const rightOver = x[i]! - (cssW - borderMargin)
          const topOver = borderMargin - y[i]!
          const botOver = y[i]! - (cssH - borderMargin)
          if (leftOver > 0) fx += ws * leftOver * FLOW_BORDER_STRENGTH
          else if (rightOver > 0) fx -= ws * rightOver * FLOW_BORDER_STRENGTH
          if (topOver > 0) fy += ws * topOver * FLOW_BORDER_STRENGTH
          else if (botOver > 0) fy -= ws * botOver * FLOW_BORDER_STRENGTH
        }

        vx[i]! += fx * (dt / 16)
        vy[i]! += fy * (dt / 16)

        // Base damping, plus extra damping in developer mode so the grid "locks in."
        const damping = DAMPING * (1 - wd) + DEV_EXTRA_DAMPING * wd
        vx[i]! *= damping
        vy[i]! *= damping

        x[i]! += vx[i]! * (dt / 16)
        y[i]! += vy[i]! * (dt / 16)
        x[i]! = clamp01(x[i]! / cssW) * cssW
        y[i]! = clamp01(y[i]! / cssH) * cssH
      }

      // Frame fade. In designer mode we fade-erase to leave trails; otherwise fully clear.
      if (ws > 0.05) {
        const fadeA = 1 - (1 - FLOW_TRAIL_ALPHA) * clamp01(ws)
        c2d.save()
        c2d.globalCompositeOperation = 'destination-out'
        c2d.fillStyle = `rgba(0,0,0,${fadeA})`
        c2d.fillRect(0, 0, cssW, cssH)
        c2d.restore()
      } else {
        c2d.clearRect(0, 0, cssW, cssH)
      }

      const { fg, accent } = colors
      const glowT = Math.max(ws, wd)
      const iconGlow = glowT > 0.35

      if (iconGlow) {
        c2d.save()
        c2d.shadowColor = `rgba(${accent.r},${accent.g},${accent.b},${0.42 * clamp01(glowT)})`
        c2d.shadowBlur = 14 * glowT
      }

      // Choose render style based on dominant mode. Dev = crisp squares; others = circles.
      const squareMode = wd > 0.55 && wd > ws

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const px = x[i]!
        const py = y[i]!
        let r = 1.35 + wi * 0.35 + wd * 0.2 + ws * 0.95
        let cr = fg.r
        let cg = fg.g
        let cb = fg.b
        let a = 0.35 + wi * 0.25 + wd * 0.4 + ws * 0.35

        const accentMix = Math.max(
          ws > 0.2 ? clamp01((ws - 0.2) / 0.8) : 0,
          wd > 0.2 ? clamp01((wd - 0.2) / 0.8) : 0,
        )
        if (accentMix > 0) {
          cr = Math.round(fg.r + (accent.r - fg.r) * accentMix * 0.85)
          cg = Math.round(fg.g + (accent.g - fg.g) * accentMix * 0.85)
          cb = Math.round(fg.b + (accent.b - fg.b) * accentMix * 0.85)
          a = Math.min(1, a + accentMix * 0.45)
        }

        c2d.fillStyle = `rgba(${cr},${cg},${cb},${a})`
        if (squareMode) {
          const s = r * 1.55
          c2d.fillRect(px - s * 0.5, py - s * 0.5, s, s)
        } else {
          c2d.beginPath()
          c2d.arc(px, py, r, 0, Math.PI * 2)
          c2d.fill()
        }
      }

      if (iconGlow) {
        c2d.restore()
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <div className={className} aria-hidden>
      <canvas ref={canvasRef} className="home-hero__canvas" />
    </div>
  )
}
