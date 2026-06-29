import { useState } from 'react'
import { AV_FORMATS, type AvFormat } from '../lib/media'

const factorFor = (u: 'KB' | 'MB') => (u === 'MB' ? 1024 * 1024 : 1024)

function Group({
  title,
  list,
  format,
  setFormat,
  disabled,
}: {
  title: string
  list: AvFormat[]
  format: AvFormat
  setFormat: (f: AvFormat) => void
  disabled: boolean
}) {
  if (!list.length) return null
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-mute">{title}</p>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] p-1">
        {list.map((f) => {
          const active = format === f
          return (
            <button
              key={f}
              type="button"
              disabled={disabled}
              onClick={() => setFormat(f)}
              className="rounded-lg py-2 text-sm font-semibold transition disabled:opacity-50"
              style={active ? { background: 'var(--color-accent)', color: 'oklch(0.17 0.02 320)' } : { color: 'var(--color-ink-soft)' }}
            >
              {AV_FORMATS[f].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function MediaControls({
  format,
  formats,
  setFormat,
  targetBytes,
  setTargetBytes,
  disabled,
}: {
  format: AvFormat
  formats: AvFormat[]
  setFormat: (f: AvFormat) => void
  targetBytes: number | null
  setTargetBytes: (b: number | null) => void
  disabled: boolean
}) {
  const video = formats.filter((f) => AV_FORMATS[f].family === 'video')
  const audio = formats.filter((f) => AV_FORMATS[f].family === 'audio')
  const targetMode = targetBytes != null
  const [unit, setUnit] = useState<'KB' | 'MB'>('MB')
  const [sizeVal, setSizeVal] = useState(5)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-mute">Convert to</p>
        <div className="flex flex-col gap-4">
          <Group title="Video" list={video} format={format} setFormat={setFormat} disabled={disabled} />
          <Group title="Audio" list={audio} format={format} setFormat={setFormat} disabled={disabled} />
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-mute">Size</p>
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] p-1">
          {[
            { label: 'Standard', active: !targetMode, onClick: () => setTargetBytes(null) },
            { label: 'Target size', active: targetMode, onClick: () => setTargetBytes(Math.round(sizeVal * factorFor(unit))) },
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

        {targetMode && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              min={0.1}
              step="any"
              value={sizeVal}
              disabled={disabled}
              onChange={(e) => {
                const v = Math.max(0.1, Number(e.target.value) || 0)
                setSizeVal(v)
                setTargetBytes(Math.round(v * factorFor(unit)))
              }}
              className="w-full rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] px-3.5 py-2.5 text-sm text-ink disabled:opacity-50"
            />
            <select
              value={unit}
              disabled={disabled}
              onChange={(e) => {
                const u = e.target.value as 'KB' | 'MB'
                setUnit(u)
                setTargetBytes(Math.round(sizeVal * factorFor(u)))
              }}
              className="select rounded-xl border border-line bg-[oklch(1_0_0_/_0.02)] py-2.5 pr-9 pl-3.5 text-sm text-ink disabled:opacity-50"
            >
              <option value="KB" className="bg-surface">KB</option>
              <option value="MB" className="bg-surface">MB</option>
            </select>
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-ink-mute">
        {targetMode
          ? 'Picks a bitrate to land near your target. Runs on your device, so longer clips take longer.'
          : 'Everything runs on your device. Long videos can take a while, this trades speed for never uploading your files.'}
      </p>
    </div>
  )
}
