import type { Metadata } from 'next'
import { Manrope, Lilita_One, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext'],
})

const lilita = Lilita_One({
  variable: '--font-lilita',
  weight: '400',
  subsets: ['latin', 'latin-ext'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'HJK United', template: '%s | HJK United' },
  description: 'Jalkapalloharjoitteet ja treenit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fi"
      className={`${manrope.variable} ${lilita.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-paper text-ink antialiased">
        <header className="border-b-2 border-team-line bg-chalk">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-display text-lg text-team-deep">
              <span aria-hidden="true">⚽ </span>
              HJK United 2026-2027
            </Link>
            <Link
              href="/drills"
              className="text-sm font-semibold text-ink-soft transition-colors hover:text-team-deep"
            >
              Harjoitepankki
            </Link>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mt-16 border-t-2 border-team-line py-8">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-4 text-xs text-ink-faint">
            <svg
              aria-hidden="true"
              viewBox="0 0 48 24"
              className="h-6 w-12 text-team-line"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="24" y1="0" x2="24" y2="24" />
              <circle cx="24" cy="12" r="8" />
            </svg>
            <span className="font-display text-sm text-ink-faint">HJK United</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
