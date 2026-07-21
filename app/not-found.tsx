import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl" aria-hidden="true">
        ⚽
      </p>
      <h1 className="text-2xl font-bold">That one went over the bar</h1>
      <p className="text-neutral-600">This page doesn&apos;t exist or isn&apos;t public.</p>
      <Link href="/" className="underline">
        Back to sessions
      </Link>
    </main>
  )
}
