# OpenConvert

**A private image converter that runs entirely in your browser.** Drop in your
photos — HEIC, JPG, PNG, WebP, AVIF — and convert, resize, and compress them
without anything ever being uploaded. No account, no watermark, no size limit
that turns into a paywall. Open source, so you can verify the privacy claim
instead of trusting it.

## Why this exists

The most popular "free online file converter" sites have a real problem: in 2026
the [FBI](https://www.fbi.gov/contact-us/field-offices/denver/news/fbi-denver-warns-of-online-file-converter-scam)
warned that many of them harvest the files you upload or push malware. Even the
honest ones send your private photos to a server and ask you to trust a
"deleted within an hour" promise you can't check.

OpenConvert does the conversion **on your device**, in a normal browser tab. The
file is decoded, resized, and re-encoded in memory and never touches a network.
Because the code is open source (and the app is a static site you can self-host),
"your files never leave your browser" is something anyone can audit — not a
marketing line.

It's the trustworthy codec tech behind [Squoosh](https://squoosh.app/), but built
as the batch **converter** Squoosh never became.

## Features

- **Batch convert** many images at once; download individually or as a ZIP.
- **Inputs:** HEIC/HEIF, JPG, PNG, WebP, AVIF, GIF, BMP.
- **Outputs:** JPEG, PNG, WebP, AVIF.
- **Quality** control for lossy formats and **resize** (longest-side cap, never upscales).
- **Metadata is stripped** automatically as a side effect of re-encoding — no GPS/EXIF leaks.
- **100% client-side.** HEIC decoding uses [libheif](https://github.com/strukturag/libheif)
  via `heic2any`; AVIF encoding uses the [jSquash](https://github.com/jamsinclair/jSquash)
  (libavif) WebAssembly codec. JPEG/PNG/WebP use the native canvas encoders.

## How it works

```
file → decode (createImageBitmap / heic2any) → draw to OffscreenCanvas (+ resize)
     → encode (canvas convertToBlob, or jSquash for AVIF) → download
```

The conversion pipeline lives in [`src/lib/convert.ts`](src/lib/convert.ts).

## Run locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

Requires Node 20+. The output in `dist/` is a fully static site — host it
anywhere (GitHub Pages, Netlify, your own box) or just open it offline.

## Limitations & honest trade-offs

- Encoding runs on **your** hardware, so very large images (e.g. lots of 4K
  photos) are slower than a server and can use significant memory.
- AVIF encoding is WebAssembly and noticeably slower than JPEG/PNG/WebP.
- Conversion currently runs on the main thread; moving the heavy encode into a
  Web Worker (so the UI never stutters on big batches) is the top follow-up.

## Roadmap

- Web Worker offload for large batches
- Installable offline PWA
- Add the video/audio lane (`ffmpeg.wasm`) — the other space the malware-laden
  converter sites dominate

## License

[MIT](LICENSE). Contributions welcome.
