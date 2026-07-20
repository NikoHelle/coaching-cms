import ReactMarkdown from 'react-markdown'
import type { Drill } from '@/lib/types'
import { TagChip } from '@/components/tag-chip'
import { VideoEmbed } from '@/components/video-embed'

export function DrillDetail({ drill }: { drill: Drill }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600">
        {drill.player_count && <span>👥 {drill.player_count} players</span>}
        {drill.duration_minutes > 0 && <span>⏱ {drill.duration_minutes} min</span>}
      </div>

      {drill.purpose && (
        <p className="rounded-xl bg-neutral-100 p-4 text-sm font-medium">{drill.purpose}</p>
      )}

      {drill.description && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{drill.description}</ReactMarkdown>
        </div>
      )}

      {drill.focus_points.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Focus points
          </h3>
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
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">Do</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-900">
                {drill.dos.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {drill.donts.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-red-800">Don&apos;t</h3>
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
        <section className="flex flex-col gap-4">
          {drill.video_urls.map((url) => (
            <VideoEmbed key={url} url={url} />
          ))}
        </section>
      )}

      {drill.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {drill.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}
