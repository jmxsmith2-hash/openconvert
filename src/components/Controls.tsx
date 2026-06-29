import { useState, type CSSProperties, type ReactNode } from 'react'
import { FORMAT_META, OUTPUT_FORMATS } from '../lib/format'
import type { ConvertOptions, OutputFormat } from '../lib/types'
import { FORMAT_TINT } from './FormatChips'

const RESIZE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Original size', value: null },
  { label: 'Max 3840 px', value: 3840 },
  { label: 'Max 2560 px', value: 2560 },
  { label: 'Max 1920 px', value: 1920 },
  { label: 'Max 1280 px', value: 1280 },
  { label: 'Max 800 px', value: 800 },
]

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-mute">{children}</p>
)

const factorFor = (u: 'KB' | 'MB') => (u === 'MB' ? 1024 * 1024 : 1024)

function ModeToggle({
  target,
  onQuality,
  onTarget,
  disabled,
}: {
  target: boolean
  onQuality: () => void
  onTarget: () => void
  disabled: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] p-1">
      {[
        { label: 'Quality', active: !target, onClick: onQuality },
        { label: 'Target size', active: target, onClick: onTarget },
      ].map((b) => (
        <button
          key={b.label}
          type="button"
          disabled={disabled}
          onClick={b.onClick}
          className="rounded-lg py-1.5 text-sm font-semibold transition disabled:opacity-50"
          style={b.active ? { background: 'oklch(1 0 0 / 0.08)', color: 'var(--color-ink)' } : { color: 'var(--color-ink-mute)' }}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}

export function Controls({
  options,
  setOptions,
  disabled,
}: {
  options: ConvertOptions
  setOptions: (p: Partial<ConvertOptions>) => void
  disabled: boolean
}) {
  const meta = FORMAT_META[options.format]
  const targetMode = options.targetBytes != null
  const [unit, setUnit] = useState<'KB' | 'MB'>('MB')
  const [sizeVal, setSizeVal] = useState(1)

  const pct = ((options.quality - 1) / 99) * 100
  const trackStyle = {
    '--track': `linear-gradient(to right, var(--color-accent) ${pct}%, oklch(1 0 0 / 0.12) ${pct}%)`,
  } as CSSProperties

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label>Convert to</Label>
        <div className="mt-2.5 grid grid-cols-4 gap-1 rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] p-1">
          {OUTPUT_FORMATS.map((f: OutputFormat) => {
            const active = options.format === f
            const tint = FORMAT_TINT[FORMAT_META[f].label] ?? 'var(--color-accent)'
            return (
              <button
                key={f}
                type="button"
                disabled={disabled}
                onClick={() => setOptions({ format: f })}
                className="rounded-lg py-2 text-sm font-semibold transition disabled:opacity-50"
                style={active ? { background: tint, color: 'oklch(0.17 0.02 300)' } : { color: 'var(--color-ink-soft)' }}
              >
                {FORMAT_META[f].label}
              </button>
            )
          })}
        </div>
      </div>

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-mute transition-colors hover:text-ink-soft [&::-webkit-details-marker]:hidden">
          <svg className="h-3 w-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          Quality &amp; size
        </summary>

        <div className="mt-4 flex flex-col gap-5">
          <ModeToggle
            target={targetMode}
            disabled={disabled}
            onQuality={() => setOptions({ targetBytes: null })}
            onTarget={() => setOptions({ targetBytes: sizeVal * factorFor(unit) })}
          />

          {targetMode ? (
            <div>
              <Label>Target size</Label>
              <div className="mt-2.5 flex gap-2">
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={sizeVal}
                  disabled={disabled}
                  onChange={(e) => {
                    const v = Math.max(0.01, Number(e.target.value) || 0)
                    setSizeVal(v)
                    setOptions({ targetBytes: Math.round(v * factorFor(unit)) })
                  }}
                  className="w-full rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] px-3.5 py-2.5 text-sm text-ink disabled:opacity-50"
                />
                <select
                  value={unit}
                  disabled={disabled}
                  onChange={(e) => {
                    const u = e.target.value as 'KB' | 'MB'
                    setUnit(u)
                    setOptions({ targetBytes: Math.round(sizeVal * factorFor(u)) })
                  }}
                  className="select rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] py-2.5 pr-9 pl-3.5 text-sm text-ink disabled:opacity-50"
                >
                  <option value="KB" className="bg-surface">KB</option>
                  <option value="MB" className="bg-surface">MB</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-ink-mute">Finds the best quality that fits, shrinking the image only if it has to.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <Label>Quality</Label>
                <span className="font-mono text-sm text-ink">{meta.lossy ? options.quality : 'lossless'}</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={options.quality}
                disabled={disabled || !meta.lossy}
                onChange={(e) => setOptions({ quality: Number(e.target.value) })}
                className="slider mt-3"
                style={trackStyle}
              />
              {!meta.lossy && <p className="mt-2 text-xs text-ink-mute">PNG keeps every pixel exact.</p>}
            </div>
          )}

          <div>
            <Label>Resize</Label>
            <select
              value={options.maxDimension ?? ''}
              disabled={disabled}
              onChange={(e) => setOptions({ maxDimension: e.target.value === '' ? null : Number(e.target.value) })}
              className="select mt-2.5 w-full rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] px-3.5 py-2.5 text-sm text-ink transition hover:border-line-strong disabled:opacity-50"
            >
              {RESIZE_OPTIONS.map((o) => (
                <option key={o.label} value={o.value ?? ''} className="bg-surface text-ink">
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-ink-mute">Shrinks large images, never upscales.</p>
          </div>
        </div>
      </details>
    </div>
  )
}
