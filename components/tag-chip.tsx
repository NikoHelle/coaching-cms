import Link from 'next/link'

export function TagChip({ tag }: { tag: string }) {
  return (
    <Link
      href={`/drills?tag=${encodeURIComponent(tag)}`}
      className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-200"
    >
      {tag}
    </Link>
  )
}
