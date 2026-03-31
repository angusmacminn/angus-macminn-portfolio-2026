'use client'

import React, { useEffect, useRef } from 'react'

export type HeroMode = 'idle' | 'developer' | 'designer'

type Props = {
  mode: HeroMode
  reducedMotion: boolean
  className?: string
}

const PARTICLE_COUNT = 200
const COLS = 20
const ROWS = 10
const DAMPING = 0.92
const SPRING = 0.06

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
    const gx = new Float32Array(PARTICLE_COUNT)
    const gy = new Float32Array(PARTICLE_COUNT)
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

    function readThemeColors(canvasNode: HTMLCanvasElement) {
      const root = canvasNode.closest('.home-hero') || document.documentElement
      const cs = getComputedStyle(root as Element)
      const fg = parseCssColor(cs.getPropertyValue('--foreground')) || { r: 30, g: 30, b: 30 }
      const accent = parseCssColor(cs.getPropertyValue('--primary-green')) || { r: 47, g: 253, b: 123 }
      const muted = parseCssColor(cs.getPropertyValue('--muted-foreground')) || { r: 112, g: 112, b: 122 }
      return { fg, accent, muted }
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
      const gw = cssW - pad * 2
      const gh = cssH - pad * 2
      let idx = 0
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (idx >= PARTICLE_COUNT) break
          gx[idx] = pad + (col / (COLS - 1)) * gw
          gy[idx] = pad + (row / (ROWS - 1)) * gh
          idx++
        }
      }
      while (idx < PARTICLE_COUNT) {
        gx[idx] = pad + (Math.random() * gw || 0)
        gy[idx] = pad + (Math.random() * gh || 0)
        idx++
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (x[i] === 0 && y[i] === 0) {
          x[i] = gx[i] + (Math.random() - 0.5) * 40
          y[i] = gy[i] + (Math.random() - 0.5) * 40
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

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ax = anchorX[i]!
        const ay = anchorY[i]!
        const cx = cssW * 0.5 + (ax - 0.5) * cssW * 0.55
        const cy = cssH * 0.5 + (ay - 0.5) * cssH * 0.55

        let fx = 0
        let fy = 0

        if (wi > 0.01) {
          const rm = reducedRef.current ? 0.12 : 1
          const n = Math.sin(time * 0.7 + phase[i]! * 3) * Math.cos(time * 0.5 + phase[i]! * 2)
          const n2 = Math.cos(time * 0.55 + i * 0.1)
          fx += wi * n * 0.35 * rm
          fy += wi * n2 * 0.35 * rm
          const dx = cx - x[i]!
          const dy = cy - y[i]!
          fx += wi * dx * 0.012 * (rm < 1 ? 1.8 : 1)
          fy += wi * dy * 0.012 * (rm < 1 ? 1.8 : 1)
        }

        if (wd > 0.01) {
          const dx = gx[i]! - x[i]!
          const dy = gy[i]! - y[i]!
          fx += wd * dx * SPRING * 1.15
          fy += wd * dy * SPRING * 1.15
        }

        if (ws > 0.01) {
          const amp = 22 + Math.sin(time + phase[i]!) * 8
          const ox = Math.sin(time * 2.2 + phase[i]! * 4) * amp
          const oy = Math.cos(time * 1.8 + phase[i]! * 3.7) * amp
          const tx = gx[i]! + ox
          const ty = gy[i]! + oy
          const dx = tx - x[i]!
          const dy = ty - y[i]!
          fx += ws * dx * SPRING * 0.85
          fy += ws * dy * SPRING * 0.85
          const burst = Math.sin(time * 4 + i) * 0.6
          fx += ws * burst
          fy += ws * Math.cos(time * 3.5 + i * 0.2) * 0.6
        }

        vx[i]! += fx * (dt / 16)
        vy[i]! += fy * (dt / 16)
        vx[i]! *= DAMPING
        vy[i]! *= DAMPING
        x[i]! += vx[i]! * (dt / 16)
        y[i]! += vy[i]! * (dt / 16)
        x[i]! = clamp01(x[i]! / cssW) * cssW
        y[i]! = clamp01(y[i]! / cssH) * cssH
      }

      c2d.clearRect(0, 0, cssW, cssH)

      const { fg, accent, muted } = colors
      const designerGlow = ws > 0.35

      if (designerGlow) {
        c2d.save()
        c2d.shadowColor = `rgba(${accent.r},${accent.g},${accent.b},${0.42 * clamp01(ws)})`
        c2d.shadowBlur = 14 * ws
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const px = x[i]!
        const py = y[i]!
        let r = 1.35 + wi * 0.35 + wd * 0.25 + ws * 0.85
        let cr = fg.r
        let cg = fg.g
        let cb = fg.b
        let a = 0.35 + wi * 0.25 + wd * 0.35 + ws * 0.35

        if (ws > 0.2) {
          const mix = clamp01((ws - 0.2) / 0.8)
          cr = Math.round(fg.r + (accent.r - fg.r) * mix * 0.85)
          cg = Math.round(fg.g + (accent.g - fg.g) * mix * 0.85)
          cb = Math.round(fg.b + (accent.b - fg.b) * mix * 0.85)
          a = Math.min(1, a + mix * 0.45)
        } else if (wd > 0.6) {
          const mix = (wd - 0.6) / 0.4
          cr = Math.round(fg.r + (muted.r - fg.r) * mix * 0.4)
          cg = Math.round(fg.g + (muted.g - fg.g) * mix * 0.4)
          cb = Math.round(fg.b + (muted.b - fg.b) * mix * 0.4)
        }

        c2d.fillStyle = `rgba(${cr},${cg},${cb},${a})`
        c2d.beginPath()
        c2d.arc(px, py, r, 0, Math.PI * 2)
        c2d.fill()
      }

      if (designerGlow) {
        c2d.restore()
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <div className={className} aria-hidden>
      <canvas ref={canvasRef} className="home-hero__canvas" />
    </div>
  )
}
