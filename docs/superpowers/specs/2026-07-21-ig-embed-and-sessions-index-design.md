# Official Instagram Embeds + Sessions Index — Design

**Date:** 2026-07-21
**Status:** Approved

## 1. Official Instagram embed format

Replace the bare `/embed` iframe with Instagram's official embed: a
`blockquote.instagram-media` (with `data-instgrm-captioned`) upgraded by
`https://www.instagram.com/embed.js`.

Why: playback behavior is identical (verified empirically — reels with
licensed music link out to Instagram either way), but the official format
renders the post caption (often the drill's coaching points) and sizes the
embed to its content.

Implementation:
- New client component `components/instagram-embed.tsx`: renders the
  blockquote from the stored URL (drills keep storing plain URLs — pasted
  HTML is never stored), loads `embed.js` once, and calls
  `window.instgrm.Embeds.process()` on mount so embeds hydrate after
  client-side navigation.
- `components/video-embed.tsx` Instagram branch delegates to it; YouTube and
  fallback-link branches unchanged. `lib/video.ts` unchanged (still detects
  the kind).
- No-JS fallback: the blockquote contains a plain "Katso Instagramissa" link.

## 2. `/sessions` index page

`/sessions` lists all public sessions, newest/upcoming first (session_date
descending, undated last — same order as the home page, via the existing
`getPublicSessions`).

- Shared `components/session-list.tsx` extracted from the home page; home
  and `/sessions` both render it (identical content, two stable URLs).
- Metadata title "Treenit"; smoke test added for the route.

## Out of scope

Nav changes, pagination, past/upcoming grouping.
