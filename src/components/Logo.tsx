export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="oc-logo" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.19 322)" />
          <stop offset="0.55" stopColor="oklch(0.7 0.25 350)" />
          <stop offset="1" stopColor="oklch(0.82 0.13 200)" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="9" fill="oklch(0.2 0.016 290)" stroke="oklch(1 0 0 / 0.1)" />
      {/* aperture / prism: a source square refracting into a triangle of light */}
      <path d="M16 7 L24 22 H8 Z" stroke="url(#oc-logo)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="17" r="3.4" fill="url(#oc-logo)" />
    </svg>
  )
}
