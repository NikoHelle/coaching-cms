import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'Coaching CMS', template: '%s | Coaching CMS' },
  description: 'Football drills and training sessions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <header className="border-b">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold">
              <span aria-hidden="true">⚽ </span>
              Coaching
            </Link>
            <Link href="/drills" className="text-sm text-neutral-600 hover:text-neutral-900">
              Drill library
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
