import ReactMarkdown from 'react-markdown'
import type { Drill } from '@/lib/types'
import { TagChip } from '@/components/tag-chip'
import { VideoEmbed } from '@/components/video-embed'
import { Heading3, Heading4 } from './ui/headings'

export function DrillDetail({ drill }: { drill: Drill }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
        {drill.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {drill.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}
        {drill.player_count && (
          <span>
            <span className="font-bold text-ink">{drill.player_count}</span> pelaaja(a)
          </span>
        )}
        {drill.duration_minutes > 0 && (
          <span>
            <span aria-hidden="true">⏱ </span>
            <span className="font-bold text-ink">{drill.duration_minutes} min</span>
          </span>
        )}
      </div>

      {drill.purpose && (
        <section className="drill-section">
          <Heading3>Tarkoitus</Heading3>
          <p>{drill.purpose}</p>
        </section>
      )}

      {drill.description && (
        <section className="drill-section">
          <Heading3>Kuvaus</Heading3>
          <div className="prose prose-sm max-w-none text-ink">
            <ReactMarkdown>{drill.description}</ReactMarkdown>
          </div>
        </section>
      )}

      {drill.focus_points.length > 0 && (
        <section className="drill-section">
          <Heading3>Treenin tärkeimmät prinsiipit</Heading3>
          <ul className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {drill.focus_points.map((point, index) => (
              <li key={`${index}-${point}`} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 font-bold text-pitch">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(drill.dos.length > 0 || drill.donts.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {drill.dos.length > 0 && (
            <section className="flex flex-col gap-2 rounded-2xl border-2 border-pitch-line bg-pitch-tint p-4">
              <Heading3>Korosta näitä</Heading3>
              <ul className="flex flex-col gap-1.5 text-sm font-medium text-pitch-deep">
                {drill.dos.map((item, index) => (
                  <li key={`${index}-${item}`} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-0.5 font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {drill.donts.length > 0 && (
            <section className="flex flex-col gap-2 rounded-2xl bg-clay-tint p-4">
              <Heading3 className="text-clay">Vältä näitä</Heading3>
              <ul className="flex flex-col gap-1.5 text-sm font-medium text-clay">
                {drill.donts.map((item, index) => (
                  <li key={`${index}-${item}`} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-0.5 font-bold">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {drill.video_urls.length > 0 && (
        <section className="flex flex-col gap-4 rounded-2xl border-2 border-pitch-line bg-chalk p-4">
          <Heading3>Esimerkkivideot</Heading3>
          {drill.video_urls.map((url, index) => (
            <div key={`${index}-${url}`} className="flex flex-col gap-2">
              <Heading4 className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cone font-display text-sm text-white"
                >
                  {index + 1}
                </span>
                Variaatio {index + 1}
              </Heading4>
              <VideoEmbed url={url} variant={index + 1} />
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
