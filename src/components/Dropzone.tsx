import { useRef, useState } from 'react'
import { FormatChips } from './FormatChips'

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
        'group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border text-center transition-colors',
        compact ? 'gap-2 p-5' : 'gap-4 p-10',
        dragging
          ? 'border-transparent'
          : 'border border-dashed border-line hover:border-line-strong hover:bg-[oklch(1_0_0_/_0.02)]',
      ].join(' ')}
      style={
        dragging
          ? {
              boxShadow:
                '0 0 0 1.5px var(--color-accent), 0 0 70px -12px oklch(0.72 0.19 322 / 0.7)',
            }
          : undefined
      }
    >
      {dragging && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, oklch(0.72 0.19 322 / 0.16), transparent 70%)',
          }}
        />
      )}

      <div
        className={[
          'relative grid place-items-center rounded-2xl transition-transform group-hover:-translate-y-0.5',
          compact ? 'h-9 w-9' : 'h-14 w-14',
        ].join(' ')}
        style={{
          background: 'oklch(0.72 0.19 322 / 0.12)',
          boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 322 / 0.35)',
        }}
      >
        <svg
          className={compact ? 'h-4.5 w-4.5' : 'h-6 w-6'}
          style={{ color: 'var(--color-accent-soft)', width: compact ? 18 : 24, height: compact ? 18 : 24 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5" />
          <path d="M4 14v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3" />
        </svg>
      </div>

      <div className="relative">
        <p className="font-display font-medium text-ink">
          {compact ? 'Add more images' : 'Drop images here'}
        </p>
        {!compact && (
          <p className="mt-1 text-sm text-ink-mute">or click to browse, nothing gets uploaded</p>
        )}
      </div>

      {!compact && (
        <FormatChips
          formats={['HEIC', 'JPG', 'PNG', 'WebP', 'AVIF']}
          className="relative justify-center"
        />
      )}

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
