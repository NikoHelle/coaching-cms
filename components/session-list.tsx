import Link from 'next/link'
import type { Session } from '@/lib/types'
import { formatSessionDate } from '@/lib/format-date'

export function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p className="mt-6 text-neutral-600">Treenejä ei ole vielä julkaistu.</p>
  }

  return (
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
  )
}
