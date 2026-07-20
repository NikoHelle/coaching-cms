import Link from 'next/link'
import type { Drill } from '@/lib/types'

export function DrillCard({ drill }: { drill: Drill }) {
  return (
    <Link
      href={`/drills/${drill.slug}`}
      className="block rounded-2xl border p-5 transition-shadow hover:shadow-md"
    >
      <h2 className="text-lg font-semibold">{drill.title}</h2>
      {drill.purpose && (
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{drill.purpose}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        {drill.player_count && <span>👥 {drill.player_count}</span>}
        {drill.duration_minutes > 0 && <span>⏱ {drill.duration_minutes} min</span>}
        {drill.tags.map((tag) => (
          <span key={tag} className="text-emerald-700">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
