import { getAllDrills } from '@/lib/queries'
import { SessionForm } from '@/components/admin/session-form'

export default async function NewSessionPage() {
  const allDrills = await getAllDrills()
  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">New session</h1>
      <SessionForm session={null} allDrills={allDrills} />
    </main>
  )
}
