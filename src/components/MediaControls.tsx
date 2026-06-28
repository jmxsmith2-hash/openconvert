import { AV_FORMATS, type AvFormat } from '../lib/media'

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
              style={
                active
                  ? { background: 'var(--color-accent)', color: 'oklch(0.17 0.02 320)' }
                  : { color: 'var(--color-ink-soft)' }
              }
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
  disabled,
}: {
  format: AvFormat
  formats: AvFormat[]
  setFormat: (f: AvFormat) => void
  disabled: boolean
}) {
  const video = formats.filter((f) => AV_FORMATS[f].family === 'video')
  const audio = formats.filter((f) => AV_FORMATS[f].family === 'audio')
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-mute">Convert to</p>
        <div className="flex flex-col gap-4">
          <Group title="Video" list={video} format={format} setFormat={setFormat} disabled={disabled} />
          <Group title="Audio" list={audio} format={format} setFormat={setFormat} disabled={disabled} />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-ink-mute">
        Everything runs on your device. Long videos can take a while, this trades speed for never
        uploading your files.
      </p>
    </div>
  )
}
