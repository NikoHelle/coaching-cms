import type { Metadata } from 'next'
import { getPublicDrills } from '@/lib/queries'
import { DrillCard } from '@/components/drill-card'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Harjoitepankki' }

export default async function DrillsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const drills = await getPublicDrills(tag)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Harjoitepankki</h1>
      {tag && (
        <p className="mt-2 text-sm text-neutral-600">
          Suodatettu: <span className="font-medium text-emerald-700">#{tag}</span>{' '}
          <Link href="/drills" className="underline">
            Tyhjennä
          </Link>
        </p>
      )}
      {drills.length === 0 ? (
        <p className="mt-6 text-neutral-600">Harjoitteita ei löytynyt.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {drills.map((drill) => (
            <DrillCard key={drill.id} drill={drill} />
          ))}
        </div>
      )}
    </main>
  )
}
