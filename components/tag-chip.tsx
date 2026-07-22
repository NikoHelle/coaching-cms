import Link from 'next/link'

export function TagChip({ tag }: { tag: string }) {
  return (
    <Link
      href={`/drills?tag=${encodeURIComponent(tag)}`}
      className="inline-block rounded-lg border-2 border-pitch-line bg-pitch-tint px-2.5 py-0.5 text-xs font-bold text-pitch-deep transition-colors hover:border-pitch hover:bg-pitch hover:text-white"
    >
      #{tag}
    </Link>
  )
}
