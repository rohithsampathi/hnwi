const COVER_PALETTES: ReadonlyArray<readonly [string, string, string]> = [
  ['#0f172a', '#3b2f1d', '#f4d58d'],
  ['#111827', '#1f3a5f', '#93c5fd'],
  ['#2a1636', '#5b2333', '#f9a8d4'],
  ['#1f2937', '#3f6212', '#bef264'],
  ['#1e293b', '#7c2d12', '#fdba74'],
  ['#172554', '#312e81', '#c4b5fd'],
]

function selectPalette(seed: string): readonly [string, string, string] {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return COVER_PALETTES[total % COVER_PALETTES.length]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function wrapTitle(title: string): [string, string] {
  const words = title.split(/\s+/).filter(Boolean)
  const midpoint = Math.ceil(words.length / 2)
  return [
    escapeXml(words.slice(0, midpoint).join(' ')),
    escapeXml(words.slice(midpoint).join(' ')),
  ]
}

export function createLabeledCoverImage(options: {
  seed: string
  title: string
  label: string
  width?: number
  height?: number
  footer?: string
}): string {
  const {
    seed,
    title,
    label,
    width = 1200,
    height = 720,
    footer = 'HNWI CHRONICLES',
  } = options
  const [bgStart, bgEnd, accent] = selectPalette(seed)
  const [lineOne, lineTwo] = wrapTitle(title)
  const safeLabel = escapeXml(label.toUpperCase())
  const safeFooter = escapeXml(footer.toUpperCase())

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgStart}" />
          <stop offset="100%" stop-color="${bgEnd}" />
        </linearGradient>
        <radialGradient id="glow" cx="82%" cy="18%" r="60%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.55" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect width="${width}" height="${height}" fill="url(#glow)" />
      <rect x="58" y="58" width="${width - 116}" height="${height - 116}" rx="30" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <text x="88" y="128" fill="${accent}" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" letter-spacing="5">
        ${safeLabel}
      </text>
      <text x="88" y="308" fill="#f8fafc" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="700">
        <tspan x="88" dy="0">${lineOne}</tspan>
        ${lineTwo ? `<tspan x="88" dy="84">${lineTwo}</tspan>` : ''}
      </text>
      <rect x="88" y="${height - 160}" width="160" height="8" rx="4" fill="${accent}" opacity="0.9" />
      <text x="88" y="620" fill="rgba(248,250,252,0.82)" font-family="system-ui, sans-serif" font-size="24" letter-spacing="2">
        ${safeFooter}
      </text>
    </svg>
  `.replace(/\s+/g, ' ').trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function createPlaybookCoverImage(
  id: string,
  title: string,
  industry: string,
): string {
  return createLabeledCoverImage({
    seed: `${id}:${industry}`,
    title,
    label: industry,
    footer: 'HNWI CHRONICLES PLAYBOOK',
  })
}
