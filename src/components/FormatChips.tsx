/** Per-format accent hues — a deliberate small palette, not one flat accent. */
export const FORMAT_TINT: Record<string, string> = {
  HEIC: 'oklch(0.82 0.16 165)',
  JPEG: 'oklch(0.83 0.14 80)',
  JPG: 'oklch(0.83 0.14 80)',
  PNG: 'oklch(0.82 0.13 200)',
  WebP: 'oklch(0.75 0.17 300)',
  AVIF: 'oklch(0.78 0.2 350)',
  GIF: 'oklch(0.8 0.12 230)',
  BMP: 'oklch(0.78 0.05 286)',
}

export function FormatChips({
  formats,
  className = '',
}: {
  formats: string[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {formats.map((f) => {
        const tint = FORMAT_TINT[f] ?? 'oklch(0.75 0.02 286)'
        return (
          <span
            key={f}
            className="rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide"
            style={{
              color: tint,
              background: `color-mix(in oklch, ${tint} 14%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${tint} 30%, transparent)`,
            }}
          >
            {f}
          </span>
        )
      })}
    </div>
  )
}
