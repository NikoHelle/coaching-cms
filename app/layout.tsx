import type { Metadata } from 'next'
import { Manrope, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'latin-ext'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'Valmennus', template: '%s | Valmennus' },
  description: 'Jalkapalloharjoitteet ja treenit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className={`${manrope.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <header className="border-b">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold">
              <span aria-hidden="true">⚽ </span>
              HJK United 2026-2027
            </Link>
            <Link href="/drills" className="text-sm text-neutral-600 hover:text-neutral-900">
              Harjoitepankki
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
