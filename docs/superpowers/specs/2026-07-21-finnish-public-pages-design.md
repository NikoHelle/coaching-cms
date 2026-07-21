# Finnish Public Pages — Design

**Date:** 2026-07-21
**Status:** Approved

## Purpose

The public (non-admin) side renders in Finnish. Admin and login stay English.
Finnish only — no i18n framework, no catalog, no URL changes; strings are
replaced in place.

## Terminology

**harjoite** = drill, **treeni** = session. Applied consistently.

## String map

| Location | English | Finnish |
| --- | --- | --- |
| nav brand | ⚽ Coaching | ⚽ Valmennus |
| nav + drills page | Drill library | Harjoitepankki |
| home h1 | Training sessions | Treenit |
| home empty | No sessions published yet. | Treenejä ei ole vielä julkaistu. |
| drills empty | No drills found. | Harjoitteita ei löytynyt. |
| drills filter | Filtered by / clear | Suodatettu: / Tyhjennä |
| meta counts | {n} players / {n} min / {n} min total / {n} drills | {n} pelaajaa / {n} min / yhteensä {n} min / {n} harjoitetta |
| drill sections | Focus points / Do / Don't | Painopisteet / Tee näin / Vältä näitä |
| video fallback | Watch video: {url} | Katso video: {url} |
| iframe title | Drill video: {url} | Harjoitevideo: {url} |
| 404 | That one went over the bar / This page doesn't exist or isn't public. / Back to sessions | Se meni ohi maalin / Tätä sivua ei ole olemassa tai se ei ole julkinen. / Takaisin treeneihin |
| root metadata | Coaching CMS / Football drills and training sessions | Valmennus / Jalkapalloharjoitteet ja treenit |
| sr-only | " players" | " pelaajaa" |

## Additional changes

- `<html lang="fi">` on the root layout (admin inherits it; acceptable for a
  private tool).
- `session_date` formatted via `Intl.DateTimeFormat('fi-FI', { dateStyle:
  'long', timeZone: 'UTC' })` in a small `lib/format-date.ts` helper used by
  the home and session pages (closes the raw-date review finding; UTC pin
  keeps the date stable regardless of server timezone).
- Playwright smoke tests updated to the Finnish UI strings; data-derived
  assertions (drill/session titles, note text) unchanged.

## Out of scope

Language toggle, admin/login translation, translating user-authored content.
