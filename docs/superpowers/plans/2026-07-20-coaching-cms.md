# Coaching CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal football-coaching CMS: private admin for creating drills and bundling them into sessions, plus polished mobile-first public share pages, per the spec at `docs/superpowers/specs/2026-07-20-coaching-cms-design.md`.

**Architecture:** One Next.js App Router app. Public pages are server components reading Supabase per-request; admin pages under `/admin` are gated by middleware + Supabase Auth, mutating via zod-validated server actions with `revalidatePath`. Supabase RLS is the real security boundary.

**Tech Stack:** Next.js (App Router, TypeScript), Supabase (Postgres + Auth) via `@supabase/ssr`, Tailwind CSS + shadcn/ui, zod, react-markdown, Vitest, Playwright.

## Global Constraints

- TypeScript strict mode; App Router; **no `src/` dir**; import alias `@/*` → project root.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Real values live only in `.env.local` (git-ignored); `.env.example` holds placeholders.
- Status values are exactly `'public' | 'draft'` everywhere (DB check constraint, zod enum, TS types).
- Slug format: `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Public pages: server components only, no client-side data fetching, mobile-first Tailwind styling, OG meta tags on drill/session pages.
- Unit tests live in `tests/unit/`, e2e in `tests/e2e/`. `npm test` = `vitest run`.
- Commit after every task (and mid-task where steps say so). Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- The repo already contains `CLAUDE.md` and `docs/` — never overwrite or delete them.

---

### Task 1: Scaffold Next.js project + tooling

**Files:**
- Create: entire Next.js scaffold (`package.json`, `app/`, `tsconfig.json`, `next.config.ts`, `.gitignore`, …), `vitest.config.ts`, `tests/unit/.gitkeep`, `.env.example`, `components.json` (shadcn), `components/ui/*` (shadcn), `lib/utils.ts` (shadcn)

**Interfaces:**
- Consumes: nothing (greenfield).
- Produces: runnable Next.js app; `npm test` runs Vitest; shadcn components `Button`, `Input`, `Textarea`, `Label`, `Badge`, `Sonner` available under `@/components/ui/*`; `cn()` from `@/lib/utils`.

- [ ] **Step 1: Scaffold into a temp dir and copy in (project dir is non-empty)**

```bash
cd /Users/nikohelle/projects/coaching-cms
npx create-next-app@latest /tmp/coaching-cms-scaffold --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack --skip-install --yes
rsync -a --exclude .git /tmp/coaching-cms-scaffold/ .
rm -rf /tmp/coaching-cms-scaffold
npm install
```

Expected: `package.json`, `app/`, `tsconfig.json` exist; `npm install` succeeds. Verify `CLAUDE.md` and `docs/` are still present (`ls`).

- [ ] **Step 2: Install runtime + test dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr zod react-markdown
npm install -D vitest
```

- [ ] **Step 3: Init shadcn/ui and add components**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input textarea label badge sonner -y
```

Expected: `components.json`, `components/ui/button.tsx` (etc.), `lib/utils.ts` created.

- [ ] **Step 4: Add Vitest config and test script**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

In `package.json` `scripts`, add/replace:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create empty dir marker `tests/unit/.gitkeep`.

- [ ] **Step 5: Add `.env.example`**

Create `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Confirm `.gitignore` contains `.env*` (create-next-app default does; if not, add `.env*.local` and `.env.local`).

- [ ] **Step 6: Verify dev server and test runner**

```bash
npm test
```

Expected: Vitest exits 0 reporting "no test files found" (passWithNoTests may be needed: if it exits non-zero, add `passWithNoTests: true` to the `test` block in `vitest.config.ts`).

```bash
npm run dev &
sleep 8 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
kill %1
```

Expected: `200`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, shadcn/ui, Vitest"
```

---

### Task 2: Supabase schema, RLS, and seed data

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `supabase/seed.sql`, `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: tables `drills`, `sessions`, `session_drills` with RLS as specified; seed rows: public drill `rondo-4v2`, public session `sample-session` containing it (used by the Playwright smoke test in Task 12).

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_init.sql`:

```sql
create table drills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  purpose text not null default '',
  player_count text not null default '',
  duration_minutes int not null default 0,
  focus_points text[] not null default '{}',
  dos text[] not null default '{}',
  donts text[] not null default '{}',
  video_urls text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('public', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drills_tags_idx on drills using gin (tags);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  session_date date,
  notes text not null default '',
  status text not null default 'draft' check (status in ('public', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table session_drills (
  session_id uuid not null references sessions(id) on delete cascade,
  drill_id uuid not null references drills(id) on delete cascade,
  position int not null,
  note text,
  primary key (session_id, drill_id)
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger drills_updated_at before update on drills
  for each row execute function set_updated_at();
create trigger sessions_updated_at before update on sessions
  for each row execute function set_updated_at();

alter table drills enable row level security;
alter table sessions enable row level security;
alter table session_drills enable row level security;

-- Anonymous read: public drills, plus draft drills referenced by a public
-- session (the session share page must render them; they still have no
-- public drill page because page queries filter status = 'public').
create policy "anon read public drills" on drills for select to anon
  using (
    status = 'public'
    or exists (
      select 1 from session_drills sd
      join sessions s on s.id = sd.session_id
      where sd.drill_id = drills.id and s.status = 'public'
    )
  );

create policy "anon read public sessions" on sessions for select to anon
  using (status = 'public');

create policy "anon read public session_drills" on session_drills for select to anon
  using (
    exists (
      select 1 from sessions s
      where s.id = session_drills.session_id and s.status = 'public'
    )
  );

-- Single authenticated user (the coach) gets full access.
create policy "auth full drills" on drills for all to authenticated
  using (true) with check (true);
create policy "auth full sessions" on sessions for all to authenticated
  using (true) with check (true);
create policy "auth full session_drills" on session_drills for all to authenticated
  using (true) with check (true);
```

- [ ] **Step 2: Write the seed**

Create `supabase/seed.sql`:

```sql
insert into drills (slug, title, description, purpose, player_count, duration_minutes,
                    focus_points, dos, donts, video_urls, tags, status)
values (
  'rondo-4v2',
  'Rondo 4v2',
  'Four attackers keep the ball in a 8x8m grid against two defenders. Defender who wins the ball swaps with the attacker who lost it.',
  'Quick passing and support angles under pressure.',
  '6',
  15,
  array['first touch', 'passing angles', 'scanning'],
  array['move immediately after passing', 'open your body to see the whole grid'],
  array['do not stand behind a defender', 'no hopeful first-time smashes'],
  array['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  array['passing', 'warm-up'],
  'public'
);

insert into sessions (slug, title, session_date, notes, status)
values ('sample-session', 'Sample Training Session', current_date,
        'Bring both light and dark shirts. We focus on passing today.', 'public');

insert into session_drills (session_id, drill_id, position, note)
select s.id, d.id, 1, 'Only 10 minutes today, weak foot only.'
from sessions s, drills d
where s.slug = 'sample-session' and d.slug = 'rondo-4v2';
```

- [ ] **Step 3: Write README with Supabase setup instructions**

Create `README.md`:

```markdown
# Coaching CMS

Personal tool for creating football drills and bundling them into training
sessions with public, login-free share pages.

## One-time Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`, then
   `supabase/seed.sql`.
3. In **Authentication → Sign In / Up**, disable public sign-ups.
4. In **Authentication → Users**, add your own user (email + password).
5. Copy `.env.example` to `.env.local` and fill in the Project URL and anon
   key from **Project Settings → API**.

## Develop

    npm install
    npm run dev        # http://localhost:3000
    npm test           # unit tests (Vitest)
    npm run test:e2e   # smoke test (Playwright, needs seeded Supabase + .env.local)

## Deploy

Push to GitHub, import the repo in Vercel, set the two env vars from
`.env.example` in the Vercel project settings.
```

- [ ] **Step 4: Apply migration + seed to the Supabase project**

Manual gate: requires a Supabase project. If `.env.local` does not exist yet, **stop and ask the user** to complete README steps 1–5, then continue. Verify with:

```bash
set -a && source .env.local && set +a
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/drills?select=slug&status=eq.public" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

Expected: `[{"slug":"rondo-4v2"}]`

- [ ] **Step 5: Commit**

```bash
git add supabase README.md
git commit -m "feat: add Supabase schema, RLS policies, and seed data"
```

---

### Task 3: Slug generation (TDD)

**Files:**
- Create: `lib/slug.ts`
- Test: `tests/unit/slug.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `slugify(input: string): string` — used by drill/session forms (Tasks 10, 11).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/slug.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Rondo 4v2')).toBe('rondo-4v2')
  })

  it('strips diacritics', () => {
    expect(slugify('Syöttöharjoitus')).toBe('syottoharjoitus')
  })

  it('collapses punctuation runs into single hyphens', () => {
    expect(slugify("Dos & Don'ts!!")).toBe('dos-don-ts')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  Hello  ')).toBe('hello')
  })

  it('returns empty string for symbol-only input', () => {
    expect(slugify('!!!')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/slug`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/slug.ts`:

```ts
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts tests/unit/slug.test.ts
git commit -m "feat: add slugify"
```

---

### Task 4: Video URL parsing (TDD)

**Files:**
- Create: `lib/video.ts`
- Test: `tests/unit/video.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  type VideoEmbedInfo =
    | { kind: 'youtube'; embedUrl: string }
    | { kind: 'instagram'; embedUrl: string }
    | { kind: 'link' }
  function parseVideoUrl(url: string): VideoEmbedInfo
  ```
  Used by the `VideoEmbed` component (Task 8).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/video.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseVideoUrl } from '@/lib/video'

describe('parseVideoUrl', () => {
  it('parses youtube watch URLs', () => {
    expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('parses youtu.be short URLs', () => {
    expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('parses youtube shorts URLs', () => {
    expect(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('parses instagram reel URLs', () => {
    expect(parseVideoUrl('https://www.instagram.com/reel/Cxyz123abcd/')).toEqual({
      kind: 'instagram',
      embedUrl: 'https://www.instagram.com/reel/Cxyz123abcd/embed',
    })
  })

  it('parses instagram post URLs', () => {
    expect(parseVideoUrl('https://www.instagram.com/p/Cxyz123abcd/')).toEqual({
      kind: 'instagram',
      embedUrl: 'https://www.instagram.com/p/Cxyz123abcd/embed',
    })
  })

  it('falls back to link for unknown URLs', () => {
    expect(parseVideoUrl('https://example.com/video')).toEqual({ kind: 'link' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/video`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/video.ts`:

```ts
export type VideoEmbedInfo =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'instagram'; embedUrl: string }
  | { kind: 'link' }

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
]

export function parseVideoUrl(url: string): VideoEmbedInfo {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match) {
      return { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${match[1]}` }
    }
  }
  const instagram = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)
  if (instagram) {
    return {
      kind: 'instagram',
      embedUrl: `https://www.instagram.com/${instagram[1]}/${instagram[2]}/embed`,
    }
  }
  return { kind: 'link' }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass (11 total with Task 3).

- [ ] **Step 5: Commit**

```bash
git add lib/video.ts tests/unit/video.test.ts
git commit -m "feat: add video URL parsing for YouTube and Instagram embeds"
```

---

### Task 5: Zod schemas (TDD)

**Files:**
- Create: `lib/schemas.ts`
- Test: `tests/unit/schemas.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  const SLUG_REGEX: RegExp
  const drillSchema: z.ZodType   // → DrillInput
  const sessionSchema: z.ZodType // → SessionInput (includes drills: {drill_id, note}[])
  type DrillInput = z.infer<typeof drillSchema>
  type SessionInput = z.infer<typeof sessionSchema>
  ```
  Used by server actions (Tasks 10, 11) and forms.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { drillSchema, sessionSchema } from '@/lib/schemas'

describe('drillSchema', () => {
  it('parses a minimal drill and applies defaults', () => {
    const result = drillSchema.parse({ title: 'Rondo 4v2', slug: 'rondo-4v2' })
    expect(result.status).toBe('draft')
    expect(result.focus_points).toEqual([])
    expect(result.duration_minutes).toBe(0)
  })

  it('coerces duration from string input', () => {
    const result = drillSchema.parse({ title: 'X', slug: 'x', duration_minutes: '15' })
    expect(result.duration_minutes).toBe(15)
  })

  it('rejects invalid slugs', () => {
    expect(drillSchema.safeParse({ title: 'X', slug: 'Bad Slug!' }).success).toBe(false)
  })

  it('rejects invalid status', () => {
    expect(drillSchema.safeParse({ title: 'X', slug: 'x', status: 'hidden' }).success).toBe(false)
  })

  it('rejects non-URL video entries', () => {
    expect(drillSchema.safeParse({ title: 'X', slug: 'x', video_urls: ['not a url'] }).success).toBe(false)
  })
})

describe('sessionSchema', () => {
  it('parses a session with drill items', () => {
    const result = sessionSchema.parse({
      title: 'U12 Tuesday',
      slug: 'u12-tuesday',
      drills: [{ drill_id: '2c1f4c9e-4b7a-4b0e-9f3e-1a2b3c4d5e6f', note: 'weak foot' }],
    })
    expect(result.drills).toHaveLength(1)
    expect(result.session_date).toBeNull()
  })

  it('rejects non-uuid drill ids', () => {
    expect(
      sessionSchema.safeParse({
        title: 'X',
        slug: 'x',
        drills: [{ drill_id: 'nope', note: '' }],
      }).success
    ).toBe(false)
  })

  it('accepts an ISO date string', () => {
    const result = sessionSchema.parse({ title: 'X', slug: 'x', session_date: '2026-07-22' })
    expect(result.session_date).toBe('2026-07-22')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/schemas`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/schemas.ts`:

```ts
import { z } from 'zod'

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const drillSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(SLUG_REGEX, 'Slug must be lowercase-hyphenated'),
  description: z.string().default(''),
  purpose: z.string().default(''),
  player_count: z.string().default(''),
  duration_minutes: z.coerce.number().int().min(0).default(0),
  focus_points: z.array(z.string().min(1)).default([]),
  dos: z.array(z.string().min(1)).default([]),
  donts: z.array(z.string().min(1)).default([]),
  video_urls: z.array(z.string().url()).default([]),
  tags: z.array(z.string().min(1)).default([]),
  status: z.enum(['public', 'draft']).default('draft'),
})

export type DrillInput = z.infer<typeof drillSchema>

export const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(SLUG_REGEX, 'Slug must be lowercase-hyphenated'),
  session_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .nullable()
    .default(null),
  notes: z.string().default(''),
  status: z.enum(['public', 'draft']).default('draft'),
  drills: z
    .array(z.object({ drill_id: z.string().uuid(), note: z.string().default('') }))
    .default([]),
})

export type SessionInput = z.infer<typeof sessionSchema>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: all tests pass (19 total).

- [ ] **Step 5: Commit**

```bash
git add lib/schemas.ts tests/unit/schemas.test.ts
git commit -m "feat: add zod schemas for drill and session input"
```

---

### Task 6: Supabase clients, auth middleware, login/logout

**Files:**
- Create: `lib/supabase/server.ts`, `middleware.ts`, `lib/auth-actions.ts`, `app/login/page.tsx`

**Interfaces:**
- Consumes: env vars from Global Constraints.
- Produces:
  - `createClient(): Promise<SupabaseClient>` from `@/lib/supabase/server` — every query and action uses this.
  - Server actions `login(formData: FormData): Promise<void>` and `logout(): Promise<void>` from `@/lib/auth-actions`.
  - Middleware redirecting unauthenticated `/admin/*` requests to `/login`.

- [ ] **Step 1: Server Supabase client**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — middleware refreshes sessions.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Middleware gating /admin**

Create `middleware.ts` (project root):

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 3: Login/logout server actions**

Create `lib/auth-actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }
  redirect('/admin/drills')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

- [ ] **Step 4: Login page**

Create `app/login/page.tsx`:

```tsx
import { login } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Coach sign in</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form action={login} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit">Sign in</Button>
      </form>
    </main>
  )
}
```

- [ ] **Step 5: Verify manually**

```bash
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/admin/drills
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
kill %1
```

Expected: first prints `307 http://localhost:3000/login` (redirect), second prints `200`. Then sign in via the browser with the Supabase user to confirm login works (lands on `/admin/drills` — 404 for now is fine, the redirect happening is the check).

- [ ] **Step 6: Commit**

```bash
git add lib/supabase middleware.ts lib/auth-actions.ts app/login
git commit -m "feat: add Supabase auth with middleware-gated admin and login page"
```

---

### Task 7: Types and query layer

**Files:**
- Create: `lib/types.ts`, `lib/queries.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`.
- Produces (all from `@/lib/queries`, types from `@/lib/types`):
  ```ts
  // types
  type Drill = { id: string; slug: string; title: string; description: string;
    purpose: string; player_count: string; duration_minutes: number;
    focus_points: string[]; dos: string[]; donts: string[]; video_urls: string[];
    tags: string[]; status: 'public' | 'draft'; created_at: string; updated_at: string }
  type Session = { id: string; slug: string; title: string; session_date: string | null;
    notes: string; status: 'public' | 'draft'; created_at: string; updated_at: string }
  type SessionDrillItem = { position: number; note: string | null; drill: Drill }
  type SessionWithDrills = Session & { items: SessionDrillItem[] }

  // public queries
  getPublicSessions(): Promise<Session[]>
  getPublicDrills(tag?: string): Promise<Drill[]>
  getPublicDrillBySlug(slug: string): Promise<Drill | null>
  getPublicSessionBySlug(slug: string): Promise<SessionWithDrills | null>

  // admin queries (RLS returns full data only when authenticated)
  getAllDrills(): Promise<Drill[]>
  getDrillById(id: string): Promise<Drill | null>
  getAllSessions(): Promise<Session[]>
  getSessionById(id: string): Promise<SessionWithDrills | null>
  ```

- [ ] **Step 1: Write types**

Create `lib/types.ts`:

```ts
export type Drill = {
  id: string
  slug: string
  title: string
  description: string
  purpose: string
  player_count: string
  duration_minutes: number
  focus_points: string[]
  dos: string[]
  donts: string[]
  video_urls: string[]
  tags: string[]
  status: 'public' | 'draft'
  created_at: string
  updated_at: string
}

export type Session = {
  id: string
  slug: string
  title: string
  session_date: string | null
  notes: string
  status: 'public' | 'draft'
  created_at: string
  updated_at: string
}

export type SessionDrillItem = {
  position: number
  note: string | null
  drill: Drill
}

export type SessionWithDrills = Session & { items: SessionDrillItem[] }
```

- [ ] **Step 2: Write queries**

Create `lib/queries.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import type { Drill, Session, SessionWithDrills } from '@/lib/types'

const SESSION_WITH_DRILLS_SELECT = '*, session_drills(position, note, drill:drills(*))'

type SessionRow = Session & {
  session_drills: { position: number; note: string | null; drill: Drill }[]
}

function toSessionWithDrills(row: SessionRow): SessionWithDrills {
  const { session_drills, ...session } = row
  return {
    ...session,
    items: [...session_drills].sort((a, b) => a.position - b.position),
  }
}

export async function getPublicSessions(): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'public')
    .order('session_date', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data
}

export async function getPublicDrills(tag?: string): Promise<Drill[]> {
  const supabase = await createClient()
  let query = supabase.from('drills').select('*').eq('status', 'public').order('title')
  if (tag) query = query.contains('tags', [tag])
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPublicDrillBySlug(slug: string): Promise<Drill | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('drills')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'public')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getPublicSessionBySlug(slug: string): Promise<SessionWithDrills | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_WITH_DRILLS_SELECT)
    .eq('slug', slug)
    .eq('status', 'public')
    .maybeSingle()
  if (error) throw error
  return data ? toSessionWithDrills(data as unknown as SessionRow) : null
}

export async function getAllDrills(): Promise<Drill[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('drills').select('*').order('title')
  if (error) throw error
  return data
}

export async function getDrillById(id: string): Promise<Drill | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('drills').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getAllSessions(): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSessionById(id: string): Promise<SessionWithDrills | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_WITH_DRILLS_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? toSessionWithDrills(data as unknown as SessionRow) : null
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/queries.ts
git commit -m "feat: add typed Supabase query layer"
```

---

### Task 8: Public UI components

**Files:**
- Create: `components/tag-chip.tsx`, `components/video-embed.tsx`, `components/drill-detail.tsx`, `components/drill-card.tsx`

**Interfaces:**
- Consumes: `parseVideoUrl` (Task 4), `Drill` type (Task 7).
- Produces:
  ```tsx
  <TagChip tag={string} />                 // links to /drills?tag=…
  <VideoEmbed url={string} />              // iframe or fallback link
  <DrillCard drill={Drill} />              // summary card linking to /drills/[slug]
  <DrillDetail drill={Drill} />            // full drill body (no <h1>; page owns the title)
  ```

- [ ] **Step 1: TagChip**

Create `components/tag-chip.tsx`:

```tsx
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
```

- [ ] **Step 2: VideoEmbed**

Create `components/video-embed.tsx`:

```tsx
import { parseVideoUrl } from '@/lib/video'

export function VideoEmbed({ url }: { url: string }) {
  const info = parseVideoUrl(url)

  if (info.kind === 'youtube') {
    return (
      <iframe
        src={info.embedUrl}
        className="aspect-video w-full rounded-xl border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Drill video"
      />
    )
  }

  if (info.kind === 'instagram') {
    return (
      <iframe
        src={info.embedUrl}
        className="mx-auto aspect-[9/16] w-full max-w-sm rounded-xl border-0"
        loading="lazy"
        title="Drill video"
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border p-4 text-sm text-emerald-700 underline"
    >
      Watch video: {url}
    </a>
  )
}
```

- [ ] **Step 3: DrillDetail**

Create `components/drill-detail.tsx`:

```tsx
import ReactMarkdown from 'react-markdown'
import type { Drill } from '@/lib/types'
import { TagChip } from '@/components/tag-chip'
import { VideoEmbed } from '@/components/video-embed'

export function DrillDetail({ drill }: { drill: Drill }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600">
        {drill.player_count && <span>👥 {drill.player_count} players</span>}
        {drill.duration_minutes > 0 && <span>⏱ {drill.duration_minutes} min</span>}
      </div>

      {drill.purpose && (
        <p className="rounded-xl bg-neutral-100 p-4 text-sm font-medium">{drill.purpose}</p>
      )}

      {drill.description && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{drill.description}</ReactMarkdown>
        </div>
      )}

      {drill.focus_points.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Focus points
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {drill.focus_points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {(drill.dos.length > 0 || drill.donts.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {drill.dos.length > 0 && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">Do</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-900">
                {drill.dos.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {drill.donts.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-red-800">Don&apos;t</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
                {drill.donts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {drill.video_urls.length > 0 && (
        <section className="flex flex-col gap-4">
          {drill.video_urls.map((url) => (
            <VideoEmbed key={url} url={url} />
          ))}
        </section>
      )}

      {drill.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {drill.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: DrillCard**

Create `components/drill-card.tsx`:

```tsx
import Link from 'next/link'
import type { Drill } from '@/lib/types'

export function DrillCard({ drill }: { drill: Drill }) {
  return (
    <Link
      href={`/drills/${drill.slug}`}
      className="block rounded-2xl border p-5 transition-shadow hover:shadow-md"
    >
      <h2 className="text-lg font-semibold">{drill.title}</h2>
      {drill.purpose && (
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{drill.purpose}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        {drill.player_count && <span>👥 {drill.player_count}</span>}
        {drill.duration_minutes > 0 && <span>⏱ {drill.duration_minutes} min</span>}
        {drill.tags.map((tag) => (
          <span key={tag} className="text-emerald-700">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
```

Note: tags inside `DrillCard` are plain text, not `TagChip` — nested `<a>` inside the card link is invalid HTML.

- [ ] **Step 5: Verify it compiles, commit**

Run: `npx tsc --noEmit` — expected: no errors.

```bash
git add components
git commit -m "feat: add public UI components (TagChip, VideoEmbed, DrillDetail, DrillCard)"
```

---

### Task 9: Public pages

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (only if scaffold demo styles conflict)
- Create: `app/drills/page.tsx`, `app/drills/[slug]/page.tsx`, `app/sessions/[slug]/page.tsx`, `app/not-found.tsx`
- Delete: scaffold demo content in `app/page.tsx` (replaced)

**Interfaces:**
- Consumes: queries (Task 7), components (Task 8).
- Produces: all public routes from the spec, with OG metadata and `notFound()` handling.

- [ ] **Step 1: Root layout with nav**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Coaching CMS', template: '%s | Coaching CMS' },
  description: 'Football drills and training sessions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <header className="border-b">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold">
              ⚽ Coaching
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
```

- [ ] **Step 2: Home page (session list)**

Replace `app/page.tsx`:

```tsx
import Link from 'next/link'
import { getPublicSessions } from '@/lib/queries'

export default async function HomePage() {
  const sessions = await getPublicSessions()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Training sessions</h1>
      {sessions.length === 0 ? (
        <p className="mt-6 text-neutral-600">No sessions published yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/sessions/${session.slug}`}
                className="flex items-baseline justify-between rounded-2xl border p-5 transition-shadow hover:shadow-md"
              >
                <span className="font-semibold">{session.title}</span>
                {session.session_date && (
                  <span className="text-sm text-neutral-500">{session.session_date}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Drill library with tag filter**

Create `app/drills/page.tsx`:

```tsx
import { getPublicDrills } from '@/lib/queries'
import { DrillCard } from '@/components/drill-card'
import Link from 'next/link'

export const metadata = { title: 'Drill library' }

export default async function DrillsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const drills = await getPublicDrills(tag)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Drill library</h1>
      {tag && (
        <p className="mt-2 text-sm text-neutral-600">
          Filtered by <span className="font-medium text-emerald-700">#{tag}</span>{' '}
          <Link href="/drills" className="underline">
            clear
          </Link>
        </p>
      )}
      {drills.length === 0 ? (
        <p className="mt-6 text-neutral-600">No drills found.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {drills.map((drill) => (
            <DrillCard key={drill.id} drill={drill} />
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Drill page with OG metadata**

Create `app/drills/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicDrillBySlug } from '@/lib/queries'
import { DrillDetail } from '@/components/drill-detail'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const drill = await getPublicDrillBySlug(slug)
  if (!drill) return {}
  return {
    title: drill.title,
    description: drill.purpose || drill.description.slice(0, 160),
    openGraph: {
      title: drill.title,
      description: drill.purpose || drill.description.slice(0, 160),
    },
  }
}

export default async function DrillPage({ params }: Props) {
  const { slug } = await params
  const drill = await getPublicDrillBySlug(slug)
  if (!drill) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{drill.title}</h1>
      <div className="mt-6">
        <DrillDetail drill={drill} />
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Session page**

Create `app/sessions/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { getPublicSessionBySlug } from '@/lib/queries'
import { DrillDetail } from '@/components/drill-detail'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const session = await getPublicSessionBySlug(slug)
  if (!session) return {}
  return {
    title: session.title,
    description: session.notes.slice(0, 160),
    openGraph: { title: session.title, description: session.notes.slice(0, 160) },
  }
}

export default async function SessionPage({ params }: Props) {
  const { slug } = await params
  const session = await getPublicSessionBySlug(slug)
  if (!session) notFound()

  const totalMinutes = session.items.reduce(
    (sum, item) => sum + item.drill.duration_minutes,
    0
  )

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{session.title}</h1>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600">
        {session.session_date && <span>📅 {session.session_date}</span>}
        {totalMinutes > 0 && <span>⏱ {totalMinutes} min total</span>}
        <span>{session.items.length} drills</span>
      </div>

      {session.notes && (
        <div className="prose prose-sm mt-6 max-w-none rounded-xl bg-neutral-100 p-4">
          <ReactMarkdown>{session.notes}</ReactMarkdown>
        </div>
      )}

      <ol className="mt-8 flex flex-col gap-8">
        {session.items.map((item, index) => (
          <li key={item.drill.id} className="rounded-2xl border p-5">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h2 className="text-xl font-bold">{item.drill.title}</h2>
            </div>
            {item.note && (
              <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                📝 {item.note}
              </p>
            )}
            <DrillDetail drill={item.drill} />
          </li>
        ))}
      </ol>
    </main>
  )
}
```

- [ ] **Step 6: Not-found page**

Create `app/not-found.tsx`:

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl">⚽</p>
      <h1 className="text-2xl font-bold">That one went over the bar</h1>
      <p className="text-neutral-600">This page doesn&apos;t exist or isn&apos;t public.</p>
      <Link href="/" className="underline">
        Back to sessions
      </Link>
    </main>
  )
}
```

- [ ] **Step 7: Verify against seed data**

Requires Task 2's seed applied and `.env.local` filled.

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/ | grep -c "Sample Training Session"
curl -s http://localhost:3000/drills/rondo-4v2 | grep -c "Rondo 4v2"
curl -s http://localhost:3000/sessions/sample-session | grep -c "weak foot"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/drills/nope
kill %1
```

Expected: three non-zero counts, then `404`.

- [ ] **Step 8: Commit**

```bash
git add app components
git commit -m "feat: add public pages (home, drill library, drill, session, 404)"
```

---

### Task 10: Admin drills CRUD

**Files:**
- Create: `lib/actions.ts`, `app/admin/layout.tsx`, `app/admin/drills/page.tsx`, `app/admin/drills/new/page.tsx`, `app/admin/drills/[id]/page.tsx`, `components/admin/list-field-editor.tsx`, `components/admin/drill-form.tsx`

**Interfaces:**
- Consumes: `drillSchema`/`DrillInput` (Task 5), `slugify` (Task 3), queries (Task 7), shadcn components (Task 1), `logout` (Task 6).
- Produces (from `@/lib/actions`):
  ```ts
  saveDrill(id: string | null, input: unknown): Promise<{ error: string } | void> // redirects on success
  deleteDrill(id: string): Promise<void>
  ```
  Plus `<ListFieldEditor label values onChange placeholder? />` reused by Task 11's form.

- [ ] **Step 1: Drill server actions**

Create `lib/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { drillSchema } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/server'

function formatZodError(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
}

export async function saveDrill(
  id: string | null,
  input: unknown
): Promise<{ error: string } | void> {
  const parsed = drillSchema.safeParse(input)
  if (!parsed.success) return { error: formatZodError(parsed.error.issues) }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from('drills').update(parsed.data).eq('id', id)
    : await supabase.from('drills').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/admin/drills')
}

export async function deleteDrill(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('drills').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 2: Admin layout**

Create `app/admin/layout.tsx`:

```tsx
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'
import { logout } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Admin' }

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
```

- [ ] **Step 3: ListFieldEditor**

Create `components/admin/list-field-editor.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ListFieldEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  function add() {
    const value = draft.trim()
    if (!value) return
    onChange([...values, value])
    setDraft('')
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= values.length) return
    const next = [...values]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <ul className="flex flex-col gap-1">
        {values.map((value, index) => (
          <li key={`${value}-${index}`} className="flex items-center gap-1 text-sm">
            <span className="flex-1 rounded border bg-neutral-50 px-2 py-1">{value}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)}>
              ↑
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)}>
              ↓
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: DrillForm**

Create `components/admin/drill-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Drill } from '@/lib/types'
import type { DrillInput } from '@/lib/schemas'
import { slugify } from '@/lib/slug'
import { saveDrill } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ListFieldEditor } from '@/components/admin/list-field-editor'

const EMPTY: DrillInput = {
  title: '',
  slug: '',
  description: '',
  purpose: '',
  player_count: '',
  duration_minutes: 0,
  focus_points: [],
  dos: [],
  donts: [],
  video_urls: [],
  tags: [],
  status: 'draft',
}

export function DrillForm({ drill }: { drill: Drill | null }) {
  const [form, setForm] = useState<DrillInput>(() =>
    drill
      ? {
          title: drill.title,
          slug: drill.slug,
          description: drill.description,
          purpose: drill.purpose,
          player_count: drill.player_count,
          duration_minutes: drill.duration_minutes,
          focus_points: drill.focus_points,
          dos: drill.dos,
          donts: drill.donts,
          video_urls: drill.video_urls,
          tags: drill.tags,
          status: drill.status,
        }
      : EMPTY
  )
  const [tagsText, setTagsText] = useState(drill ? drill.tags.join(', ') : '')
  const [slugTouched, setSlugTouched] = useState(Boolean(drill))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof DrillInput>(key: K, value: DrillInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    const payload = {
      ...form,
      tags: tagsText.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    }
    const result = await saveDrill(drill?.id ?? null, payload)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          required
          onChange={(e) => {
            set('title', e.target.value)
            if (!slugTouched) set('slug', slugify(e.target.value))
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={form.slug}
          required
          onChange={(e) => {
            setSlugTouched(true)
            set('slug', e.target.value)
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Input id="purpose" value={form.purpose} onChange={(e) => set('purpose', e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (markdown)</Label>
        <Textarea
          id="description"
          rows={8}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="player_count">Player count</Label>
          <Input
            id="player_count"
            value={form.player_count}
            placeholder="e.g. 8–12"
            onChange={(e) => set('player_count', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            value={form.duration_minutes}
            onChange={(e) => set('duration_minutes', Number(e.target.value))}
          />
        </div>
      </div>

      <ListFieldEditor
        label="Focus points"
        values={form.focus_points}
        onChange={(v) => set('focus_points', v)}
      />
      <ListFieldEditor label="Dos" values={form.dos} onChange={(v) => set('dos', v)} />
      <ListFieldEditor label="Don'ts" values={form.donts} onChange={(v) => set('donts', v)} />
      <ListFieldEditor
        label="Video URLs (YouTube / Instagram)"
        values={form.video_urls}
        onChange={(v) => set('video_urls', v)}
        placeholder="https://…"
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tagsText}
          placeholder="passing, warm-up"
          onChange={(e) => setTagsText(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="h-9 rounded-md border px-3 text-sm"
          value={form.status}
          onChange={(e) => set('status', e.target.value as DrillInput['status'])}
        >
          <option value="draft">Draft</option>
          <option value="public">Public</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save drill'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Admin drill pages**

Create `app/admin/drills/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllDrills } from '@/lib/queries'
import { deleteDrill } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminDrillsPage() {
  const drills = await getAllDrills()

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Drills</h1>
        <Button asChild>
          <Link href="/admin/drills/new">New drill</Link>
        </Button>
      </div>
      <ul className="mt-4 flex flex-col divide-y">
        {drills.map((drill) => (
          <li key={drill.id} className="flex items-center gap-3 py-2 text-sm">
            <Link href={`/admin/drills/${drill.id}`} className="flex-1 font-medium hover:underline">
              {drill.title}
            </Link>
            <Badge variant={drill.status === 'public' ? 'default' : 'secondary'}>
              {drill.status}
            </Badge>
            <form
              action={async () => {
                'use server'
                await deleteDrill(drill.id)
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Delete
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

Create `app/admin/drills/new/page.tsx`:

```tsx
import { DrillForm } from '@/components/admin/drill-form'

export default function NewDrillPage() {
  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">New drill</h1>
      <DrillForm drill={null} />
    </main>
  )
}
```

Create `app/admin/drills/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getDrillById } from '@/lib/queries'
import { DrillForm } from '@/components/admin/drill-form'

export default async function EditDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const drill = await getDrillById(id)
  if (!drill) notFound()

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">Edit drill</h1>
      <DrillForm drill={drill} />
    </main>
  )
}
```

- [ ] **Step 6: Verify manually**

`npx tsc --noEmit` — no errors. Then in the browser (`npm run dev`), sign in, and:
1. Create a drill with focus points, a YouTube URL, tags, status public. Expect redirect to `/admin/drills` and the drill visible at `/drills/<its-slug>`.
2. Edit it (change title), save, confirm the change on the public page.
3. Delete it, confirm it disappears from `/drills`.
4. Submit a drill with an invalid video URL — expect an error toast, no crash.

- [ ] **Step 7: Commit**

```bash
git add lib/actions.ts app/admin components/admin
git commit -m "feat: add admin drill CRUD with list-field editor form"
```

---

### Task 11: Admin sessions CRUD (session builder)

**Files:**
- Modify: `lib/actions.ts` (append session actions)
- Create: `components/admin/session-form.tsx`, `app/admin/sessions/page.tsx`, `app/admin/sessions/new/page.tsx`, `app/admin/sessions/[id]/page.tsx`

**Interfaces:**
- Consumes: `sessionSchema`/`SessionInput` (Task 5), `slugify` (Task 3), queries (Task 7), `ListFieldEditor` pattern components (Task 10), shadcn components.
- Produces (appended to `@/lib/actions`):
  ```ts
  saveSession(id: string | null, input: unknown): Promise<{ error: string } | void> // redirects on success
  deleteSession(id: string): Promise<void>
  ```

- [ ] **Step 1: Session server actions**

Append to `lib/actions.ts` (add `sessionSchema` to the existing `@/lib/schemas` import):

```ts
export async function saveSession(
  id: string | null,
  input: unknown
): Promise<{ error: string } | void> {
  const parsed = sessionSchema.safeParse(input)
  if (!parsed.success) return { error: formatZodError(parsed.error.issues) }

  const { drills, ...sessionData } = parsed.data
  const supabase = await createClient()

  let sessionId = id
  if (id) {
    const { error } = await supabase.from('sessions').update(sessionData).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select('id')
      .single()
    if (error) return { error: error.message }
    sessionId = data.id
  }

  const { error: clearError } = await supabase
    .from('session_drills')
    .delete()
    .eq('session_id', sessionId!)
  if (clearError) return { error: clearError.message }

  if (drills.length > 0) {
    const rows = drills.map((item, index) => ({
      session_id: sessionId!,
      drill_id: item.drill_id,
      position: index + 1,
      note: item.note || null,
    }))
    const { error: insertError } = await supabase.from('session_drills').insert(rows)
    if (insertError) return { error: insertError.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin/sessions')
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 2: SessionForm (the builder)**

Create `components/admin/session-form.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Drill, SessionWithDrills } from '@/lib/types'
import type { SessionInput } from '@/lib/schemas'
import { slugify } from '@/lib/slug'
import { saveSession } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

type Item = { drill_id: string; note: string }
type PickerDrill = Pick<Drill, 'id' | 'title' | 'duration_minutes' | 'status'>

export function SessionForm({
  session,
  allDrills,
}: {
  session: SessionWithDrills | null
  allDrills: PickerDrill[]
}) {
  const [title, setTitle] = useState(session?.title ?? '')
  const [slug, setSlug] = useState(session?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(session))
  const [date, setDate] = useState(session?.session_date ?? '')
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [status, setStatus] = useState<SessionInput['status']>(session?.status ?? 'draft')
  const [items, setItems] = useState<Item[]>(
    session?.items.map((i) => ({ drill_id: i.drill.id, note: i.note ?? '' })) ?? []
  )
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const drillById = useMemo(() => new Map(allDrills.map((d) => [d.id, d])), [allDrills])

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return allDrills
      .filter((d) => d.title.toLowerCase().includes(q))
      .filter((d) => !items.some((i) => i.drill_id === d.id))
      .slice(0, 8)
  }, [search, allDrills, items])

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    const payload: SessionInput = {
      title,
      slug,
      session_date: date || null,
      notes,
      status,
      drills: items,
    }
    const result = await saveSession(session?.id ?? null, payload)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          required
          onChange={(e) => {
            setTitle(e.target.value)
            if (!slugTouched) setSlug(slugify(e.target.value))
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          required
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(e.target.value)
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="h-9 rounded-md border px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as SessionInput['status'])}
          >
            <option value="draft">Draft</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Intro notes (markdown)</Label>
        <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">Drills in this session</legend>

        {items.length === 0 && (
          <p className="text-sm text-neutral-500">No drills yet — search below to add.</p>
        )}

        <ol className="flex flex-col gap-3">
          {items.map((item, index) => {
            const drill = drillById.get(item.drill_id)
            return (
              <li key={item.drill_id} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{index + 1}.</span>
                  <span className="flex-1 font-medium">{drill?.title ?? 'Unknown drill'}</span>
                  {drill?.status === 'draft' && <Badge variant="secondary">draft</Badge>}
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)}>
                    ↑
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)}>
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                  >
                    ✕
                  </Button>
                </div>
                <Input
                  value={item.note}
                  placeholder="Session-specific note (optional)"
                  onChange={(e) =>
                    setItems(items.map((it, i) => (i === index ? { ...it, note: e.target.value } : it)))
                  }
                />
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-1">
          <Input
            value={search}
            placeholder="Search drills to add…"
            onChange={(e) => setSearch(e.target.value)}
          />
          {matches.length > 0 && (
            <ul className="flex flex-col rounded-md border">
              {matches.map((drill) => (
                <li key={drill.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100"
                    onClick={() => {
                      setItems([...items, { drill_id: drill.id, note: '' }])
                      setSearch('')
                    }}
                  >
                    <span className="flex-1">{drill.title}</span>
                    {drill.duration_minutes > 0 && (
                      <span className="text-xs text-neutral-500">{drill.duration_minutes} min</span>
                    )}
                    {drill.status === 'draft' && <Badge variant="secondary">draft</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save session'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Admin session pages**

Create `app/admin/sessions/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllSessions } from '@/lib/queries'
import { deleteSession } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminSessionsPage() {
  const sessions = await getAllSessions()

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sessions</h1>
        <Button asChild>
          <Link href="/admin/sessions/new">New session</Link>
        </Button>
      </div>
      <ul className="mt-4 flex flex-col divide-y">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-center gap-3 py-2 text-sm">
            <Link
              href={`/admin/sessions/${session.id}`}
              className="flex-1 font-medium hover:underline"
            >
              {session.title}
            </Link>
            {session.session_date && (
              <span className="text-neutral-500">{session.session_date}</span>
            )}
            <Badge variant={session.status === 'public' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
            <form
              action={async () => {
                'use server'
                await deleteSession(session.id)
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Delete
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

Create `app/admin/sessions/new/page.tsx`:

```tsx
import { getAllDrills } from '@/lib/queries'
import { SessionForm } from '@/components/admin/session-form'

export default async function NewSessionPage() {
  const allDrills = await getAllDrills()
  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">New session</h1>
      <SessionForm session={null} allDrills={allDrills} />
    </main>
  )
}
```

Create `app/admin/sessions/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getAllDrills, getSessionById } from '@/lib/queries'
import { SessionForm } from '@/components/admin/session-form'

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, allDrills] = await Promise.all([getSessionById(id), getAllDrills()])
  if (!session) notFound()

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">Edit session</h1>
      <SessionForm session={session} allDrills={allDrills} />
    </main>
  )
}
```

- [ ] **Step 4: Verify manually**

`npx tsc --noEmit` — no errors. In the browser:
1. Create a session, add two drills via search, reorder them, add a per-drill note, set status public. Expect redirect to `/admin/sessions`.
2. Open `/sessions/<its-slug>` — drills in chosen order, note highlighted, total duration shown.
3. Edit the session (remove a drill), save, confirm the public page updates.
4. Delete the session; confirm it leaves the home page but its drills still exist in `/admin/drills`.

- [ ] **Step 5: Commit**

```bash
git add lib/actions.ts app/admin/sessions components/admin/session-form.tsx
git commit -m "feat: add admin session builder with drill picker and reorder"
```

---

### Task 12: Playwright smoke test + deploy checklist

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (add `test:e2e` script), `.gitignore` (Playwright artifacts)

**Interfaces:**
- Consumes: seeded data from Task 2 (`rondo-4v2`, `sample-session`), running app with `.env.local`.
- Produces: `npm run test:e2e` smoke coverage of the two public page types.

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Config**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
```

Add to `package.json` scripts:

```json
"test:e2e": "playwright test"
```

Append to `.gitignore`:

```
test-results/
playwright-report/
```

- [ ] **Step 3: Write the smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('public drill page renders', async ({ page }) => {
  await page.goto('/drills/rondo-4v2')
  await expect(page.getByRole('heading', { level: 1, name: 'Rondo 4v2' })).toBeVisible()
  await expect(page.getByText('Focus points')).toBeVisible()
})

test('public session page renders drills in order with notes', async ({ page }) => {
  await page.goto('/sessions/sample-session')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sample Training Session' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Rondo 4v2' })).toBeVisible()
  await expect(page.getByText('weak foot only')).toBeVisible()
})

test('home page lists public sessions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Sample Training Session/ })).toBeVisible()
})
```

- [ ] **Step 4: Run the smoke test**

Run: `npm run test:e2e`
Expected: 3 passed. (Requires `.env.local` + seeded Supabase from Task 2.)

- [ ] **Step 5: Full verification sweep**

```bash
npm test          # unit tests pass
npx tsc --noEmit  # no type errors
npm run build     # production build succeeds
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e package.json .gitignore
git commit -m "test: add Playwright smoke tests for public pages"
```

- [ ] **Step 7: Deploy (manual, with the user)**

Ask the user to: create a GitHub repo and push `main`, import it in Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env settings, deploy, and verify `/sessions/sample-session` on the production URL renders on a phone.
