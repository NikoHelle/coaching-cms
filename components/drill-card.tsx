import Link from 'next/link'
import type { Drill } from '@/lib/types'
import { Badge } from './ui/badge'

export function DrillCard({ drill, stagger = 0 }: { drill: Drill; stagger?: number }) {
  return (
    <Link
      href={`/drills/${drill.slug}`}
      className="rise-in block rounded-2xl border-2 border-pitch-line bg-chalk p-5 transition-all hover:-translate-y-0.5 hover:border-pitch hover:shadow-md"
      style={{ '--stagger': stagger } as React.CSSProperties}
    >
      <h2 className="font-display text-xl text-ink">{drill.title}</h2>
      <p className="mt-0.5 font-mono text-xs text-ink-faint">/{drill.slug}</p>
      {drill.purpose && (
        <p className="mt-2 line-clamp-2 text-sm font-semibold text-ink-soft">{drill.purpose}</p>
      )}
      {drill.description && (
        <p className="mt-1 line-clamp-3 text-sm text-ink-faint">{drill.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        {drill.player_count && (
          <span>
            <span aria-hidden="true">👥 </span>
            {drill.player_count}
            <span className="sr-only"> pelaajaa</span>
          </span>
        )}
        {drill.duration_minutes > 0 && (
          <span>
            <span aria-hidden="true">⏱ </span>
            {drill.duration_minutes} min
          </span>
        )}
        {drill.tags.map((tag) => (
          <Badge key={tag} variant="tag">
            {tag}
          </Badge>
        ))}
      </div>
    </Link>
  )
}
