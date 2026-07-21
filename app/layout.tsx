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
  title: { default: 'Valmennus', template: '%s | Valmennus' },
  description: 'Jalkapalloharjoitteet ja treenit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <header className="border-b">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold">
              <span aria-hidden="true">⚽ </span>
              Valmennus
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
