import { notFound } from 'next/navigation'
import { getAllDrills, getSessionById } from '@/lib/queries'
import { SessionForm } from '@/components/admin/session-form'
import { OpenPublicButton } from '@/components/admin/open-public-button'

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, allDrills] = await Promise.all([getSessionById(id), getAllDrills()])
  if (!session) notFound()

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit session</h1>
        {session.status === 'public' && <OpenPublicButton href={`/sessions/${session.slug}`} />}
      </div>
      <SessionForm session={session} allDrills={allDrills} />
    </main>
  )
}
