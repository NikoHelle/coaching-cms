import ReactMarkdown from 'react-markdown'
import type { Drill } from '@/lib/types'
import { TagChip } from '@/components/tag-chip'
import { VideoEmbed } from '@/components/video-embed'
import { Heading3, Heading4 } from './ui/headings'

export function DrillDetail({ drill }: { drill: Drill }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600">
        {drill.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {drill.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}
        {drill.player_count && (
          <span>
            {drill.player_count} pelaaja(a)
          </span>
        )}
        {drill.duration_minutes > 0 && (
          <span>
            <span aria-hidden="true">⏱ </span>
            {drill.duration_minutes} min
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
          <ReactMarkdown>{drill.description}</ReactMarkdown>
        </section>
      )}

      {drill.focus_points.length > 0 && (
        <section className="drill-section">
          <Heading3>
            Treenin tärkeimmät prinsiipit
          </Heading3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {drill.focus_points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {(drill.dos.length > 0 || drill.donts.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {drill.dos.length > 0 && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <Heading3>Korosta näitä</Heading3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-900">
                {drill.dos.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {drill.donts.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <Heading3>Vältä näitä</Heading3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
                {drill.donts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {drill.video_urls.length > 0 && (
        <section className="flex flex-col gap-6 border border-neutral-200 p-4">
          <Heading3>
            Esimerkkivideot
          </Heading3>
          {drill.video_urls.map((url, index) => (
            <div key={`${index}-${url}`} className="flex flex-col gap-2">
              <Heading4 className="flex items-center gap-2 text-sm font-semibold">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white"
                >
                  {index + 1}
                </span>
                Variaatio {index + 1}
              </Heading4>
              <div className="pt-4">
                <VideoEmbed url={url} variant={index + 1} />
              </div>
            </div>
          ))}
        </section>
      )}


    </div>
  )
}
