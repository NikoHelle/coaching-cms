import type { Metadata } from 'next'
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'
import { logout } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b bg-neutral-50">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-2 text-sm">
          <span className="font-semibold">Admin</span>
          <Link href="/admin/drills" className="hover:underline">
            Drills
          </Link>
          <Link href="/admin/sessions" className="hover:underline">
            Sessions
          </Link>
          <Link href="/" className="hover:underline">
            View site
          </Link>
          <form action={logout} className="ml-auto">
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
      <Toaster />
    </div>
  )
}
