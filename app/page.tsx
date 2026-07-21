import Link from 'next/link'
import { getPublicSessions } from '@/lib/queries'
import { formatSessionDate } from '@/lib/format-date'

export default async function HomePage() {
  const sessions = await getPublicSessions()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Treenit</h1>
      {sessions.length === 0 ? (
        <p className="mt-6 text-neutral-600">Treenejä ei ole vielä julkaistu.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/sessions/${session.slug}`}
                className="flex items-baseline justify-between rounded-2xl border p-5 transition-shadow hover:shadow-md"
              >
                <span className="font-semibold">{session.title}</span>
                {session.session_date && (
                  <span className="text-sm text-neutral-500">
                    {formatSessionDate(session.session_date)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
