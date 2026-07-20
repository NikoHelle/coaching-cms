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
