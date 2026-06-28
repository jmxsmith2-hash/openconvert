import type { MediaJob } from '../hooks/useMediaConverter'
import { formatBytes } from '../lib/format'

function KindIcon({ kind }: { kind: 'audio' | 'video' }) {
  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl ring-1 ring-line"
      style={{ background: 'oklch(0.72 0.19 322 / 0.1)', color: 'var(--color-accent-soft)' }}
    >
      {kind === 'video' ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="14" height="14" rx="2.5" />
          <path d="m17 9 4-2v10l-4-2z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
        </svg>
      )}
    </div>
  )
}

function Detail({ job }: { job: MediaJob }) {
  if (job.status === 'done' && job.result) {
    const before = job.file.size
    const after = job.result.blob.size
    const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0
    const smaller = pct > 0
    const tint = smaller ? 'oklch(0.82 0.16 165)' : 'oklch(0.83 0.14 80)'
    return (
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className="font-mono text-ink-mute">{formatBytes(before)}</span>
        <span className="text-ink-mute">→</span>
        <span className="font-mono font-medium text-ink">{formatBytes(after)}</span>
        <span className="rounded-md px-1.5 py-0.5 font-mono font-semibold" style={{ color: tint, background: `color-mix(in oklch, ${tint} 15%, transparent)` }}>
          {smaller ? `−${pct}%` : `+${Math.abs(pct)}%`}
        </span>
      </div>
    )
  }
  if (job.status === 'working') {
    return (
      <div className="mt-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-[oklch(1_0_0_/_0.1)]">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.max(4, Math.round(job.progress * 100))}%`, background: 'var(--color-accent)', transition: 'width 0.25s ease' }}
          />
        </div>
        <p className="mt-1 text-[11px] text-ink-mute">
          {job.progress > 0 ? `Converting… ${Math.round(job.progress * 100)}%` : 'Converting…'}
        </p>
      </div>
    )
  }
  if (job.status === 'error')
    return (
      <p className="mt-1.5 truncate text-xs" style={{ color: 'oklch(0.72 0.18 25)' }} title={job.error}>
        Failed: {job.error}
      </p>
    )
  return <p className="mt-1.5 text-xs text-ink-mute">Ready</p>
}

export function MediaJobList({ jobs, onRemove }: { jobs: MediaJob[]; onRemove: (id: string) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {jobs.map((job) => (
        <li key={job.id} className="reveal flex items-center gap-3.5 rounded-2xl border border-line bg-[oklch(1_0_0_/_0.025)] p-3 transition-colors hover:border-line-strong">
          <KindIcon kind={job.kind} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{job.outName}</p>
            <Detail job={job} />
          </div>
          {job.status === 'done' && job.result && (
            <a href={job.result.url} download={job.outName} className="btn-primary px-3.5 py-2 text-sm">
              Save
            </a>
          )}
          <button
            type="button"
            onClick={() => onRemove(job.id)}
            aria-label="Remove file"
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
