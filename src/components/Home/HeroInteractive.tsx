'use client'

import React, { useEffect, useRef } from 'react'

import { HERO_ICON_CUBE_PATH, HERO_ICON_GRID_PATH, HERO_ICON_VIEWBOX } from './heroIconPaths'

export type HeroMode = 'idle' | 'developer' | 'designer'

type Props = {
  mode: HeroMode
  reducedMotion: boolean
  className?: string
}

const PARTICLE_COUNT = 500
const DAMPING = 0.92
const SPRING = 0.06
/** Thickness of the morphed icon “cloud” (fraction of icon size, px applied in resize). */
const MORPH_GOAL_JITTER = 0.042
/** Golden-ratio spacing along path length so particles don’t line up by index on long edges. */
const PHI = 1.618033988749895

/** Increment when `samplePathNormalized` changes so HMR doesn’t keep stale arrays. */
const ICON_SAMPLE_REVISION = 2
let cachedSampleRev = 0
let cachedDevNorm: { nx: Float32Array; ny: Float32Array } | null = null
let cachedDesNorm: { nx: Float32Array; ny: Float32Array } | null = null

function samplePathNormalized(d: string, count: number, viewBox: number): { nx: Float32Array; ny: Float32Array } {
  const nx = new Float32Array(count)
  const ny = new Float32Array(count)

  const circleFallback = () => {
    for (let i = 0; i < count; i++) {
      const t = (i / Math.max(1, count)) * Math.PI * 2
      nx[i] = 0.5 + 0.32 * Math.cos(t)
      ny[i] = 0.5 + 0.32 * Math.sin(t)
    }
    return { nx, ny }
  }

  if (typeof document === 'undefined') return circleFallback()

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  let len = 0
  try {
    len = path.getTotalLength()
  } catch {
    len = 0
  }
  if (!len || !Number.isFinite(len)) return circleFallback()

  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0 : (i * PHI) % 1
    const dist = u * len
    const p = path.getPointAtLength(dist)
    nx[i] = p.x / viewBox
    ny[i] = p.y / viewBox
  }
  return { nx, ny }
}

function getIconNormSamples(): {
  dev: { nx: Float32Array; ny: Float32Array }
  des: { nx: Float32Array; ny: Float32Array }
} {
  if (cachedSampleRev !== ICON_SAMPLE_REVISION) {
    cachedSampleRev = ICON_SAMPLE_REVISION
    cachedDevNorm = null
    cachedDesNorm = null
  }
  if (!cachedDevNorm) cachedDevNorm = samplePathNormalized(HERO_ICON_GRID_PATH, PARTICLE_COUNT, HERO_ICON_VIEWBOX)
  if (!cachedDesNorm) cachedDesNorm = samplePathNormalized(HERO_ICON_CUBE_PATH, PARTICLE_COUNT, HERO_ICON_VIEWBOX)
  return { dev: cachedDevNorm, des: cachedDesNorm }
}

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
    const goalDesX = new Float32Array(PARTICLE_COUNT)
    const goalDesY = new Float32Array(PARTICLE_COUNT)
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
      const innerW = cssW - pad * 2
      const innerH = cssH - pad * 2
      const iconSize = Math.min(innerW, innerH) * 0.72
      const ox = pad + (innerW - iconSize) / 2
      const oy = pad + (innerH - iconSize) / 2

      const { dev, des } = getIconNormSamples()
      const jMag = iconSize * MORPH_GOAL_JITTER
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ph = phase[i]!
        const jx = Math.sin(ph * 4.2 + i * 0.17) * jMag
        const jy = Math.cos(ph * 3.1 + i * 0.19) * jMag
        const jx2 = Math.sin(ph * 3.8 + i * 0.21) * jMag
        const jy2 = Math.cos(ph * 4.4 + i * 0.15) * jMag
        goalDevX[i] = ox + dev.nx[i]! * iconSize + jx
        goalDevY[i] = oy + dev.ny[i]! * iconSize + jy
        goalDesX[i] = ox + des.nx[i]! * iconSize + jx2
        goalDesY[i] = oy + des.ny[i]! * iconSize + jy2
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
          const dx = goalDevX[i]! - x[i]!
          const dy = goalDevY[i]! - y[i]!
          fx += wd * dx * SPRING * 1.05
          fy += wd * dy * SPRING * 1.05
          if (!reducedRef.current && wd > 0.35) {
            const shimmer = 0.22 * clamp01((wd - 0.35) / 0.65)
            fx += wd * Math.sin(time * 2.1 + phase[i]! * 3) * shimmer
            fy += wd * Math.cos(time * 1.85 + phase[i]! * 2.6) * shimmer
          }
        }

        if (ws > 0.01) {
          const dx = goalDesX[i]! - x[i]!
          const dy = goalDesY[i]! - y[i]!
          fx += ws * dx * SPRING * 1.05
          fy += ws * dy * SPRING * 1.05
          if (!reducedRef.current && ws > 0.35) {
            const shimmer = 0.22 * clamp01((ws - 0.35) / 0.65)
            fx += ws * Math.sin(time * 2.05 + phase[i]! * 2.9) * shimmer
            fy += ws * Math.cos(time * 1.9 + phase[i]! * 2.5) * shimmer
          }
        }

        const wm = Math.max(wd, ws)
        if (wm > 0.12 && !reducedRef.current) {
          const breathe = 0.08 * wm
          fx += Math.sin(time * 1.6 + phase[i]! * 2.4) * breathe
          fy += Math.cos(time * 1.45 + phase[i]! * 2.1) * breathe
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

      const { fg, accent } = colors
      const glowT = Math.max(ws, wd)
      const iconGlow = glowT > 0.35

      if (iconGlow) {
        c2d.save()
        c2d.shadowColor = `rgba(${accent.r},${accent.g},${accent.b},${0.42 * clamp01(glowT)})`
        c2d.shadowBlur = 14 * glowT
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const px = x[i]!
        const py = y[i]!
        let r = 1.35 + wi * 0.35 + wd * 0.25 + ws * 0.85
        let cr = fg.r
        let cg = fg.g
        let cb = fg.b
        let a = 0.35 + wi * 0.25 + wd * 0.35 + ws * 0.35

        let accentMix = 0
        if (ws > 0.2) accentMix = Math.max(accentMix, clamp01((ws - 0.2) / 0.8))
        if (wd > 0.2) accentMix = Math.max(accentMix, clamp01((wd - 0.2) / 0.8))
        if (accentMix > 0) {
          cr = Math.round(fg.r + (accent.r - fg.r) * accentMix * 0.85)
          cg = Math.round(fg.g + (accent.g - fg.g) * accentMix * 0.85)
          cb = Math.round(fg.b + (accent.b - fg.b) * accentMix * 0.85)
          a = Math.min(1, a + accentMix * 0.45)
        }

        c2d.fillStyle = `rgba(${cr},${cg},${cb},${a})`
        c2d.beginPath()
        c2d.arc(px, py, r, 0, Math.PI * 2)
        c2d.fill()
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
    }
  }, [])

  return (
    <div className={className} aria-hidden>
      <canvas ref={canvasRef} className="home-hero__canvas" />
    </div>
  )
}
