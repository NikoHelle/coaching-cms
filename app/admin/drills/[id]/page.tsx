import { notFound } from 'next/navigation'
import { getDrillById } from '@/lib/queries'
import { DrillForm } from '@/components/admin/drill-form'
import { OpenPublicButton } from '@/components/admin/open-public-button'

export default async function EditDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const drill = await getDrillById(id)
  if (!drill) notFound()

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit drill</h1>
        {drill.status === 'public' && <OpenPublicButton href={`/drills/${drill.slug}`} />}
      </div>
      <DrillForm drill={drill} />
    </main>
  )
}
