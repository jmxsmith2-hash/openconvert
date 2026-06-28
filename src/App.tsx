import { useState } from 'react'
import { Backdrop } from './components/Backdrop'
import { Controls } from './components/Controls'
import { Dropzone } from './components/Dropzone'
import { FormatChips } from './components/FormatChips'
import { HeroArt } from './components/HeroArt'
import { JobList } from './components/JobList'
import { Logo } from './components/Logo'
import { useConverter } from './hooks/useConverter'
import { zipBlobs } from './lib/zip'

const REPO_URL = 'https://github.com/jmxsmith2-hash/openconvert'

function App() {
  const {
    jobs,
    options,
    setOptions,
    addFiles,
    removeJob,
    clear,
    convertAll,
    isConverting,
    doneJobs,
    pendingCount,
  } = useConverter()
  const [zipping, setZipping] = useState(false)

  async function downloadAll() {
    if (!doneJobs.length) return
    setZipping(true)
    try {
      const blob = await zipBlobs(doneJobs.map((j) => ({ name: j.outName, blob: j.result!.blob })))
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

  const hasJobs = jobs.length > 0

  return (
    <div className="relative min-h-full">
      <Backdrop />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            OpenConvert
          </span>
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
              Convert images without{' '}
              <span style={{ color: 'var(--color-accent-soft)' }}>handing them over.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              HEIC, JPG, PNG, WebP and AVIF, converted right here in your browser. No upload, no
              account, no watermark. The code is open, so the privacy isn&apos;t a promise you have
              to take on faith.
            </p>
            <FormatChips
              formats={['HEIC', 'JPG', 'PNG', 'WebP', 'AVIF']}
              className="mt-7"
            />
          </div>
          <div className="relative">
            <HeroArt />
          </div>
        </section>

        {/* converter workbench */}
        <section
          className="reveal overflow-hidden rounded-3xl border border-line bg-surface"
          style={{ boxShadow: '0 1px 0 oklch(1 0 0 / 0.05) inset, 0 40px 80px -40px oklch(0 0 0 / 0.8)' }}
        >
          <div className="grid lg:grid-cols-[18.5rem_1fr]">
            <aside className="flex flex-col gap-6 border-line p-6 max-lg:border-b lg:border-r">
              <Controls options={options} setOptions={setOptions} disabled={isConverting} />

              {hasJobs && (
                <div className="flex flex-col gap-2 border-t border-line pt-5">
                  <button
                    type="button"
                    onClick={convertAll}
                    disabled={isConverting || pendingCount === 0}
                    className="btn-primary py-2.5"
                  >
                    {isConverting
                      ? 'Converting…'
                      : pendingCount > 0
                        ? `Convert ${pendingCount} image${pendingCount > 1 ? 's' : ''}`
                        : 'All done'}
                  </button>
                  {doneJobs.length > 0 && (
                    <button type="button" onClick={downloadAll} disabled={zipping} className="btn-ghost py-2.5">
                      {zipping ? 'Zipping…' : `Download all (${doneJobs.length}) as ZIP`}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clear}
                    disabled={isConverting}
                    className="py-1.5 text-sm text-ink-mute transition-colors hover:text-ink-soft disabled:opacity-50"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </aside>

            <div className="flex flex-col gap-4 p-6">
              <Dropzone onFiles={addFiles} compact={hasJobs} />
              {hasJobs ? (
                <JobList jobs={jobs} onRemove={removeJob} />
              ) : (
                <div className="grid flex-1 place-items-center rounded-2xl px-6 py-10 text-center">
                  <div>
                    <p className="font-display text-ink-soft">Your converted images land here</p>
                    <p className="mt-1 text-sm text-ink-mute">
                      Drop a batch above, tune the format, convert.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              { n: '01', t: 'Nothing is uploaded', d: 'Decoding and encoding happen in this tab. No server ever receives your photos.' },
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
