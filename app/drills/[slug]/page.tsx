import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicDrillBySlug } from '@/lib/queries'
import { DrillDetail } from '@/components/drill-detail'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const drill = await getPublicDrillBySlug(slug)
  if (!drill) return {}
  return {
    title: drill.title,
    description: drill.purpose || drill.description.slice(0, 160),
    openGraph: {
      title: drill.title,
      description: drill.purpose || drill.description.slice(0, 160),
    },
  }
}

export default async function DrillPage({ params }: Props) {
  const { slug } = await params
  const drill = await getPublicDrillBySlug(slug)
  if (!drill) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{drill.title}</h1>
      <div className="mt-6">
        <DrillDetail drill={drill} />
      </div>
    </main>
  )
}
