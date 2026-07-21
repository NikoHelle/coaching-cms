import type { Metadata } from 'next'
import { getPublicSessions } from '@/lib/queries'
import { SessionList } from '@/components/session-list'

export const metadata: Metadata = { title: 'Treenit' }

export default async function SessionsPage() {
  const sessions = await getPublicSessions()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Treenit</h1>
      <SessionList sessions={sessions} />
    </main>
  )
}
