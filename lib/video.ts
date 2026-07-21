export type VideoEmbedInfo =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'instagram'; embedUrl: string }
  | { kind: 'link' }

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
]

export function parseVideoUrl(url: string): VideoEmbedInfo {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match) {
      return { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${match[1]}` }
    }
  }
  const instagram = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)
  if (instagram) {
    return {
      kind: 'instagram',
      embedUrl: `https://www.instagram.com/${instagram[1]}/${instagram[2]}/embed`,
    }
  }
  return { kind: 'link' }
}
