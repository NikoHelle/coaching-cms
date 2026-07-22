'use client'

import { LoaderCircle } from 'lucide-react'
import { useEffect } from 'react'

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

const EMBED_SCRIPT_SRC = 'https://www.instagram.com/embed.js'

export function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    if (window.instgrm) {
      // Script already loaded (e.g. client-side navigation) — blockquotes
      // rendered after its initial pass need an explicit re-process.
      window.instgrm.Embeds.process()
    } else if (!document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = EMBED_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }
  }, [url])

  return (
    <blockquote
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      className="instagram-media bg-white border border-neutral-200 rounded-xl"
    >
      <div className="p-4 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          <span className="text-neutral-500">Ladataan videota...</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline self-end">
          Katso Instagramissa
        </a>
      </div>
    </blockquote>
  )
}
