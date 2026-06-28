import type { Job } from '../hooks/useConverter'
import { formatBytes } from '../lib/format'

function Savings({ job }: { job: Job }) {
  if (!job.result) return null
  const before = job.file.size
  const after = job.result.blob.size
  const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0
  const smaller = pct > 0
  const tint = smaller ? 'oklch(0.82 0.16 165)' : 'oklch(0.83 0.14 80)'
  return (
    <div className="mt-1.5 flex items-center gap-2 text-xs">
      <span className="font-mono text-ink-mute">{formatBytes(before)}</span>
      <svg className="h-3 w-3 text-ink-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
      <span className="font-mono font-medium text-ink">{formatBytes(after)}</span>
      <span
        className="rounded-md px-1.5 py-0.5 font-mono font-semibold"
        style={{ color: tint, background: `color-mix(in oklch, ${tint} 15%, transparent)` }}
      >
        {smaller ? `−${pct}%` : `+${Math.abs(pct)}%`}
      </span>
    </div>
  )
}

function Status({ job }: { job: Job }) {
  if (job.status === 'queued') return <p className="mt-1.5 text-xs text-ink-mute">Ready</p>
  if (job.status === 'working')
    return (
      <p className="mt-1.5 text-xs" style={{ color: 'var(--color-accent-soft)' }}>
        Converting…
      </p>
    )
  if (job.status === 'error')
    return (
      <p className="mt-1.5 truncate text-xs" style={{ color: 'oklch(0.72 0.18 25)' }} title={job.error}>
        Failed: {job.error}
      </p>
    )
  return null
}

function Thumb({ job }: { job: Job }) {
  const src = job.result?.url ?? job.previewUrl
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-line">
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[oklch(1_0_0_/_0.04)] font-mono text-[10px] text-ink-mute">
          HEIC
        </div>
      )}
      {job.status === 'working' && <div className="shimmer absolute inset-0" />}
    </div>
  )
}

export function JobList({
  jobs,
  onRemove,
}: {
  jobs: Job[]
  onRemove: (id: string) => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {jobs.map((job) => (
        <li
          key={job.id}
          className="reveal flex items-center gap-3.5 rounded-2xl border border-line bg-[oklch(1_0_0_/_0.025)] p-3 transition-colors hover:border-line-strong"
        >
          <Thumb job={job} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{job.outName}</p>
            {job.status === 'done' ? <Savings job={job} /> : <Status job={job} />}
          </div>
          {job.status === 'done' && job.result && (
            <a href={job.result.url} download={job.outName} className="btn-primary px-3.5 py-2 text-sm">
              Save
            </a>
          )}
          <button
            type="button"
            onClick={() => onRemove(job.id)}
            aria-label="Remove image"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-[oklch(1_0_0_/_0.06)] hover:text-ink"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
