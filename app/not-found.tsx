import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 200 110"
        className="w-48 text-pitch-line"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      >
        {/* goal posts */}
        <path d="M40 100 V30 H160 V100" />
        {/* net hint */}
        <path d="M55 45 V95 M75 40 V98 M100 38 V98 M125 40 V98 M145 45 V95" strokeWidth="1.5" />
        <path d="M45 55 H155 M43 75 H157" strokeWidth="1.5" />
        {/* ball sailing over the bar */}
        <circle cx="168" cy="14" r="9" className="text-cone" strokeWidth="4" />
      </svg>
      <h1 className="font-display text-3xl text-ink">Se meni ohi maalin</h1>
      <p className="text-ink-soft">Tätä sivua ei ole olemassa tai se ei ole julkinen.</p>
      <Link
        href="/"
        className="rounded-xl border-2 border-pitch bg-pitch px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pitch-deep"
      >
        Takaisin treeneihin
      </Link>
    </main>
  )
}
