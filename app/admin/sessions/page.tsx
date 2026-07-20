import Link from 'next/link'
import { getAllSessions } from '@/lib/queries'
import { deleteSession } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button'

export default async function AdminSessionsPage() {
  const sessions = await getAllSessions()

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sessions</h1>
        <Button render={<Link href="/admin/sessions/new">New session</Link>}>New session</Button>
      </div>
      <ul className="mt-4 flex flex-col divide-y">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-center gap-3 py-2 text-sm">
            <Link
              href={`/admin/sessions/${session.id}`}
              className="flex-1 font-medium hover:underline"
            >
              {session.title}
            </Link>
            {session.session_date && (
              <span className="text-neutral-500">{session.session_date}</span>
            )}
            <Badge variant={session.status === 'public' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
            <form
              action={async () => {
                'use server'
                await deleteSession(session.id)
              }}
            >
              <ConfirmSubmitButton
                message={`Delete session "${session.title}"? Its drills are kept.`}
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </main>
  )
}
