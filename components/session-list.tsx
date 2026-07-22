import Link from 'next/link'
import type { Session } from '@/lib/types'

const DAY_FORMAT = new Intl.DateTimeFormat('fi-FI', {
  day: 'numeric',
  timeZone: 'UTC',
})
const MONTH_FORMAT = new Intl.DateTimeFormat('fi-FI', {
  month: 'short',
  timeZone: 'UTC',
})
const WEEKDAY_FORMAT = new Intl.DateTimeFormat('fi-FI', {
  weekday: 'short',
  timeZone: 'UTC',
})

function isUpcoming(isoDate: string | null): boolean {
  if (!isoDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return isoDate >= today
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p className="mt-6 text-ink-soft">Treenejä ei ole vielä julkaistu.</p>
  }

  // Sessions arrive newest-first; the nearest upcoming one is the last
  // upcoming in that order.
  const upcomingIds = sessions.filter((s) => isUpcoming(s.session_date)).map((s) => s.id)
  const nextId = upcomingIds.at(-1)

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {sessions.map((session, index) => {
        const isNext = session.id === nextId
        const date = session.session_date ? new Date(session.session_date) : null
        return (
          <li key={session.id} className="rise-in" style={{ '--stagger': index } as React.CSSProperties}>
            <Link
              href={`/sessions/${session.slug}`}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 transition-shadow hover:shadow-md ${
                isNext ? 'border-cone bg-cone-tint' : 'border-pitch-line bg-chalk'
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${
                  isNext ? 'bg-cone text-white' : 'bg-pitch-tint text-pitch-deep'
                }`}
              >
                {date ? (
                  <>
                    <span className="font-display text-xl leading-none">
                      {DAY_FORMAT.format(date)}
                    </span>
                    <span className="text-[10px] font-bold uppercase leading-tight">
                      {MONTH_FORMAT.format(date)}
                    </span>
                  </>
                ) : (
                  <span aria-hidden="true" className="text-xl">
                    ⚽
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {isNext && (
                  <p className="text-xs font-bold uppercase tracking-wide text-cone-ink">
                    Seuraavat treenit
                  </p>
                )}
                <p className="truncate font-display text-lg text-ink">{session.title}</p>
                {date && (
                  <p className="text-sm text-ink-faint">{WEEKDAY_FORMAT.format(date)}</p>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
