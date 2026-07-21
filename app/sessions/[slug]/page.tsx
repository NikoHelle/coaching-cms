import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { getPublicSessionBySlug } from '@/lib/queries'
import { DrillDetail } from '@/components/drill-detail'
import { formatSessionDate } from '@/lib/format-date'

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
      <h1 className="text-3xl font-bold">{session.title}</h1>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600">
        {session.session_date && (
          <span>
            <span aria-hidden="true">📅 </span>
            {formatSessionDate(session.session_date)}
          </span>
        )}
        {totalMinutes > 0 && (
          <span>
            <span aria-hidden="true">⏱ </span>
            yhteensä {totalMinutes} min
          </span>
        )}
        <span>{session.items.length} harjoitetta</span>
      </div>

      {session.notes && (
        <div className="prose prose-sm mt-6 max-w-none rounded-xl bg-neutral-100 p-4">
          <ReactMarkdown>{session.notes}</ReactMarkdown>
        </div>
      )}

      <ol className="mt-8 flex flex-col gap-8">
        {session.items.map((item, index) => (
          <li key={item.drill.id} className="rounded-2xl border p-5">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h2 className="text-xl font-bold">{item.drill.title}</h2>
            </div>
            {item.note && (
              <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                <span aria-hidden="true">📝 </span>
                {item.note}
              </p>
            )}
            <DrillDetail drill={item.drill} />
          </li>
        ))}
      </ol>
    </main>
  )
}
