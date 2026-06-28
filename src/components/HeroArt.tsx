/**
 * On-theme hero artwork: a single source image refracts through a prism and
 * disperses into the output formats. Built entirely from SVG so it ships offline
 * and stays crisp at any size. Decorative only.
 */
const OUTPUTS = [
  { label: 'AVIF', tint: 'oklch(0.78 0.2 350)', y: 30 },
  { label: 'WebP', tint: 'oklch(0.75 0.17 300)', y: 78 },
  { label: 'JPG', tint: 'oklch(0.83 0.14 80)', y: 126 },
  { label: 'PNG', tint: 'oklch(0.82 0.13 200)', y: 174 },
  { label: 'HEIC', tint: 'oklch(0.82 0.16 165)', y: 222 },
]

export function HeroArt() {
  return (
    <svg
      viewBox="0 0 440 260"
      className="h-auto w-full"
      role="img"
      aria-label="A source image refracting through a prism into AVIF, WebP, JPG, PNG and HEIC outputs"
    >
      <defs>
        <linearGradient id="oc-src" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.7 0.25 350)" />
          <stop offset="0.5" stopColor="oklch(0.62 0.21 300)" />
          <stop offset="1" stopColor="oklch(0.82 0.13 200)" />
        </linearGradient>
        <linearGradient id="oc-prism" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.97 0.01 290)" stopOpacity="0.9" />
          <stop offset="1" stopColor="oklch(0.7 0.05 290)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* dispersion rays */}
      <g fill="none" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        {OUTPUTS.map((o, i) => (
          <path
            key={o.label}
            d={`M196 130 C 250 130, 250 ${o.y + 17}, 300 ${o.y + 17}`}
            stroke={o.tint}
            strokeDasharray="4 7"
            style={{ animation: `oc-dash ${7 + i}s linear infinite` }}
          />
        ))}
      </g>

      {/* source image tile */}
      <g style={{ transformOrigin: '90px 130px', animation: 'oc-float 7s ease-in-out infinite' }}>
        <rect x="44" y="84" width="92" height="92" rx="14" fill="url(#oc-src)" />
        <rect x="44" y="84" width="92" height="92" rx="14" fill="none" stroke="oklch(1 0 0 / 0.25)" />
        {/* tiny "photo" marks: horizon + sun */}
        <circle cx="72" cy="112" r="9" fill="oklch(1 0 0 / 0.85)" />
        <path d="M52 158 L84 128 L104 148 L128 122 V164 H52 Z" fill="oklch(0.16 0.02 300 / 0.55)" />
      </g>

      {/* prism */}
      <path d="M168 96 L208 130 L168 164 Z" fill="url(#oc-prism)" stroke="oklch(1 0 0 / 0.4)" strokeWidth="1.5" strokeLinejoin="round" />

      {/* output format pills */}
      <g fontFamily="Space Grotesk Variable, monospace" fontSize="13" fontWeight="600">
        {OUTPUTS.map((o) => (
          <g key={o.label} style={{ transformOrigin: `350px ${o.y + 17}px`, animation: 'oc-float 6s ease-in-out infinite' }}>
            <rect
              x="300"
              y={o.y}
              width="92"
              height="34"
              rx="9"
              fill="oklch(0.2 0.016 290)"
              stroke={`color-mix(in oklch, ${o.tint} 50%, transparent)`}
            />
            <circle cx="318" cy={o.y + 17} r="4" fill={o.tint} />
            <text x="332" y={o.y + 22} fill="oklch(0.95 0.01 290)">
              {o.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
