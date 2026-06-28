import { useRef, useState } from 'react'

export function Dropzone({
  onFiles,
  compact = false,
}: {
  onFiles: (files: FileList | File[]) => void
  compact?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
      }}
      className={[
        'group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition',
        compact ? 'gap-2 p-6' : 'gap-3 p-12',
        dragging
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
          : 'border-neutral-300 bg-white hover:border-brand-400 hover:bg-brand-50/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-brand-500/5',
      ].join(' ')}
    >
      <svg
        className={[
          'text-brand-500 transition-transform group-hover:scale-105',
          compact ? 'h-7 w-7' : 'h-12 w-12',
        ].join(' ')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M20 16.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5" />
      </svg>
      <div>
        <p className="font-medium text-neutral-800 dark:text-neutral-100">
          {compact ? 'Add more images' : 'Drop images here, or click to browse'}
        </p>
        {!compact && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            HEIC, JPG, PNG, WebP, AVIF, GIF, BMP &middot; converted right here, never uploaded
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
