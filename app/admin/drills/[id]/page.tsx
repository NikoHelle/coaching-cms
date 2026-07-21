import { notFound } from 'next/navigation'
import { getDrillById } from '@/lib/queries'
import { DrillForm } from '@/components/admin/drill-form'

export default async function EditDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const drill = await getDrillById(id)
  if (!drill) notFound()

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">Edit drill</h1>
      <DrillForm drill={drill} />
    </main>
  )
}
