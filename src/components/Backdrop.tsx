const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

/** Fixed, non-interactive atmosphere: colored light auras, an engineering grid
 *  fading out toward the edges, and a faint film grain. */
export function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="bg-grid absolute inset-0"
        style={{
          maskImage: 'radial-gradient(120% 80% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(120% 80% at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      <div
        className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
        style={{ background: 'radial-gradient(circle, oklch(0.62 0.21 300 / 0.5), transparent 65%)', animation: 'oc-drift 18s ease-in-out infinite' }}
      />
      <div
        className="absolute -left-32 top-40 h-[34rem] w-[34rem] rounded-full opacity-40 blur-[120px]"
        style={{ background: 'radial-gradient(circle, oklch(0.7 0.25 350 / 0.45), transparent 65%)', animation: 'oc-drift 22s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute -right-40 top-24 h-[32rem] w-[32rem] rounded-full opacity-35 blur-[130px]"
        style={{ background: 'radial-gradient(circle, oklch(0.82 0.13 200 / 0.4), transparent 65%)', animation: 'oc-drift 26s ease-in-out infinite' }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{ backgroundImage: `url("${GRAIN}")` }}
      />
    </div>
  )
}
