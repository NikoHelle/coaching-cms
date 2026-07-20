import Link from 'next/link'
import { getAllDrills } from '@/lib/queries'
import { deleteDrill } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button'

export default async function AdminDrillsPage() {
  const drills = await getAllDrills()

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Drills</h1>
        <Button render={<Link href="/admin/drills/new">New drill</Link>}>New drill</Button>
      </div>
      <ul className="mt-4 flex flex-col divide-y">
        {drills.map((drill) => (
          <li key={drill.id} className="flex items-center gap-3 py-2 text-sm">
            <Link href={`/admin/drills/${drill.id}`} className="flex-1 font-medium hover:underline">
              {drill.title}
            </Link>
            <Badge variant={drill.status === 'public' ? 'default' : 'secondary'}>
              {drill.status}
            </Badge>
            <form
              action={async () => {
                'use server'
                await deleteDrill(drill.id)
              }}
            >
              <ConfirmSubmitButton
                message={`Delete drill "${drill.title}"? It will also be removed from any sessions.`}
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
