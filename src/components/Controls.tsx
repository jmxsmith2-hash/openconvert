import { FORMAT_META, OUTPUT_FORMATS } from '../lib/format'
import type { ConvertOptions, OutputFormat } from '../lib/types'

const RESIZE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Original size', value: null },
  { label: 'Max 3840px', value: 3840 },
  { label: 'Max 2560px', value: 2560 },
  { label: 'Max 1920px', value: 1920 },
  { label: 'Max 1280px', value: 1280 },
  { label: 'Max 800px', value: 800 },
]

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

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Convert to
        </label>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map((f: OutputFormat) => (
            <button
              key={f}
              type="button"
              disabled={disabled}
              onClick={() => setOptions({ format: f })}
              className={[
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50',
                options.format === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
              ].join(' ')}
            >
              {FORMAT_META[f].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Quality
          </label>
          <span className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
            {meta.lossy ? `${options.quality}` : 'Lossless'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={options.quality}
          disabled={disabled || !meta.lossy}
          onChange={(e) => setOptions({ quality: Number(e.target.value) })}
          className="accent-brand-600 w-full disabled:opacity-40"
        />
        {!meta.lossy && (
          <p className="mt-1 text-xs text-neutral-400">PNG is lossless — quality doesn&apos;t apply.</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Resize
        </label>
        <select
          value={options.maxDimension ?? ''}
          disabled={disabled}
          onChange={(e) =>
            setOptions({ maxDimension: e.target.value === '' ? null : Number(e.target.value) })
          }
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          {RESIZE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value ?? ''}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-400">Only shrinks larger images; never upscales.</p>
      </div>
    </div>
  )
}
