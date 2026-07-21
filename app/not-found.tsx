import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl" aria-hidden="true">
        ⚽
      </p>
      <h1 className="text-2xl font-bold">Se meni ohi maalin</h1>
      <p className="text-neutral-600">Tätä sivua ei ole olemassa tai se ei ole julkinen.</p>
      <Link href="/" className="underline">
        Takaisin treeneihin
      </Link>
    </main>
  )
}
