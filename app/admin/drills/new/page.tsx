import { DrillForm } from '@/components/admin/drill-form'

export default function NewDrillPage() {
  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">New drill</h1>
      <DrillForm drill={null} />
    </main>
  )
}
