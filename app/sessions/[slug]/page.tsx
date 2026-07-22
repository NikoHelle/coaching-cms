import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { getPublicSessionBySlug } from '@/lib/queries'
import { DrillDetail } from '@/components/drill-detail'
import { formatSessionDate } from '@/lib/format-date'
import { Heading2, Heading3 } from '@/components/ui/headings'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const session = await getPublicSessionBySlug(slug)
  if (!session) return {}
  return {
    title: session.title,
    description: session.notes.slice(0, 160),
    openGraph: { title: session.title, description: session.notes.slice(0, 160) },
  }
}

export default async function SessionPage({ params }: Props) {
  const { slug } = await params
  const session = await getPublicSessionBySlug(slug)
  if (!session) notFound()

  const totalMinutes = session.items.reduce(
    (sum, item) => sum + item.drill.duration_minutes,
    0
  )

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="rise-in">
        {session.session_date && (
          <p className="text-sm font-bold uppercase tracking-wide text-team">
            {formatSessionDate(session.session_date)}
          </p>
        )}
        <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">{session.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-b-2 border-team-line pb-4 text-sm text-ink-soft">
          {totalMinutes > 0 && (
            <span>
              <span aria-hidden="true">⏱ </span>
              yhteensä <span className="font-bold text-team-deep">{totalMinutes} min</span>
            </span>
          )}
          <span>
            <span className="font-bold text-team-deep">{session.items.length}</span> harjoitetta
          </span>
        </div>
      </header>

      {session.notes && (
        <section
          className="rise-in mt-6 flex flex-col gap-2 rounded-2xl border-2 border-team-line bg-team-tint p-4"
          style={{ '--stagger': 1 } as React.CSSProperties}
        >
          <Heading2 className="text-xl">Treenit tarkeimmät asiat</Heading2>
          <div className="prose prose-sm max-w-none text-ink">
            <ReactMarkdown>{session.notes}</ReactMarkdown>
          </div>
        </section>
      )}

      <Heading2 className="mt-8">Harjoitteet</Heading2>
      <ol className="mt-4 flex flex-col gap-8">
        {session.items.map((item, index) => (
          <li
            key={item.drill.id}
            className="rise-in rounded-2xl border-2 border-team-line bg-chalk p-5 shadow-card"
            style={{ '--stagger': index + 2 } as React.CSSProperties}
          >
            <div className="mb-4 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-team font-display text-2xl text-white"
              >
                {index + 1}
              </span>
              <h2 className="font-display text-2xl text-ink">{item.drill.title}</h2>
            </div>
            {item.note && (
              <div className="mb-4 flex flex-col gap-1 rounded-2xl border-2 border-cone bg-cone-tint p-3 text-sm font-semibold text-cone-ink">
                <Heading3 className="text-cone-ink">Huomautus tähän treeniin</Heading3>
                <p>{item.note}</p>
              </div>
            )}
            <DrillDetail drill={item.drill} visibleVideos={item.video_indexes} />
          </li>
        ))}
      </ol>
    </main>
  )
}
