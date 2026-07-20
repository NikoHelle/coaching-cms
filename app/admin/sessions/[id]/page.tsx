import { notFound } from 'next/navigation'
import { getAllDrills, getSessionById } from '@/lib/queries'
import { SessionForm } from '@/components/admin/session-form'

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, allDrills] = await Promise.all([getSessionById(id), getAllDrills()])
  if (!session) notFound()

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">Edit session</h1>
      <SessionForm session={session} allDrills={allDrills} />
    </main>
  )
}
