# Coaching CMS — Design

**Date:** 2026-07-20
**Status:** Approved

## Purpose

A personal tool for a football coach to create drills, bundle them into training
sessions, and share both publicly with players via login-free URLs. The private
editor can be crude; the public pages must be excellent, mobile-first.

## Stack

- **Next.js** (App Router, TypeScript), deployed to **Vercel**, code on GitHub
- **Supabase**: Postgres + Auth (email/password, single user)
- **Tailwind CSS + shadcn/ui** for styling and admin forms
- **@supabase/ssr** for server-side Supabase clients and auth cookies
- **zod** for form/action validation

## Architecture

One Next.js app serves both surfaces:

- **Public pages** are React Server Components fetching from Supabase on each
  request (no client-side data fetching). Fresh after every edit, fast on
  mobile, with OG meta tags for link previews in team chats.
- **Admin pages** live under `/admin/*`, gated by middleware that checks the
  Supabase auth session. Mutations go through server actions validated with
  zod, followed by `revalidatePath` so public pages update immediately.
- **Row Level Security** is the real enforcement layer; middleware is UX only.

## Data model

Four tables in Supabase Postgres.

### `drills`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | default `gen_random_uuid()` |
| `slug` | text unique | generated from title, editable |
| `title` | text | required |
| `description` | text | markdown |
| `purpose` | text | |
| `player_count` | text | free-form, e.g. "8–12" |
| `duration_minutes` | int | |
| `focus_points` | text[] | |
| `dos` | text[] | |
| `donts` | text[] | |
| `video_urls` | text[] | YouTube/Instagram; type detected from URL at render time |
| `tags` | text[] | GIN index; no separate tags table |
| `status` | text | `public` \| `draft`, default `draft` |
| `created_at`, `updated_at` | timestamptz | |

### `sessions`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `slug` | text unique | |
| `title` | text | required |
| `session_date` | date | nullable |
| `notes` | text | nullable markdown intro |
| `status` | text | `public` \| `draft`, default `draft` |
| `created_at`, `updated_at` | timestamptz | |

### `session_drills`

| Column | Type | Notes |
| --- | --- | --- |
| `session_id` | uuid FK → sessions | on delete cascade |
| `drill_id` | uuid FK → drills | on delete cascade |
| `position` | int | ordering within the session |
| `note` | text | nullable per-drill session note |

Primary key: (`session_id`, `drill_id`).

### RLS policies

- Anonymous: `SELECT` on drills and sessions where `status = 'public'`;
  `SELECT` on `session_drills` rows belonging to a public session, and on the
  drills those rows reference (so draft drills still render inside a public
  session — the session share is the point — while staying hidden from the
  public drill library and having no public drill page).
- Authenticated: full read/write on all three tables.

## Routes

### Public (mobile-first)

- `/` — home: public sessions newest-first (title + date), link to drill library
- `/drills` — public drill cards, filterable by tag via `/drills?tag=passing`
- `/drills/[slug]` — full drill page: title, purpose, description, player
  count, duration, focus points, dos/don'ts lists, embedded videos, tag chips,
  OG meta tags
- `/sessions/[slug]` — session page: title, date, intro notes, total duration
  (sum of drill durations) at the top, then each drill as a full card in order
  with its per-drill note highlighted

Readable slugs for both drills and sessions (e.g. `/drills/rondo-4v2`,
`/sessions/2026-07-22-u12-training`). Visibility is controlled by `status`,
not URL obscurity.

### Private (`/admin/*`)

- `/login` — Supabase email/password sign-in
- `/admin/drills` — table of all drills (drafts included), edit/delete
- `/admin/drills/new`, `/admin/drills/[id]` — one shared form component:
  text inputs, markdown textarea, list editors, tag input, status toggle,
  auto-slug from title
- `/admin/sessions`, `/admin/sessions/new`, `/admin/sessions/[id]` — session
  builder: metadata fields + drill picker (search all drills, add, reorder
  with up/down buttons, per-drill note field)

## Key components

- `DrillCard` — used in the library, session page, and admin picker
- `VideoEmbed` — parses a URL into a YouTube iframe or Instagram embed;
  unrecognized/broken URLs degrade to a plain external link
- `TagChip` — links to `/drills?tag=…`
- `ListFieldEditor` — add/remove/reorder text-list input shared by focus
  points, dos, don'ts, and video URLs
- `lib/queries.ts` — read layer (server Supabase client)
- `lib/actions.ts` — server actions for all mutations (zod-validated)

## Error handling

- Unknown or draft slugs → `notFound()` → friendly branded 404
- Form validation errors render inline (zod); Supabase errors surface as a
  toast in admin
- Video embeds that fail to parse fall back to a plain link

## Testing

Light, appropriate for a personal tool:

- Vitest unit tests for pure logic: slug generation, video-URL parsing,
  zod schemas
- One Playwright smoke test: a public drill page and a public session page
  render
- No test coverage of admin CRUD forms

## Out of scope (YAGNI)

- Multi-user / team accounts (RLS structure allows adding later)
- Pitch-diagram drawing tools — videos carry the visuals
- Normalized tags table, comments, analytics, search beyond tag filtering
