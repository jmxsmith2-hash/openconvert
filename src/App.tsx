import { useState } from 'react'
import { Controls } from './components/Controls'
import { Dropzone } from './components/Dropzone'
import { JobList } from './components/JobList'
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
      const blob = await zipBlobs(
        doneJobs.map((j) => ({ name: j.outName, blob: j.result!.blob })),
      )
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
    <div className="min-h-full bg-neutral-50 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-600 flex h-8 w-8 items-center justify-center rounded-lg text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 3 5 5-5 5" />
                <path d="M21 8H9a4 4 0 0 0-4 4" />
                <path d="m8 21-5-5 5-5" />
                <path d="M3 16h12a4 4 0 0 0 4-4" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
              OpenConvert
            </span>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
            Source
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            </svg>
            Files never leave your browser
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Convert images privately
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            HEIC, JPG, PNG, WebP &amp; AVIF — converted entirely on your device. No uploads,
            no account, no watermark. Open source, so you can verify it.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[20rem_1fr]">
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <Controls options={options} setOptions={setOptions} disabled={isConverting} />
            {hasJobs && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={convertAll}
                  disabled={isConverting || pendingCount === 0}
                  className="bg-brand-600 hover:bg-brand-700 rounded-xl px-4 py-2.5 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConverting
                    ? 'Converting…'
                    : pendingCount > 0
                      ? `Convert ${pendingCount} image${pendingCount > 1 ? 's' : ''}`
                      : 'All converted'}
                </button>
                {doneJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadAll}
                    disabled={zipping}
                    className="rounded-xl border border-neutral-300 px-4 py-2.5 font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  >
                    {zipping ? 'Zipping…' : `Download all (${doneJobs.length}) as ZIP`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={clear}
                  disabled={isConverting}
                  className="rounded-xl px-4 py-2 text-sm text-neutral-500 transition hover:text-neutral-700 disabled:opacity-50 dark:hover:text-neutral-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Dropzone onFiles={addFiles} compact={hasJobs} />
            {hasJobs ? (
              <JobList jobs={jobs} onRemove={removeJob} />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400 dark:border-neutral-800">
                Your images will appear here.
              </div>
            )}
          </div>
        </div>

        <footer className="mx-auto mt-16 max-w-2xl border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Why convert in the browser?
          </p>
          <p className="mt-2">
            The FBI and security researchers have warned that many “free online file
            converter” sites harvest your files or push malware. OpenConvert does its work
            entirely on your device — your photos are never sent anywhere — and the code is
            open source so anyone can check that claim.
          </p>
          <p className="mt-4">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">
              View the source &amp; contribute
            </a>
            <span className="mx-2 text-neutral-300 dark:text-neutral-700">·</span>
            MIT licensed
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
