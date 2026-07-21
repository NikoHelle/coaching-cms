'use client'

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
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: '#fff',
        border: 0,
        borderRadius: '0.75rem',
        boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
        margin: '1px auto',
        maxWidth: 540,
        minWidth: 326,
        padding: 0,
        width: 'calc(100% - 2px)',
      }}
    >
      <div style={{ padding: 16 }}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Katso Instagramissa
        </a>
      </div>
    </blockquote>
  )
}
