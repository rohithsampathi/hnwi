"use client"

import { useCallback, useMemo } from "react"
import Particles from "react-particles"
import type { Engine } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"
import { useTheme } from "@/contexts/theme-context"

export function ParticlesBackground() {
  const { theme } = useTheme()

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const options = useMemo(() => {
    return {
      fpsLimit: 120,
      particles: {
        color: {
          value: theme === "dark" ? "#42A5F5" : "#1976D2",
        },
        links: {
          color: theme === "dark" ? "#42A5F5" : "#1976D2",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          enable: true,
          direction: "none",
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.1,
            sync: false,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
    }
  }, [theme])

  return <Particles className="absolute inset-0" id="tsparticles" init={particlesInit} options={options} />
}

