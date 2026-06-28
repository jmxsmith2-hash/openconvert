import type { Job } from '../hooks/useConverter'
import { formatBytes } from '../lib/format'

function StatusBadge({ job }: { job: Job }) {
  if (job.status === 'queued')
    return <span className="text-xs text-neutral-400">Queued</span>
  if (job.status === 'working')
    return <span className="text-brand-600 dark:text-brand-400 text-xs">Converting…</span>
  if (job.status === 'error')
    return (
      <span className="text-xs text-red-500" title={job.error}>
        Failed: {job.error}
      </span>
    )
  return null
}

function Savings({ job }: { job: Job }) {
  if (!job.result) return null
  const before = job.file.size
  const after = job.result.blob.size
  const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0
  const smaller = pct > 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-400">{formatBytes(before)}</span>
      <span className="text-neutral-300 dark:text-neutral-600">→</span>
      <span className="font-medium text-neutral-700 dark:text-neutral-200">
        {formatBytes(after)}
      </span>
      <span
        className={[
          'rounded px-1.5 py-0.5 font-medium',
          smaller
            ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
        ].join(' ')}
      >
        {smaller ? `−${pct}%` : `+${Math.abs(pct)}%`}
      </span>
    </div>
  )
}

function Thumb({ job }: { job: Job }) {
  const src = job.result?.url ?? job.previewUrl
  if (src)
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
      />
    )
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-[10px] font-medium text-neutral-400 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
      HEIC
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
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Thumb job={job} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {job.outName}
            </p>
            <div className="mt-1">
              {job.status === 'done' ? <Savings job={job} /> : <StatusBadge job={job} />}
            </div>
          </div>
          {job.status === 'done' && job.result && (
            <a
              href={job.result.url}
              download={job.outName}
              className="bg-brand-600 hover:bg-brand-700 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition"
            >
              Download
            </a>
          )}
          <button
            type="button"
            onClick={() => onRemove(job.id)}
            aria-label="Remove"
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
