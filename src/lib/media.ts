export type MediaKind = 'image' | 'video' | 'audio' | 'other'

const VIDEO_EXT = /\.(mp4|mov|webm|mkv|avi|m4v|mpe?g|wmv|flv|3gp|ts)$/i
const AUDIO_EXT = /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac|wma|aiff?|caf)$/i
const IMAGE_EXT = /\.(jpe?g|png|gif|bmp|webp|avif|tiff?|heic|heif)$/i

export function mediaKind(file: File): MediaKind {
  const t = file.type
  const n = file.name
  if (t.startsWith('video/') || VIDEO_EXT.test(n)) return 'video'
  if (t.startsWith('audio/') || AUDIO_EXT.test(n)) return 'audio'
  if (t.startsWith('image/') || IMAGE_EXT.test(n)) return 'image'
  return 'other'
}

export type AvFormat = 'mp4' | 'webm' | 'gif' | 'mp3' | 'wav' | 'm4a' | 'ogg'

export interface AvFormatDef {
  label: string
  ext: string
  mime: string
  /** 'video' produces a moving-image file; 'audio' strips to sound only. */
  family: 'video' | 'audio'
  args: string[]
}

export const AV_FORMATS: Record<AvFormat, AvFormatDef> = {
  mp4: {
    label: 'MP4',
    ext: 'mp4',
    mime: 'video/mp4',
    family: 'video',
    args: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'],
  },
  webm: {
    label: 'WebM',
    ext: 'webm',
    mime: 'video/webm',
    family: 'video',
    args: ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-deadline', 'realtime', '-cpu-used', '6', '-c:a', 'libopus'],
  },
  gif: {
    label: 'GIF',
    ext: 'gif',
    mime: 'image/gif',
    family: 'video',
    args: ['-vf', 'fps=12,scale=480:-1:flags=lanczos', '-loop', '0'],
  },
  mp3: { label: 'MP3', ext: 'mp3', mime: 'audio/mpeg', family: 'audio', args: ['-vn', '-c:a', 'libmp3lame', '-q:a', '2'] },
  wav: { label: 'WAV', ext: 'wav', mime: 'audio/wav', family: 'audio', args: ['-vn', '-c:a', 'pcm_s16le'] },
  m4a: { label: 'M4A', ext: 'm4a', mime: 'audio/mp4', family: 'audio', args: ['-vn', '-c:a', 'aac', '-b:a', '192k'] },
  ogg: { label: 'OGG', ext: 'ogg', mime: 'audio/ogg', family: 'audio', args: ['-vn', '-c:a', 'libopus'] },
}

/** Output formats offered, given whether any source file carries a video track. */
export function availableFormats(hasVideo: boolean): AvFormat[] {
  return hasVideo ? ['mp4', 'webm', 'gif', 'mp3', 'm4a', 'wav'] : ['mp3', 'wav', 'm4a', 'ogg']
}

export function extOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : 'bin'
}

/** Read a clip's duration (seconds) via a media element. 0 if unknown. */
export function mediaDuration(file: File, kind: 'audio' | 'video'): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement(kind === 'audio' ? 'audio' : 'video')
    el.preload = 'metadata'
    const url = URL.createObjectURL(file)
    const done = (d: number) => {
      URL.revokeObjectURL(url)
      resolve(Number.isFinite(d) && d > 0 ? d : 0)
    }
    el.onloadedmetadata = () => done(el.duration)
    el.onerror = () => done(0)
    el.src = url
  })
}

/** ffmpeg args for hitting a bitrate target. Returns null for formats that
 *  can't be bitrate-targeted (GIF, lossless WAV) so callers use the defaults. */
export function targetArgs(format: AvFormat, videoK: number, audioK: number): string[] | null {
  switch (format) {
    case 'mp4':
      return ['-c:v', 'libx264', '-preset', 'veryfast', '-b:v', `${videoK}k`, '-maxrate', `${Math.round(videoK * 1.2)}k`, '-bufsize', `${videoK * 2}k`, '-c:a', 'aac', '-b:a', `${audioK}k`, '-movflags', '+faststart']
    case 'webm':
      return ['-c:v', 'libvpx-vp9', '-b:v', `${videoK}k`, '-deadline', 'realtime', '-cpu-used', '6', '-c:a', 'libopus', '-b:a', `${audioK}k`]
    case 'mp3':
      return ['-vn', '-c:a', 'libmp3lame', '-b:a', `${audioK}k`]
    case 'm4a':
      return ['-vn', '-c:a', 'aac', '-b:a', `${audioK}k`]
    case 'ogg':
      return ['-vn', '-c:a', 'libopus', '-b:a', `${audioK}k`]
    default:
      return null
  }
}
