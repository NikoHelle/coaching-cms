import { parseVideoUrl } from '@/lib/video'

export function VideoEmbed({ url }: { url: string }) {
  const info = parseVideoUrl(url)

  if (info.kind === 'youtube') {
    return (
      <iframe
        src={info.embedUrl}
        className="aspect-video w-full rounded-xl border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Drill video"
      />
    )
  }

  if (info.kind === 'instagram') {
    return (
      <iframe
        src={info.embedUrl}
        className="mx-auto aspect-[9/16] w-full max-w-sm rounded-xl border-0"
        loading="lazy"
        title="Drill video"
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border p-4 text-sm text-emerald-700 underline"
    >
      Watch video: {url}
    </a>
  )
}
