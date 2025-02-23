import type React from "react"

const createGradientBackground = (color1: string, color2: string) => `
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
`

const createOverlay = () => `
  <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)" />
`

export const LuxuryApartmentsSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#1a237e", "#4a148c")}
    {createOverlay()}
    <path d="M0 80 L150 0 L300 80 L300 200 L0 200 Z" fill="rgba(255,255,255,0.1)" />
    <path d="M50 120 L100 90 L150 120 L150 200 L50 200 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M200 150 L250 120 L300 150 L300 200 L200 200 Z" fill="rgba(255,255,255,0.15)" />
  </svg>
)

export const LuxuryYachtSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#01579b", "#0277bd")}
    {createOverlay()}
    <path d="M0 150 Q150 100 300 150 L300 200 L0 200 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M0 180 Q150 130 300 180 L300 200 L0 200 Z" fill="rgba(255,255,255,0.1)" />
    <circle cx="250" cy="50" r="20" fill="rgba(255,255,255,0.3)" />
  </svg>
)

export const PrivateJetSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#263238", "#455a64")}
    {createOverlay()}
    <path d="M50 100 L100 50 L250 50 L300 100 L250 150 L100 150 Z" fill="rgba(255,255,255,0.1)" />
    <path d="M0 180 L300 180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
    <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.3)" />
    <circle cx="250" cy="50" r="10" fill="rgba(255,255,255,0.3)" />
  </svg>
)

export const ArtCollectionSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#4a148c", "#6a1b9a")}
    {createOverlay()}
    <rect x="50" y="50" width="80" height="100" fill="rgba(255,255,255,0.2)" />
    <rect x="170" y="70" width="60" height="80" fill="rgba(255,255,255,0.15)" />
    <circle cx="150" cy="100" r="30" fill="rgba(255,255,255,0.1)" />
  </svg>
)

export const LuxuryVillaSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#4a148c", "#7b1fa2")}
    {createOverlay()}
    <path d="M50 100 L150 50 L250 100 L250 180 L50 180 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M100 180 L100 130 L150 100 L200 130 L200 180 Z" fill="rgba(255,255,255,0.1)" />
    <path d="M120 180 L120 140 L150 120 L180 140 L180 180 Z" fill="rgba(255,255,255,0.15)" />
  </svg>
)

export const UltraLuxuryEstateSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#880e4f", "#ad1457")}
    {createOverlay()}
    <path d="M30 100 L150 30 L270 100 L270 180 L30 180 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M60 180 L60 120 L150 70 L240 120 L240 180 Z" fill="rgba(255,255,255,0.1)" />
    <path d="M90 180 L90 140 L150 100 L210 140 L210 180 Z" fill="rgba(255,255,255,0.15)" />
    <circle cx="150" cy="60" r="20" fill="rgba(255,255,255,0.3)" />
  </svg>
)

export const CommercialLuxuryTowerSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#0d47a1", "#1565c0")}
    {createOverlay()}
    <path d="M100 180 L100 50 L200 30 L200 180 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M120 180 L120 70 L180 55 L180 180 Z" fill="rgba(255,255,255,0.1)" />
    <path d="M140 180 L140 90 L160 80 L160 180 Z" fill="rgba(255,255,255,0.15)" />
  </svg>
)

export const LuxuryCarSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#b71c1c", "#c62828")}
    {createOverlay()}
    <path d="M50 140 Q150 180 250 140 L230 110 Q150 80 70 110 Z" fill="rgba(255,255,255,0.2)" />
    <circle cx="90" cy="140" r="20" fill="rgba(255,255,255,0.1)" />
    <circle cx="210" cy="140" r="20" fill="rgba(255,255,255,0.1)" />
  </svg>
)

export const HypercarSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#1a237e", "#283593")}
    {createOverlay()}
    <path d="M30 140 Q150 200 270 140 L250 100 Q150 60 50 100 Z" fill="rgba(255,255,255,0.2)" />
    <circle cx="80" cy="140" r="25" fill="rgba(255,255,255,0.1)" />
    <circle cx="220" cy="140" r="25" fill="rgba(255,255,255,0.1)" />
  </svg>
)

export const LuxuryWatchSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#004d40", "#00695c")}
    {createOverlay()}
    <circle cx="150" cy="100" r="60" fill="rgba(255,255,255,0.2)" />
    <circle cx="150" cy="100" r="50" fill="rgba(255,255,255,0.1)" />
    <path d="M150 60 L155 100 L150 105 L145 100 Z" fill="rgba(255,255,255,0.3)" />
  </svg>
)

export const GlobalRetreatSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#1b5e20", "#2e7d32")}
    {createOverlay()}
    <circle cx="150" cy="100" r="70" fill="rgba(255,255,255,0.2)" />
    <path d="M110 140 Q150 180 190 140 Q150 100 110 140" fill="rgba(255,255,255,0.1)" />
    <path d="M150 100 L150 40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    <circle cx="150" cy="40" r="5" fill="rgba(255,255,255,0.3)" />
  </svg>
)

export const PrivateArtCollectionSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#311b92", "#4527a0")}
    {createOverlay()}
    <rect x="70" y="60" width="70" height="100" fill="rgba(255,255,255,0.2)" />
    <rect x="160" y="80" width="70" height="80" fill="rgba(255,255,255,0.15)" />
    <circle cx="200" cy="70" r="30" fill="rgba(255,255,255,0.1)" />
  </svg>
)

export const BespokeInvestmentFundSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#006064", "#00838f")}
    {createOverlay()}
    <path d="M50 150 L100 70 L150 120 L200 50 L250 100" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
    <circle cx="100" cy="70" r="10" fill="rgba(255,255,255,0.2)" />
    <circle cx="150" cy="120" r="10" fill="rgba(255,255,255,0.2)" />
    <circle cx="200" cy="50" r="10" fill="rgba(255,255,255,0.2)" />
  </svg>
)

export const PrivateIslandSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" {...props}>
    {createGradientBackground("#01579b", "#0277bd")}
    {createOverlay()}
    <path d="M50 150 Q150 50 250 150" fill="rgba(255,255,255,0.2)" />
    <path d="M100 150 Q150 100 200 150" fill="rgba(255,255,255,0.15)" />
    <circle cx="150" cy="110" r="20" fill="rgba(255,255,255,0.1)" />
    <path d="M140 95 L150 70 L160 95" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
  </svg>
)

