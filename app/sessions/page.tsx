import type { Metadata } from 'next'
import { getPublicSessions } from '@/lib/queries'
import { SessionList } from '@/components/session-list'
import { Heading1 } from '@/components/ui/headings'

export const metadata: Metadata = { title: 'Treenit' }

export default async function SessionsPage() {
  const sessions = await getPublicSessions()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Heading1>Treenit</Heading1>
      <SessionList sessions={sessions} />
    </main>
  )
}
