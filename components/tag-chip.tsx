import Link from 'next/link'

export function TagChip({ tag }: { tag: string }) {
  return (
    <Link
      href={`/drills?tag=${encodeURIComponent(tag)}`}
      className="inline-block rounded-lg border-2 border-team-line bg-team-tint px-2.5 py-0.5 text-xs font-bold text-team-deep transition-colors hover:border-team hover:bg-team hover:text-white"
    >
      #{tag}
    </Link>
  )
}
