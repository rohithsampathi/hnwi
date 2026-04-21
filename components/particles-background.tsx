"use client"

import { memo, useEffect, useRef } from "react"

import { useTheme } from "@/contexts/theme-context"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const MOBILE_BREAKPOINT = 640
const MOBILE_PARTICLE_COUNT = 26
const DESKTOP_PARTICLE_COUNT = 46
const LINK_DISTANCE = 140

function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: 1 + Math.random() * 2.5,
  }))
}

function clampVelocity(value: number): number {
  if (Math.abs(value) < 0.08) {
    return value >= 0 ? 0.08 : -0.08
  }

  return value
}

function ParticlesBackgroundInner() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === "undefined") {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    let animationFrame = 0
    let width = 0
    let height = 0
    let particles: Particle[] = []

    const particleColor = theme === "dark" ? "156, 163, 175" : "75, 85, 99"
    const lineOpacity = theme === "dark" ? 0.28 : 0.18
    const particleOpacity = theme === "dark" ? 0.78 : 0.62

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.scale(dpr, dpr)

      const count = width < MOBILE_BREAKPOINT ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT
      particles = createParticles(width, height, count)
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i]

        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x <= 0 || particle.x >= width) {
          particle.vx = clampVelocity(-particle.vx)
        }

        if (particle.y <= 0 || particle.y >= height) {
          particle.vy = clampVelocity(-particle.vy)
        }

        particle.x = Math.min(Math.max(particle.x, 0), width)
        particle.y = Math.min(Math.max(particle.y, 0), height)

        context.beginPath()
        context.fillStyle = `rgba(${particleColor}, ${particleOpacity})`
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()

        for (let j = i + 1; j < particles.length; j += 1) {
          const neighbor = particles[j]
          const dx = particle.x - neighbor.x
          const dy = particle.y - neighbor.y
          const distance = Math.hypot(dx, dy)

          if (distance > LINK_DISTANCE) {
            continue
          }

          const alpha = (1 - distance / LINK_DISTANCE) * lineOpacity
          context.beginPath()
          context.strokeStyle = `rgba(${particleColor}, ${alpha})`
          context.lineWidth = 1
          context.moveTo(particle.x, particle.y)
          context.lineTo(neighbor.x, neighbor.y)
          context.stroke()
        }
      }

      animationFrame = window.requestAnimationFrame(draw)
    }

    resizeCanvas()
    draw()

    const handleResize = () => {
      window.cancelAnimationFrame(animationFrame)
      resizeCanvas()
      draw()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", handleResize)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  )
}

export const ParticlesBackground = memo(ParticlesBackgroundInner)
ParticlesBackground.displayName = "ParticlesBackground"
