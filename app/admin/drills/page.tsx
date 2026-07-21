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
          <li key={drill.id} className="flex items-center gap-4 py-4 text-sm">
            <div className="min-w-0 flex-1">
              <div className="min-w-0 flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <Link href={`/admin/drills/${drill.id}`} className="font-medium hover:underline">
                    {drill.title}
                  </Link>
                </div>
                {drill.description && (
                  <p className="truncate text-xs text-neutral-500 line-clamp-1">{drill.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  {drill.tags.map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
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
