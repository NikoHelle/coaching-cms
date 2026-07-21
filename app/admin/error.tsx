'use client'

import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex flex-col items-start gap-4 py-8">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-sm text-neutral-600">
        The last action failed{error.digest ? ` (ref ${error.digest})` : ''}. The database may
        have rejected it — check the drill isn&apos;t part of a session, then try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
