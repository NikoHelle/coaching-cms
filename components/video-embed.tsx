import { parseVideoUrl } from '@/lib/video'
import { InstagramEmbed } from '@/components/instagram-embed'

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
        title={`Harjoitevideo: ${url}`}
      />
    )
  }

  if (info.kind === 'instagram') {
    return <InstagramEmbed url={url} />
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border p-4 text-sm text-emerald-700 underline"
    >
      Katso video: {url}
    </a>
  )
}
