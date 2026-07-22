import type { Metadata } from 'next'
import { getPublicDrills } from '@/lib/queries'
import { DrillCard } from '@/components/drill-card'
import { Heading1 } from '@/components/ui/headings'
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
      <Heading1>Harjoitepankki</Heading1>
      {tag && (
        <p className="mt-2 text-sm text-ink-soft">
          Suodatettu: <span className="font-bold text-pitch-deep">#{tag}</span>{' '}
          <Link href="/drills" className="underline hover:text-pitch-deep">
            Tyhjennä
          </Link>
        </p>
      )}
      {drills.length === 0 ? (
        <p className="mt-6 text-ink-soft">Harjoitteita ei löytynyt.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {drills.map((drill, index) => (
            <DrillCard key={drill.id} drill={drill} stagger={index} />
          ))}
        </div>
      )}
    </main>
  )
}
