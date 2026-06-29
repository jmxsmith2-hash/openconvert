import { useState, type ReactNode } from 'react'
import { Backdrop } from './components/Backdrop'
import { Controls } from './components/Controls'
import { Dropzone } from './components/Dropzone'
import { FormatChips } from './components/FormatChips'
import { HeroArt } from './components/HeroArt'
import { JobList } from './components/JobList'
import { Logo } from './components/Logo'
import { MediaControls } from './components/MediaControls'
import { MediaJobList } from './components/MediaJobList'
import { useConverter } from './hooks/useConverter'
import { useMediaConverter } from './hooks/useMediaConverter'
import { mediaKind } from './lib/media'
import { zipBlobs } from './lib/zip'

const REPO_URL = 'https://github.com/jmxsmith2-hash/openconvert'

function Bench({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[18.5rem_1fr]">
      <aside className="flex flex-col gap-6 border-line p-6 max-lg:border-b lg:border-r">{aside}</aside>
      <div className="flex flex-col gap-4 p-6">{children}</div>
    </div>
  )
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-semibold text-ink-soft">{children}</p>
}

function App() {
  const img = useConverter()
  const av = useMediaConverter()
  const [zipping, setZipping] = useState(false)

  // One dropzone for everything: sort each file into the right engine automatically.
  function route(files: FileList | File[]) {
    const arr = Array.from(files)
    const images = arr.filter((f) => mediaKind(f) === 'image')
    const media = arr.filter((f) => {
      const k = mediaKind(f)
      return k === 'audio' || k === 'video'
    })
    if (images.length) img.addFiles(images)
    if (media.length) av.addFiles(media)
  }

  const hasImages = img.jobs.length > 0
  const hasMedia = av.jobs.length > 0
  const hasAny = hasImages || hasMedia
  const bothKinds = hasImages && hasMedia

  const pending = img.pendingCount + av.pendingCount
  const doneCount = img.doneJobs.length + av.doneJobs.length
  const isConverting = img.isConverting || av.isConverting
  const busy = isConverting || zipping

  async function convertEverything() {
    if (img.pendingCount > 0) await img.convertAll()
    if (av.pendingCount > 0) await av.convertAll()
  }

  async function downloadAll() {
    if (!doneCount) return
    setZipping(true)
    try {
      const entries = [
        ...img.doneJobs.map((j) => ({ name: j.outName, blob: j.result!.blob })),
        ...av.doneJobs.map((j) => ({ name: j.outName, blob: j.result!.blob })),
      ]
      const blob = await zipBlobs(entries)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'openconvert.zip'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } finally {
      setZipping(false)
    }
  }

  function clearAll() {
    img.clear()
    av.clear()
  }

  const convertLabel = av.coreLoading
    ? 'Preparing converter…'
    : isConverting
      ? 'Converting…'
      : pending > 0
        ? `Convert ${pending} file${pending > 1 ? 's' : ''}`
        : 'All done'

  return (
    <div className="relative min-h-full">
      <Backdrop />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">OpenConvert</span>
        </div>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-ghost px-3.5 py-2 text-sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
          </svg>
          Source
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24">
        {/* hero */}
        <section className="reveal grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-mute">
              Open source · runs 100% on your device
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold text-ink sm:text-5xl lg:text-[3.4rem]">
              Convert files without{' '}
              <span style={{ color: 'var(--color-accent-soft)' }}>handing them over.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              Drop an image, audio, or video file and convert it right here in your browser. No
              upload, no account, no watermark. The code is open, so the privacy isn&apos;t a promise
              you have to take on faith.
            </p>
            <FormatChips formats={['HEIC', 'JPG', 'PNG', 'MP4', 'MP3', 'WAV']} className="mt-7" />
          </div>
          <div className="relative">
            <HeroArt />
          </div>
        </section>

        {/* workbench */}
        <section
          className="reveal overflow-hidden rounded-3xl border border-line bg-surface"
          style={{ boxShadow: '0 1px 0 oklch(1 0 0 / 0.05) inset, 0 40px 80px -40px oklch(0 0 0 / 0.8)' }}
        >
          <Bench
            aside={
              hasAny ? (
                <>
                  {hasImages && (
                    <div>
                      {bothKinds && <GroupLabel>Images</GroupLabel>}
                      <Controls options={img.options} setOptions={img.setOptions} disabled={img.isConverting} />
                    </div>
                  )}
                  {hasMedia && (
                    <div className={bothKinds ? 'border-t border-line pt-6' : undefined}>
                      {bothKinds && <GroupLabel>Audio &amp; video</GroupLabel>}
                      <MediaControls
                        format={av.format}
                        formats={av.formats}
                        setFormat={av.setFormat}
                        targetBytes={av.targetBytes}
                        setTargetBytes={av.setTargetBytes}
                        disabled={av.isConverting}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 border-t border-line pt-5">
                    <button type="button" onClick={convertEverything} disabled={busy || pending === 0} className="btn-primary py-2.5">
                      {convertLabel}
                    </button>
                    {av.coreLoading && (
                      <p className="text-center text-xs text-ink-mute">Loading the converter, one-time ~31 MB.</p>
                    )}
                    {doneCount > 0 && (
                      <button type="button" onClick={downloadAll} disabled={zipping} className="btn-ghost py-2.5">
                        {zipping ? 'Zipping…' : `Download all (${doneCount}) as ZIP`}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearAll}
                      disabled={isConverting}
                      className="py-1.5 text-sm text-ink-mute transition-colors hover:text-ink-soft disabled:opacity-50"
                    >
                      Clear all
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-ink">How it works</p>
                  <ol className="flex flex-col gap-2.5 text-sm text-ink-mute">
                    <li>1. Drop any image, audio, or video file.</li>
                    <li>2. Pick what to convert it to.</li>
                    <li>3. Convert and download. Nothing is uploaded.</li>
                  </ol>
                </div>
              )
            }
          >
            <Dropzone
              onFiles={route}
              compact={hasAny}
              accept="image/*,audio/*,video/*,.heic,.heif"
              title="Drop your files here"
              compactTitle="Add more files"
              chips={['HEIC', 'JPG', 'PNG', 'AVIF', 'MP4', 'MP3', 'WAV']}
            />
            {hasImages && (
              <div className="flex flex-col gap-2">
                {bothKinds && <GroupLabel>Images</GroupLabel>}
                <JobList jobs={img.jobs} onRemove={img.removeJob} />
              </div>
            )}
            {hasMedia && (
              <div className="flex flex-col gap-2">
                {bothKinds && <GroupLabel>Audio &amp; video</GroupLabel>}
                <MediaJobList jobs={av.jobs} onRemove={av.removeJob} />
              </div>
            )}
            {!hasAny && (
              <div className="grid flex-1 place-items-center rounded-2xl px-6 py-10 text-center">
                <p className="text-sm text-ink-mute">Your converted files will appear here.</p>
              </div>
            )}
          </Bench>
        </section>

        {/* why */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">Why it works this way</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            In 2026 the{' '}
            <a className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink" href="https://www.fbi.gov/contact-us/field-offices/denver/news/fbi-denver-warns-of-online-file-converter-scam" target="_blank" rel="noreferrer">
              FBI
            </a>{' '}
            warned that many &ldquo;free online file converter&rdquo; sites harvest the files you
            upload or push malware. OpenConvert removes the risk by removing the upload entirely.
          </p>

          <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {[
              { n: '01', t: 'Nothing is uploaded', d: 'Decoding and encoding happen in this tab. No server ever receives your files.' },
              { n: '02', t: 'No account, no walls', d: 'No sign-up, no watermark, no size limit that turns into a paywall.' },
              { n: '03', t: 'Open and auditable', d: 'The full source is public, so the privacy claim is something you can verify.' },
            ].map((p) => (
              <li key={p.n} className="border-t border-line pt-4">
                <span className="font-mono text-xs" style={{ color: 'var(--color-accent-soft)' }}>
                  {p.n}
                </span>
                <h3 className="mt-2 text-base font-semibold text-ink">{p.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">{p.d}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-mute sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>OpenConvert</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
              Source
            </a>
            <span>MIT licensed</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
